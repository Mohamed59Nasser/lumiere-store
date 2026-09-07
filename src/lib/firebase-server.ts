import type { ProductInfo, VariantInfo } from "@/server/queries";

const databaseUrl =
  process.env.FIREBASE_DATABASE_URL ||
  "https://mohamed-a9564-default-rtdb.firebaseio.com";

export const firebaseConfigured = (() => {
  try {
    const url = new URL(databaseUrl);
    return (
      url.protocol === "https:" &&
      (url.hostname.endsWith("firebasedatabase.app") ||
        url.hostname.endsWith("firebaseio.com"))
    );
  } catch {
    return false;
  }
})();

type FirebaseProduct = {
  id?: string | number;
  cat?: string;
  category?: string;
  name?: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  stock?: number;
  old?: number;
  rate?: number;
  rev?: number;
  feat?: boolean | number;
  active?: boolean;
  isActive?: boolean;
  en?: { n?: string; s?: string; d?: string };
  ar?: { n?: string; s?: string; d?: string };
  img?: string[];
  updatedAt?: number | string;
  createdAt?: number | string;
};

type FirebaseProducts = Record<string, FirebaseProduct>;

function endpoint(path: string) {
  return `${databaseUrl.replace(/\/$/, "")}/${path}.json`;
}

export async function readFirebaseProducts(): Promise<FirebaseProducts | null> {
  try {
    const response = await fetch(endpoint("products"), { cache: "no-store" });
    if (!response.ok) return null;
    const value = (await response.json()) as FirebaseProducts | null;
    return value ?? {};
  } catch {
    return null;
  }
}

export async function writeFirebaseProduct(id: string, product: FirebaseProduct) {
  const response = await fetch(endpoint(`products/${encodeURIComponent(id)}`), {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(product),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Firebase write failed: ${response.status}`);
}

export async function deleteFirebaseProduct(id: string) {
  const response = await fetch(endpoint(`products/${encodeURIComponent(id)}`), {
    method: "DELETE",
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Firebase delete failed: ${response.status}`);
}

export function mapFirebaseProducts(data: FirebaseProducts): ProductInfo[] {
  return Object.entries(data)
    .filter(([, raw]) => Boolean(raw))
    .map(([key, raw], index) => {
    const id = String(raw.id ?? key);
    const category = raw.category || raw.cat || "uncategorized";
    const categoryIds: Record<string, string> = {
      سلاسل: "necklaces",
      عقود: "necklaces",
      خواتم: "rings",
      حلقان: "earrings",
      أقراط: "earrings",
      أساور: "bracelets",
    };
    const categoryId = categoryIds[category] || category;
    const images = Array.from(
      new Set(
        (Array.isArray(raw.img) ? raw.img : []).concat(raw.imageUrl || []).filter(Boolean)
      )
    );
    const mainImage = images[0] ?? "";
    const price = Number(raw.price) || 0;
    const active = raw.active !== undefined ? raw.active : raw.isActive !== false;
    const stock = Math.max(0, Number(raw.stock) || 0);
    const timestamp = typeof raw.createdAt === "string"
      ? Date.parse(raw.createdAt)
      : Number(raw.createdAt || raw.updatedAt);
    const variant: VariantInfo = {
      id: `${id}-default`,
      labelAr: "الأساسي",
      labelEn: "Standard",
      price,
      stock,
      image: mainImage || null,
      active,
    };
    return {
      id,
      nameAr: raw.name || raw.ar?.n || raw.en?.n || id,
      nameEn: raw.en?.n || raw.name || raw.ar?.n || id,
      descAr: raw.description || raw.ar?.d || raw.ar?.s || "",
      descEn: raw.en?.d || raw.en?.s || raw.description || "",
      categoryId,
      categoryAr: category,
      categoryEn: category,
      price,
      comparePrice: Number(raw.old) > 0 ? Number(raw.old) : null,
      mainImage,
      images,
      featured: Boolean(raw.feat),
      bestSeller: false,
      active,
      createdAt: new Date(timestamp || Date.now() - index),
      rating: Number(raw.rate) || 0,
      ratingCount: Number(raw.rev) || 0,
      sold: 0,
      totalStock: stock,
      variants: [variant],
    } satisfies ProductInfo;
    });
}
