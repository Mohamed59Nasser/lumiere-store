import { db } from "@/db";
import * as s from "@/db/schema";
import { desc, eq, inArray, ne, and, sql, asc, or, ilike } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { databaseConfigured } from "@/db";
import { getLocalCatalog } from "./local-catalog";
import {
  firebaseConfigured,
  mapFirebaseProducts,
  readFirebaseProducts,
} from "@/lib/firebase-server";

/* ---------- shared types ---------- */
export type VariantInfo = {
  id: string;
  labelAr: string;
  labelEn: string;
  price: number;
  stock: number;
  image: string | null;
  active: boolean;
};
export type ProductInfo = {
  id: string;
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
  categoryId: string;
  categoryAr: string;
  categoryEn: string;
  price: number; // min variant price (fallback base)
  comparePrice: number | null;
  mainImage: string;
  images: string[];
  featured: boolean;
  bestSeller: boolean;
  active: boolean;
  createdAt: Date;
  rating: number;
  ratingCount: number;
  sold: number;
  totalStock: number;
  variants: VariantInfo[];
};
export type CategoryInfo = {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  sort: number;
  count: number;
  thumb: string;
};
export type CustomerPublic = { id: string; name: string; email: string; phone: string };

/* ---------- helpers ---------- */
export async function getSettingsMap(): Promise<Record<string, string>> {
  const rows = await db.select().from(s.settings);
  const map: Record<string, string> = {};
  for (const r of rows) map[r.key] = r.value;
  return map;
}

type RawProduct = typeof s.products.$inferSelect;
type RawVariant = typeof s.variants.$inferSelect;

function buildProducts(
  products: RawProduct[],
  allVariants: RawVariant[],
  cats: typeof s.categories.$inferSelect[],
  reviewAgg: Map<string, { sum: number; n: number }>,
  soldMap: Map<string, number>
): ProductInfo[] {
  const catMap = new Map(cats.map((c) => [c.id, c]));
  return products.map((p) => {
    const vs = allVariants.filter(
      (v) => v.productId === p.id && v.active
    ).sort((a, b) => a.price - b.price);
    const activeVs = vs;
    const minPrice = activeVs.length ? Math.min(...activeVs.map((v) => v.price)) : p.price;
    const totalStock = activeVs.reduce((a, v) => a + Math.max(0, v.stock), 0);
    const ra = reviewAgg.get(p.id);
    const cat = catMap.get(p.categoryId);
    let images: string[] = [];
    try {
      images = JSON.parse(p.images || "[]");
    } catch {
      images = [];
    }
    if (p.mainImage && !images.includes(p.mainImage)) images.unshift(p.mainImage);
    return {
      id: p.id,
      nameAr: p.nameAr,
      nameEn: p.nameEn,
      descAr: p.descAr,
      descEn: p.descEn,
      categoryId: p.categoryId,
      categoryAr: cat?.nameAr ?? "",
      categoryEn: cat?.nameEn ?? "",
      price: minPrice,
      comparePrice: p.comparePrice,
      mainImage: p.mainImage || images[0] || "",
      images,
      featured: p.featured,
      bestSeller: p.bestSeller,
      active: p.active,
      createdAt: p.createdAt,
      rating: ra && ra.n ? Math.round((ra.sum / ra.n) * 10) / 10 : 0,
      ratingCount: ra?.n ?? 0,
      sold: soldMap.get(p.id) ?? 0,
      totalStock,
      variants: activeVs.map((v) => ({
        id: v.id,
        labelAr: v.labelAr,
        labelEn: v.labelEn,
        price: v.price,
        stock: v.stock,
        image: v.image,
        active: v.active,
      })),
    };
  });
}

async function baseAggregates() {
  const reviews = await db.select().from(s.reviews);
  const reviewAgg = new Map<string, { sum: number; n: number }>();
  for (const r of reviews) {
    const cur = reviewAgg.get(r.productId) ?? { sum: 0, n: 0 };
    cur.sum += r.rating;
    cur.n += 1;
    reviewAgg.set(r.productId, cur);
  }
  const items = await db
    .select({ pid: s.orderItems.productId, qty: s.orderItems.qty, orderId: s.orderItems.orderId })
    .from(s.orderItems)
    .innerJoin(s.orders, eq(s.orderItems.orderId, s.orders.id));
  const cancelled = new Set(
    items.filter(() => false)
  );
  const orderStatus = await db
    .select({ id: s.orders.id, status: s.orders.status })
    .from(s.orders);
  const statusMap = new Map(orderStatus.map((o) => [o.id, o.status]));
  const soldMap = new Map<string, number>();
  for (const it of items) {
    if (!it.pid) continue;
    if (statusMap.get(it.orderId) === "cancelled") continue;
    soldMap.set(it.pid, (soldMap.get(it.pid) ?? 0) + it.qty);
  }
  return { reviewAgg, soldMap };
}

export async function getAllProducts(includeInactive = false): Promise<ProductInfo[]> {
  if (firebaseConfigured) {
    const firebaseProducts = await readFirebaseProducts();
    if (firebaseProducts) {
      const products = mapFirebaseProducts(firebaseProducts);
      return includeInactive ? products : products.filter((p) => p.active);
    }
  }
  if (!databaseConfigured) {
    const products = getLocalCatalog().products;
    return includeInactive ? products : products.filter((p) => p.active);
  }
  try {
    const [products, allVariants, cats] = await Promise.all([
      db.select().from(s.products).orderBy(desc(s.products.createdAt)),
      db.select().from(s.variants),
      db.select().from(s.categories),
    ]);
    const { reviewAgg, soldMap } = await baseAggregates();
    const list = includeInactive ? products : products.filter((p) => p.active);
    return buildProducts(list, allVariants, cats, reviewAgg, soldMap);
  } catch {
    const products = getLocalCatalog().products;
    return includeInactive ? products : products.filter((p) => p.active);
  }
}

export async function getCategories(): Promise<CategoryInfo[]> {
  if (firebaseConfigured) {
    const firebaseProducts = await readFirebaseProducts();
    if (firebaseProducts) {
      const products = mapFirebaseProducts(firebaseProducts).filter((p) => p.active);
      const labels: Record<string, [string, string, number]> = {
        rings: ["خواتم", "Rings", 1],
        necklaces: ["عقود", "Necklaces", 2],
        earrings: ["أقراط", "Earrings", 3],
        bracelets: ["أساور", "Bracelets", 4],
        bridal: ["زفاف", "Bridal", 5],
        pearls: ["لؤلؤ", "Pearls", 6],
      };
      return Object.entries(
        products.reduce<Record<string, ProductInfo[]>>((groups, product) => {
          (groups[product.categoryId] ??= []).push(product);
          return groups;
        }, {})
      ).map(([id, items]) => {
        const [nameAr, nameEn, sort] = labels[id] ?? [id, id, 99];
        return { id, nameAr, nameEn, slug: id, sort, count: items.length, thumb: items[0].mainImage };
      }).sort((a, b) => a.sort - b.sort);
    }
  }
  if (!databaseConfigured) return getLocalCatalog().categories;
  try {
    const [cats, products] = await Promise.all([
      db.select().from(s.categories).orderBy(asc(s.categories.sort)),
      db.select().from(s.products),
    ]);
    return cats
      .map((c) => {
        const inCat = products.filter((p) => p.categoryId === c.id && p.active);
        return {
          id: c.id,
          nameAr: c.nameAr,
          nameEn: c.nameEn,
          slug: c.slug,
          sort: c.sort,
          count: inCat.length,
          thumb: inCat[0]?.mainImage ?? "",
        };
      })
      .filter((c) => c.count > 0);
  } catch {
    return getLocalCatalog().categories;
  }
}

/* ---------- public / store ---------- */
export async function getStoreContext() {
  const sess = await getSession();
  let customer: CustomerPublic | null = null;
  let wishlistIds: string[] = [];
  if (sess?.kind === "customer") {
    const rows = await db
      .select()
      .from(s.customers)
      .where(eq(s.customers.id, sess.refId));
    if (rows.length && rows[0].active) {
      const c = rows[0];
      customer = { id: c.id, name: c.name, email: c.email, phone: c.phone };
      const wl = await db
        .select()
        .from(s.wishlist)
        .where(eq(s.wishlist.customerId, c.id));
      wishlistIds = wl.map((w) => w.productId);
    }
  }
  const settings = await getSettingsMap();
  return { customer, wishlistIds, settings };
}

export async function getHomeData() {
  const [products, cats] = await Promise.all([getAllProducts(), getCategories()]);
  const featured = products.filter((p) => p.featured).slice(0, 8);
  const newArrivals = [...products]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 8);
  const best = [...products].sort((a, b) => b.sold - a.sold).slice(0, 8);
  return {
    categories: cats,
    featured: featured.length ? featured : products.slice(0, 8),
    newArrivals,
    best: best.length ? best : products.slice(0, 8),
  };
}

export async function getShopData(q?: string, cat?: string) {
  let products = await getAllProducts();
  let cats = await getCategories();
  if (cat) products = products.filter((p) => p.categoryId === cat);
  if (q) {
    const needle = q.trim();
    products = products.filter(
      (p) =>
        p.nameAr.includes(needle) ||
        p.nameEn.toLowerCase().includes(needle.toLowerCase()) ||
        p.descAr.includes(needle)
    );
  }
  return { products, categories: cats };
}

export async function getProductData(id: string) {
  const products = await getAllProducts();
  const product = products.find((p) => p.id === id && p.active) ?? null;
  const related = product
    ? products.filter((p) => p.categoryId === product.categoryId && p.id !== id).slice(0, 4)
    : [];
  let reviews: {
    id: string;
    customerName: string;
    rating: number;
    comment: string;
    createdAt: Date;
  }[] = [];
  let myReview: { rating: number; comment: string } | null = null;
  if (product) {
    try {
      reviews = await db
        .select()
        .from(s.reviews)
        .where(eq(s.reviews.productId, id))
        .orderBy(desc(s.reviews.createdAt))
        .limit(30);
      const sess = await getSession();
      if (sess?.kind === "customer") {
        const mine = await db
          .select()
          .from(s.reviews)
          .where(
            and(eq(s.reviews.productId, id), eq(s.reviews.customerId, sess.refId))
          );
        if (mine.length)
          myReview = { rating: mine[0].rating, comment: mine[0].comment };
      }
    } catch {}
  }
  return { product, related, reviews, myReview };
}

export async function getCheckoutData() {
  const sess = await getSession();
  let customer: CustomerPublic | null = null;
  if (sess?.kind === "customer") {
    const rows = await db
      .select()
      .from(s.customers)
      .where(eq(s.customers.id, sess.refId));
    if (rows.length && rows[0].active)
      customer = {
        id: rows[0].id,
        name: rows[0].name,
        email: rows[0].email,
        phone: rows[0].phone,
      };
  }
  const settings = await getSettingsMap();
  return { customer, settings };
}

export async function getAccountData() {
  const sess = await getSession();
  if (!sess || sess.kind !== "customer") return null;
  const rows = await db
    .select()
    .from(s.customers)
    .where(eq(s.customers.id, sess.refId));
  if (!rows.length || !rows[0].active) return null;
  const c = rows[0];
  const orders = await db
    .select()
    .from(s.orders)
    .where(eq(s.orders.customerId, c.id))
    .orderBy(desc(s.orders.createdAt));
  const items = await db
    .select()
    .from(s.orderItems)
    .where(inArray(s.orderItems.orderId, orders.map((o) => o.id)));
  const wl = await db
    .select()
    .from(s.wishlist)
    .where(eq(s.wishlist.customerId, c.id));
  const allProducts = await getAllProducts();
  const wishlistProducts = allProducts.filter((p) =>
    wl.some((w) => w.productId === p.id)
  );
  return {
    customer: { id: c.id, name: c.name, email: c.email, phone: c.phone },
    orders: orders.map((o) => ({
      ...o,
      items: items.filter((i) => i.orderId === o.id),
    })),
    wishlist: wishlistProducts,
  };
}

export async function getOrderData(id: string) {
  const orders = await db
    .select()
    .from(s.orders)
    .where(eq(s.orders.id, id));
  if (!orders.length) return null;
  const order = orders[0];
  const items = await db
    .select()
    .from(s.orderItems)
    .where(eq(s.orderItems.orderId, id));
  const events = await db
    .select()
    .from(s.orderEvents)
    .where(eq(s.orderEvents.orderId, id))
    .orderBy(asc(s.orderEvents.at));
  return { order, items, events };
}

/* ---------- admin ---------- */
export async function getAdminSession(): Promise<{ name: string } | null> {
  const sess = await getSession();
  if (!sess || sess.kind !== "admin") return null;
  const rows = await db.select().from(s.admins).where(eq(s.admins.id, sess.refId));
  if (!rows.length) return null;
  return { name: rows[0].name };
}

export type OrderWithItems = (typeof s.orders.$inferSelect) & {
  items: (typeof s.orderItems.$inferSelect)[];
};

export async function getAdminOrders(tab?: string, q?: string): Promise<OrderWithItems[]> {
  let orders = await db.select().from(s.orders).orderBy(desc(s.orders.createdAt));
  const items = await db.select().from(s.orderItems);
  const withItems: OrderWithItems[] = orders.map((o) => ({
    ...o,
    items: items.filter((i) => i.orderId === o.id),
  }));
  if (tab === "pending_pay")
    return withItems.filter((o) => o.paymentStatus === "unconfirmed");
  if (tab && ["new", "preparing", "shipping", "delivered", "cancelled"].includes(tab))
    return withItems.filter((o) => o.status === tab);
  if (q) {
    const needle = q.trim().toLowerCase();
    return withItems.filter(
      (o) =>
        o.orderNo.toLowerCase().includes(needle) ||
        o.customerName.toLowerCase().includes(needle) ||
        o.phone.includes(needle)
    );
  }
  return withItems;
}

export async function getAdminOrder(id: string) {
  const order = (
    await db.select().from(s.orders).where(eq(s.orders.id, id))
  )[0] ?? null;
  if (!order) return null;
  const items = await db
    .select()
    .from(s.orderItems)
    .where(eq(s.orderItems.orderId, id));
  const events = await db
    .select()
    .from(s.orderEvents)
    .where(eq(s.orderEvents.orderId, id))
    .orderBy(asc(s.orderEvents.at));
  return { order, items, events };
}

export async function getDashboardData() {
  const [orders, customers, products, items] = await Promise.all([
    db.select().from(s.orders).orderBy(desc(s.orders.createdAt)),
    db.select().from(s.customers),
    db.select().from(s.products),
    db.select().from(s.orderItems),
  ]);
  const active = orders.filter((o) => o.status !== "cancelled");
  const revenue = active.reduce((a, o) => a + o.total, 0);
  const collected = active
    .filter((o) => o.paymentStatus === "confirmed" || o.paymentStatus === "collected")
    .reduce((a, o) => a + o.total, 0);
  const pending = active.filter((o) => o.paymentStatus === "unconfirmed");
  const pendingSum = pending.reduce((a, o) => a + o.total, 0);
  const today = new Date().toDateString();
  const todayCount = orders.filter(
    (o) => new Date(o.createdAt).toDateString() === today
  ).length;

  // 14-day chart
  const days: { label: string; total: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toDateString();
    const total = active
      .filter((o) => new Date(o.createdAt).toDateString() === key)
      .reduce((a, o) => a + o.total, 0);
    days.push({ label: `${d.getDate()}/${d.getMonth() + 1}`, total });
  }

  // payment breakdown
  const methods = [
    { key: "cod", label: "كاش عند الاستلام" },
    { key: "wallet", label: "محفظة" },
    { key: "instapay", label: "انستا باي" },
  ];
  const byMethod = methods.map((m) => {
    const list = active.filter((o) => o.paymentMethod === m.key);
    const sum = list.reduce((a, o) => a + o.total, 0);
    const collectedSum = list
      .filter((o) => o.paymentStatus === "confirmed" || o.paymentStatus === "collected")
      .reduce((a, o) => a + o.total, 0);
    return { ...m, count: list.length, sum, collectedSum };
  });

  // top products
  const topMap = new Map<string, { name: string; qty: number; revenue: number }>();
  for (const it of items) {
    const o = orders.find((x) => x.id === it.orderId);
    if (!o || o.status === "cancelled") continue;
    const cur = topMap.get(it.productName) ?? { name: it.productName, qty: 0, revenue: 0 };
    cur.qty += it.qty;
    cur.revenue += it.price * it.qty;
    topMap.set(it.productName, cur);
  }
  const top = [...topMap.values()].sort((a, b) => b.qty - a.qty).slice(0, 5);

  return {
    revenue,
    collected,
    pendingCount: pending.length,
    pendingSum,
    todayCount,
    customerCount: customers.length,
    productCount: products.length,
    days,
    byMethod,
    top,
    recent: orders.slice(0, 6),
  };
}

export async function getAdminCustomers() {
  const [customers, orders] = await Promise.all([
    db.select().from(s.customers).orderBy(desc(s.customers.createdAt)),
    db.select().from(s.orders).orderBy(desc(s.orders.createdAt)),
  ]);
  return customers.map((c) => {
    const cOrders = orders.filter(
      (o) => o.customerId === c.id && o.status !== "cancelled"
    );
    return {
      ...c,
      orderCount: cOrders.length,
      spend: cOrders.reduce((a, o) => a + o.total, 0),
      lastOrder: cOrders[0]?.createdAt ?? null,
      orders: orders.filter((o) => o.customerId === c.id).slice(0, 8),
    };
  });
}

export async function getAdminCoupons() {
  return db.select().from(s.coupons).orderBy(desc(s.coupons.code));
}

export async function getAdminCategories() {
  const [cats, products] = await Promise.all([
    db.select().from(s.categories).orderBy(asc(s.categories.sort)),
    db.select().from(s.products),
  ]);
  return cats.map((c) => ({
    ...c,
    count: products.filter((p) => p.categoryId === c.id).length,
  }));
}

export async function getAdminProduct(id: string) {
  const products = await db.select().from(s.products);
  const p = products.find((x) => x.id === id) ?? null;
  const vs = await db.select().from(s.variants);
  const cats = await db.select().from(s.categories);
  return {
    product: p,
    variants: vs.filter((v) => v.productId === id),
    categories: cats,
  };
}
