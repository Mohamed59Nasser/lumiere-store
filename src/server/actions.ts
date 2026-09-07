"use server";

import { db } from "@/db";
import { databaseConfigured } from "@/db";
import * as s from "@/db/schema";
import { eq, and, desc, sql, ne, inArray } from "drizzle-orm";
import { createHash } from "crypto";
import {
  getSession,
  createSession,
  destroySession,
  normalizeUsername,
} from "@/lib/session";
import { uid } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import {
  deleteFirebaseProduct,
  firebaseConfigured,
  readFirebaseProducts,
  writeFirebaseProduct,
} from "@/lib/firebase-server";

const sha256 = (str: string) => createHash("sha256").update(str).digest("hex");

export type ActionResult = { ok: boolean; error?: string; [k: string]: unknown };

async function requireAdmin(): Promise<boolean> {
  const sess = await getSession();
  return !!sess && sess.kind === "admin";
}

async function requireCustomer(): Promise<string | null> {
  const sess = await getSession();
  if (!sess || sess.kind !== "customer") return null;
  const rows = await db
    .select()
    .from(s.customers)
    .where(eq(s.customers.id, sess.refId));
  if (!rows.length || !rows[0].active) return null;
  return rows[0].id;
}

/* ============ customer auth ============ */
export async function registerCustomer(input: {
  name: string;
  email: string;
  phone: string;
  password: string;
  guestWish?: string[];
}): Promise<ActionResult> {
  if (!databaseConfigured) return { ok: false, error: "database_unconfigured" };
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const phone = input.phone.trim();
  if (!name || !email || !input.password) return { ok: false, error: "fill_all" };
  if (input.password.length < 6) return { ok: false, error: "fill_all" };
  const existing = await db
    .select({ id: s.customers.id })
    .from(s.customers)
    .where(eq(s.customers.email, email));
  if (existing.length) return { ok: false, error: "email_exists" };
  const id = uid();
  await db.insert(s.customers).values({
    id,
    name,
    email,
    phone,
    passwordHash: sha256(input.password),
  });
  if (input.guestWish?.length) {
    for (const pid of input.guestWish.slice(0, 50)) {
      await db
        .insert(s.wishlist)
        .values({ id: uid(), customerId: id, productId: pid })
        .catch(() => null);
    }
  }
  if (!(await createSession("customer", id)))
    return { ok: false, error: "auth_unavailable" };
  return { ok: true };
}

export async function loginUser(
  email: string,
  password: string,
  guestWish?: string[]
): Promise<ActionResult> {
  if (!databaseConfigured) return { ok: false, error: "database_unconfigured" };
  const rows = await db
    .select()
    .from(s.customers)
    .where(eq(s.customers.email, email.trim().toLowerCase()));
  if (!rows.length || rows[0].passwordHash !== sha256(password))
    return { ok: false, error: "wrong_credentials" };
  if (!rows[0].active) return { ok: false, error: "wrong_credentials" };
  const c = rows[0];
  if (guestWish?.length) {
    for (const pid of guestWish.slice(0, 50)) {
      await db
        .insert(s.wishlist)
        .values({ id: uid(), customerId: c.id, productId: pid })
        .catch(() => null);
    }
  }
  if (!(await createSession("customer", c.id)))
    return { ok: false, error: "auth_unavailable" };
  return { ok: true };
}

export async function logout(): Promise<ActionResult> {
  await destroySession();
  return { ok: true };
}

export async function updateProfile(input: {
  name: string;
  phone: string;
  password?: string;
}): Promise<ActionResult> {
  const id = await requireCustomer();
  if (!id) return { ok: false, error: "forbidden" };
  const patch: Record<string, unknown> = {};
  if (input.name.trim()) patch.name = input.name.trim();
  if (input.phone.trim()) patch.phone = input.phone.trim();
  if (input.password && input.password.length >= 6)
    patch.passwordHash = sha256(input.password);
  await db.update(s.customers).set(patch).where(eq(s.customers.id, id));
  return { ok: true };
}

/* ============ wishlist & reviews ============ */
export async function toggleWishlist(productId: string): Promise<ActionResult> {
  const id = await requireCustomer();
  if (!id) return { ok: false, error: "forbidden" };
  const existing = await db
    .select()
    .from(s.wishlist)
    .where(and(eq(s.wishlist.customerId, id), eq(s.wishlist.productId, productId)));
  if (existing.length) {
    await db.delete(s.wishlist).where(eq(s.wishlist.id, existing[0].id));
    return { ok: true, on: false };
  }
  await db.insert(s.wishlist).values({ id: uid(), customerId: id, productId });
  return { ok: true, on: true };
}

export async function addReview(
  productId: string,
  rating: number,
  comment: string
): Promise<ActionResult> {
  const id = await requireCustomer();
  if (!id) return { ok: false, error: "forbidden" };
  const star = Math.min(5, Math.max(1, Math.round(rating)));
  const existing = await db
    .select()
    .from(s.reviews)
    .where(and(eq(s.reviews.productId, productId), eq(s.reviews.customerId, id)));
  if (existing.length) {
    await db
      .update(s.reviews)
      .set({ rating: star, comment: comment.trim(), })
      .where(eq(s.reviews.id, existing[0].id));
  } else {
    const cust = await db
      .select({ name: s.customers.name })
      .from(s.customers)
      .where(eq(s.customers.id, id));
    await db.insert(s.reviews).values({
      id: uid(),
      productId,
      customerId: id,
      customerName: cust[0]?.name ?? "عميلة لوميير",
      rating: star,
      comment: comment.trim(),
    });
  }
  return { ok: true };
}

/* ============ coupons & checkout ============ */
export async function validateCoupon(
  code: string,
  subtotal: number
): Promise<ActionResult> {
  const rows = await db
    .select()
    .from(s.coupons)
    .where(eq(s.coupons.code, code.trim().toUpperCase()));
  const cp = rows[0];
  if (!cp || !cp.active) return { ok: false, error: "coupon_bad" };
  if (subtotal < cp.minOrder)
    return { ok: false, error: "coupon_min", minOrder: cp.minOrder };
  const discount =
    cp.type === "percent"
      ? Math.round(subtotal * cp.value) / 100
      : Math.min(cp.value, subtotal);
  return { ok: true, discount: Math.round(discount) };
}

export type OrderItemInput = {
  productId: string;
  variantId: string;
  qty: number;
};

export async function placeOrder(input: {
  name: string;
  phone: string;
  address: string;
  city: string;
  notes: string;
  paymentMethod: string;
  proofImage?: string;
  proofSender?: string;
  couponCode?: string;
  items: OrderItemInput[];
}): Promise<ActionResult> {
  const customerId = await requireCustomer();
  if (!customerId) return { ok: false, error: "forbidden" };
  if (!input.items.length) return { ok: false, error: "fill_all" };
  if (!input.name.trim() || !input.phone.trim() || !input.address.trim())
    return { ok: false, error: "fill_all" };

  const settings = await db.select().from(s.settings);
  const smap: Record<string, string> = {};
  for (const r of settings) smap[r.key] = r.value;
  const shipFee = parseFloat(smap.shippingFee || "50");
  const freeShip = parseFloat(smap.freeShipThreshold || "1500");

  // fetch trusted prices
  const productIds = input.items.map((i) => i.productId);
  const variantIds = input.items.map((i) => i.variantId);
  const products = await db
    .select()
    .from(s.products)
    .where(inArray(s.products.id, productIds));
  const variants = await db
    .select()
    .from(s.variants)
    .where(inArray(s.variants.id, variantIds));
  const pMap = new Map(products.map((p) => [p.id, p]));
  const vMap = new Map(variants.map((v) => [v.id, v]));

  // stock check
  for (const it of input.items) {
    const v = vMap.get(it.variantId);
    if (!v || !v.active || v.stock < it.qty)
      return { ok: false, error: "out_of_stock" };
  }

  // compute totals from DB prices
  let subtotal = 0;
  const resolved = input.items.map((it) => {
    const v = vMap.get(it.variantId)!;
    const p = pMap.get(it.productId)!;
    subtotal += v.price * it.qty;
    return { it, v, p };
  });
  subtotal = Math.round(subtotal);

  // coupon
  let discount = 0;
  let couponCode: string | null = null;
  if (input.couponCode?.trim()) {
    const rows = await db
      .select()
      .from(s.coupons)
      .where(eq(s.coupons.code, input.couponCode.trim().toUpperCase()));
    const cp = rows[0];
    if (cp?.active && subtotal >= cp.minOrder) {
      couponCode = cp.code;
      discount =
        cp.type === "percent"
          ? Math.round(subtotal * cp.value) / 100
          : Math.min(cp.value, subtotal);
      await db
        .update(s.coupons)
        .set({ usedCount: sql`${s.coupons.usedCount} + 1` })
        .where(eq(s.coupons.id, cp.id));
    }
  }
  const afterDiscount = subtotal - discount;
  const shipping = afterDiscount >= freeShip ? 0 : shipFee;
  const total = Math.round(afterDiscount + shipping);

  const orderNo =
    "LM-" +
    Date.now().toString(36).toUpperCase().slice(-5) +
    Math.floor(10 + Math.random() * 89);
  const orderId = uid();
  const method = ["cod", "wallet", "instapay"].includes(input.paymentMethod)
    ? input.paymentMethod
    : "cod";
  const payStatus = method === "cod" ? "cod" : "unconfirmed";

  await db.insert(s.orders).values({
    id: orderId,
    orderNo,
    customerId,
    customerName: input.name.trim(),
    phone: input.phone.trim(),
    address: input.address.trim(),
    city: input.city.trim(),
    notes: input.notes.trim(),
    subtotal,
    discount,
    couponCode,
    shipping,
    total,
    paymentMethod: method,
    paymentStatus: payStatus,
    status: "new",
    proofImage: method === "cod" ? null : input.proofImage || null,
    proofSender: method === "cod" ? "" : input.proofSender || "",
  });

  for (const { it, v, p } of resolved) {
    await db.insert(s.orderItems).values({
      id: uid(),
      orderId,
      productId: p.id,
      variantId: v.id,
      productName: v.labelAr ? `${p.nameAr}` : p.nameAr,
      variantLabel: v.labelAr,
      price: v.price,
      qty: it.qty,
      image: v.image || p.mainImage,
    });
    await db
      .update(s.variants)
      .set({ stock: sql`${s.variants.stock} - ${it.qty}` })
      .where(eq(s.variants.id, v.id));
  }

  await db.insert(s.orderEvents).values({
    id: uid(),
    orderId,
    label: "تم استلام الطلب",
    at: new Date(),
  });
  return { ok: true, orderNo, orderId, total };
}

/* ============ admin auth ============ */
export async function adminLogin(
  username: string,
  password: string
): Promise<ActionResult> {
  const rows = await db.select().from(s.admins);
  const admin = rows.find(
    (a) => normalizeUsername(a.username) === normalizeUsername(username)
  );
  if (!admin || admin.passwordHash !== sha256(password))
    return { ok: false, error: "bad" };
  if (!(await createSession("admin", admin.id)))
    return { ok: false, error: "auth_unavailable" };
  return { ok: true };
}

export async function adminLogout(): Promise<ActionResult> {
  await destroySession();
  return { ok: true };
}

/* ============ products ============ */
export type VariantInput = {
  id?: string;
  labelAr: string;
  labelEn: string;
  price: number;
  stock: number;
  image?: string;
};

export async function saveProduct(input: {
  id?: string;
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
  categoryId: string;
  price: number;
  comparePrice?: number | null;
  mainImage: string;
  images: string[];
  featured: boolean;
  bestSeller: boolean;
  active: boolean;
  variants: VariantInput[];
}): Promise<ActionResult> {
  if (!(await requireAdmin())) return { ok: false, error: "forbidden" };
  if (!input.nameAr.trim() || !input.categoryId)
    return { ok: false, error: "fill" };
  const nameEn = input.nameEn.trim() || input.nameAr.trim();
  const images = input.images.filter(Boolean);
  const mainImage = input.mainImage || images[0] || "";
  const cleanVariants = input.variants
    .filter((v) => v.labelAr.trim() && v.price > 0)
    .map((v) => ({
      labelAr: v.labelAr.trim(),
      labelEn: v.labelEn.trim() || v.labelAr.trim(),
      price: Math.round(v.price),
      stock: Math.max(0, Math.round(v.stock)),
      image: v.image || null,
    }));
  if (cleanVariants.length === 0) return { ok: false, error: "fill" };
  const minPrice = Math.min(...cleanVariants.map((v) => v.price));

  if (firebaseConfigured) {
    const id = input.id ?? uid();
    await writeFirebaseProduct(id, {
      id,
      cat: input.categoryId,
      category: input.categoryId,
      name: input.nameAr.trim(),
      description: input.descAr,
      imageUrl: mainImage,
      price: minPrice,
      stock: cleanVariants.reduce((sum, variant) => sum + variant.stock, 0),
      old: input.comparePrice ? Math.round(input.comparePrice) : 0,
      feat: input.featured,
      active: input.active,
      isActive: input.active,
      en: { n: nameEn, d: input.descEn },
      ar: { n: input.nameAr.trim(), d: input.descAr },
      img: images,
      updatedAt: Date.now(),
    });
    revalidatePath("/", "layout");
    revalidatePath("/admin/products");
    return { ok: true };
  }

  if (input.id) {
    await db
      .update(s.products)
      .set({
        nameAr: input.nameAr.trim(),
        nameEn,
        descAr: input.descAr,
        descEn: input.descEn,
        categoryId: input.categoryId,
        price: minPrice,
        comparePrice: input.comparePrice ? Math.round(input.comparePrice) : null,
        mainImage,
        images: JSON.stringify(images),
        featured: input.featured,
        bestSeller: input.bestSeller,
        active: input.active,
      })
      .where(eq(s.products.id, input.id));
    await db.delete(s.variants).where(eq(s.variants.productId, input.id));
    for (const v of cleanVariants) {
      await db.insert(s.variants).values({
        id: uid(),
        productId: input.id,
        ...v,
      });
    }
  } else {
    const id = uid();
    await db.insert(s.products).values({
      id,
      nameAr: input.nameAr.trim(),
      nameEn,
      descAr: input.descAr,
      descEn: input.descEn,
      categoryId: input.categoryId,
      price: minPrice,
      comparePrice: input.comparePrice ? Math.round(input.comparePrice) : null,
      mainImage,
      images: JSON.stringify(images),
      featured: input.featured,
      bestSeller: input.bestSeller,
      active: input.active,
    });
    for (const v of cleanVariants) {
      await db.insert(s.variants).values({ id: uid(), productId: id, ...v });
    }
  }
  revalidatePath("/", "layout");
  revalidatePath("/admin/products");
  return { ok: true };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  if (!(await requireAdmin())) return { ok: false, error: "forbidden" };
  if (firebaseConfigured) {
    await deleteFirebaseProduct(id);
    revalidatePath("/", "layout");
    revalidatePath("/admin/products");
    return { ok: true };
  }
  await db.delete(s.variants).where(eq(s.variants.productId, id));
  await db.delete(s.products).where(eq(s.products.id, id));
  revalidatePath("/", "layout");
  revalidatePath("/admin/products");
  return { ok: true };
}

export async function toggleProduct(id: string): Promise<ActionResult> {
  if (!(await requireAdmin())) return { ok: false, error: "forbidden" };
  if (firebaseConfigured) {
    const products = await readFirebaseProducts();
    const product = products?.[id];
    if (!product) return { ok: false };
    const active = product.active === false;
    await writeFirebaseProduct(id, { ...product, active, updatedAt: Date.now() });
    revalidatePath("/", "layout");
    revalidatePath("/admin/products");
    return { ok: true, active };
  }
  const rows = await db.select().from(s.products).where(eq(s.products.id, id));
  if (!rows.length) return { ok: false };
  await db
    .update(s.products)
    .set({ active: !rows[0].active })
    .where(eq(s.products.id, id));
  revalidatePath("/", "layout");
  revalidatePath("/admin/products");
  return { ok: true, active: !rows[0].active };
}

/* ============ categories ============ */
export async function saveCategory(input: {
  id?: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  sort: number;
}): Promise<ActionResult> {
  if (!(await requireAdmin())) return { ok: false, error: "forbidden" };
  if (!input.nameAr.trim()) return { ok: false, error: "fill" };
  const slug =
    input.slug.trim() ||
    input.nameEn.trim().toLowerCase().replace(/\s+/g, "-") ||
    "cat-" + Date.now().toString(36);
  if (input.id) {
    await db
      .update(s.categories)
      .set({
        nameAr: input.nameAr.trim(),
        nameEn: input.nameEn.trim() || input.nameAr.trim(),
        slug,
        sort: input.sort,
      })
      .where(eq(s.categories.id, input.id));
  } else {
    await db
      .insert(s.categories)
      .values({
        id: uid(),
        nameAr: input.nameAr.trim(),
        nameEn: input.nameEn.trim() || input.nameAr.trim(),
        slug,
        sort: input.sort,
      })
      .catch(() => null);
  }
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  if (!(await requireAdmin())) return { ok: false, error: "forbidden" };
  const count = await db
    .select({ n: sql<number>`count(*)` })
    .from(s.products)
    .where(eq(s.products.categoryId, id));
  if ((count[0]?.n ?? 0) > 0) return { ok: false, error: "has_products" };
  await db.delete(s.categories).where(eq(s.categories.id, id));
  return { ok: true };
}

/* ============ orders (admin) ============ */
const STATUS_LABEL: Record<string, string> = {
  new: "تم استلام الطلب",
  preparing: "قيد التجهيز",
  shipping: "جاري التوصيل",
  delivered: "تم التسليم",
  cancelled: "تم إلغاء الطلب",
};

export async function setOrderStatus(
  orderId: string,
  status: string
): Promise<ActionResult> {
  if (!(await requireAdmin())) return { ok: false, error: "forbidden" };
  const rows = await db
    .select()
    .from(s.orders)
    .where(eq(s.orders.id, orderId));
  if (!rows.length) return { ok: false };
  const order = rows[0];
  if (!["new", "preparing", "shipping", "delivered", "cancelled"].includes(status))
    return { ok: false };

  await db
    .update(s.orders)
    .set({
      status,
      updatedAt: new Date(),
      ...(status === "delivered" && order.paymentMethod === "cod"
        ? { paymentStatus: "collected" }
        : {}),
    })
    .where(eq(s.orders.id, orderId));

  // restock on cancel
  if (status === "cancelled") {
    const items = await db
      .select()
      .from(s.orderItems)
      .where(eq(s.orderItems.orderId, orderId));
    for (const it of items) {
      if (it.variantId) {
        await db
          .update(s.variants)
          .set({ stock: sql`${s.variants.stock} + ${it.qty}` })
          .where(eq(s.variants.id, it.variantId))
          .catch(() => null);
      }
    }
  }
  await db.insert(s.orderEvents).values({
    id: uid(),
    orderId,
    label: STATUS_LABEL[status] ?? status,
    at: new Date(),
  });
  return { ok: true };
}

export async function confirmPayment(orderId: string): Promise<ActionResult> {
  if (!(await requireAdmin())) return { ok: false, error: "forbidden" };
  await db
    .update(s.orders)
    .set({ paymentStatus: "confirmed", updatedAt: new Date() })
    .where(eq(s.orders.id, orderId));
  await db.insert(s.orderEvents).values({
    id: uid(),
    orderId,
    label: "تم تأكيد الدفع",
    at: new Date(),
  });
  return { ok: true };
}

export async function rejectPayment(orderId: string): Promise<ActionResult> {
  if (!(await requireAdmin())) return { ok: false, error: "forbidden" };
  await db
    .update(s.orders)
    .set({ paymentStatus: "rejected", updatedAt: new Date() })
    .where(eq(s.orders.id, orderId));
  await db.insert(s.orderEvents).values({
    id: uid(),
    orderId,
    label: "تم رفض الدفع — بانتظار إعادة التحويل",
    at: new Date(),
  });
  return { ok: true };
}

/* ============ customers (admin) ============ */
export async function deleteCustomer(id: string): Promise<ActionResult> {
  if (!(await requireAdmin())) return { ok: false, error: "forbidden" };
  await db
    .update(s.customers)
    .set({ active: false })
    .where(eq(s.customers.id, id));
  const sess = await getSession();
  if (sess?.kind === "customer" && sess.refId === id) await destroySession();
  await db.delete(s.sessions).where(eq(s.sessions.refId, id)).catch(() => null);
  return { ok: true };
}

/* ============ coupons (admin) ============ */
export async function saveCoupon(input: {
  id?: string;
  code: string;
  type: string;
  value: number;
  minOrder: number;
  active: boolean;
}): Promise<ActionResult> {
  if (!(await requireAdmin())) return { ok: false, error: "forbidden" };
  const code = input.code.trim().toUpperCase();
  if (!code || input.value <= 0) return { ok: false, error: "fill" };
  if (input.id) {
    await db
      .update(s.coupons)
      .set({
        code,
        type: input.type === "fixed" ? "fixed" : "percent",
        value: input.value,
        minOrder: input.minOrder || 0,
        active: input.active,
      })
      .where(eq(s.coupons.id, input.id));
  } else {
    await db
      .insert(s.coupons)
      .values({
        id: uid(),
        code,
        type: input.type === "fixed" ? "fixed" : "percent",
        value: input.value,
        minOrder: input.minOrder || 0,
        active: input.active,
      })
      .catch(() => null);
  }
  return { ok: true };
}

export async function deleteCoupon(id: string): Promise<ActionResult> {
  if (!(await requireAdmin())) return { ok: false, error: "forbidden" };
  await db.delete(s.coupons).where(eq(s.coupons.id, id));
  return { ok: true };
}

export async function toggleCoupon(id: string): Promise<ActionResult> {
  if (!(await requireAdmin())) return { ok: false, error: "forbidden" };
  const rows = await db.select().from(s.coupons).where(eq(s.coupons.id, id));
  if (!rows.length) return { ok: false };
  await db
    .update(s.coupons)
    .set({ active: !rows[0].active })
    .where(eq(s.coupons.id, id));
  return { ok: true, active: !rows[0].active };
}

/* ============ settings (admin) ============ */
export async function saveSettings(
  values: Record<string, string>
): Promise<ActionResult> {
  if (!(await requireAdmin())) return { ok: false, error: "forbidden" };
  for (const [k, v] of Object.entries(values)) {
    if (!k) continue;
    const existing = await db
      .select()
      .from(s.settings)
      .where(eq(s.settings.key, k));
    if (existing.length) {
      await db.update(s.settings).set({ value: String(v) }).where(eq(s.settings.key, k));
    } else {
      await db.insert(s.settings).values({ key: k, value: String(v) });
    }
  }
  return { ok: true };
}
