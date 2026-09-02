import type { CategoryInfo, ProductInfo, VariantInfo } from "./queries";

const categories: CategoryInfo[] = [
  { id: "c1", nameAr: "سلاسل", nameEn: "Necklaces", slug: "necklaces", sort: 1, count: 2, thumb: "/images/necklace-gold.jpg" },
  { id: "c2", nameAr: "خواتم", nameEn: "Rings", slug: "rings", sort: 2, count: 2, thumb: "/images/ring-gold.jpg" },
  { id: "c3", nameAr: "أقراط", nameEn: "Earrings", slug: "earrings", sort: 3, count: 2, thumb: "/images/earrings-gold.jpg" },
  { id: "c4", nameAr: "أساور", nameEn: "Bracelets", slug: "bracelets", sort: 4, count: 2, thumb: "/images/bracelet-gold.jpg" },
];

const definitions = [
  ["p1", "سلسلة النجمة الذهبية", "Golden Star Necklace", "c1", 380, null, "/images/necklace-gold.jpg", ["/images/necklace-gold.jpg", "/images/necklace-silver.jpg"], true, true, [["v1", "ذهبي", "Gold", 450, 15, "/images/necklace-gold.jpg"], ["v2", "فضي", "Silver", 380, 12, "/images/necklace-silver.jpg"]]],
  ["p2", "سلسلة الدانة الماسية", "Diamond Drop Necklace", "c1", 750, 950, "/images/necklace-gold.jpg", ["/images/necklace-gold.jpg"], true, false, [["v3", "ذهبي", "Gold", 750, 8, "/images/necklace-gold.jpg"]]],
  ["p3", "خاتم إيفي المتشابك", "Ivy Twist Ring", "c2", 280, null, "/images/ring-gold.jpg", ["/images/ring-gold.jpg", "/images/ring-silver.jpg"], true, true, [["v4", "ذهبي", "Gold", 320, 20, "/images/ring-gold.jpg"], ["v5", "فضي", "Silver", 280, 18, "/images/ring-silver.jpg"]]],
  ["p4", "خاتم الملكي المضلع", "Royal Facet Ring", "c2", 520, null, "/images/ring-gold.jpg", ["/images/ring-gold.jpg"], false, false, [["v6", "ذهبي", "Gold", 520, 10, "/images/ring-gold.jpg"], ["v7", "روز جولد", "Rose Gold", 560, 8, "/images/ring-gold.jpg"]]],
  ["p5", "أقراط الكريستال الدام", "Crystal Drop Earrings", "c3", 220, null, "/images/earrings-gold.jpg", ["/images/earrings-gold.jpg", "/images/earrings-silver.jpg"], true, true, [["v8", "ذهبي", "Gold", 260, 25, "/images/earrings-gold.jpg"], ["v9", "فضي", "Silver", 220, 22, "/images/earrings-silver.jpg"]]],
  ["p6", "أسورة النسيم", "Breeze Bracelet", "c4", 420, null, "/images/bracelet-gold.jpg", ["/images/bracelet-gold.jpg", "/images/bracelet-silver.jpg"], true, true, [["v10", "ذهبي", "Gold", 480, 14, "/images/bracelet-gold.jpg"], ["v11", "فضي", "Silver", 420, 14, "/images/bracelet-silver.jpg"]]],
  ["p7", "أسورة السحر المفتوح", "Open Charm Bracelet", "c4", 390, null, "/images/bracelet-gold.jpg", ["/images/bracelet-gold.jpg"], false, false, [["v12", "ذهبي", "Gold", 390, 16, "/images/bracelet-gold.jpg"]]],
  ["p8", "أقراط الؤلؤ الكلاسيكية", "Classic Pearl Earrings", "c3", 300, null, "/images/earrings-silver.jpg", ["/images/earrings-silver.jpg"], false, false, [["v13", "فضي", "Silver", 300, 20, "/images/earrings-silver.jpg"]]],
] as const;

const products: ProductInfo[] = definitions.map((definition, index) => {
  const [id, nameAr, nameEn, categoryId, price, comparePrice, mainImage, images, featured, bestSeller, variantDefinitions] = definition;
  const category = categories.find((item) => item.id === categoryId);
  const variants: VariantInfo[] = variantDefinitions.map(([variantId, labelAr, labelEn, variantPrice, stock, image]) => ({
    id: variantId,
    labelAr,
    labelEn,
    price: variantPrice,
    stock,
    image,
    active: true,
  }));
  return {
    id,
    nameAr,
    nameEn,
    descAr: "قطعة أنيقة بتفاصيل ناعمة مناسبة للإطلالات اليومية والمناسبات.",
    descEn: "A refined piece with delicate details, perfect for everyday wear and special occasions.",
    categoryId,
    categoryAr: category?.nameAr ?? "",
    categoryEn: category?.nameEn ?? "",
    price,
    comparePrice,
    mainImage,
    images: [...images],
    featured,
    bestSeller,
    active: true,
    createdAt: new Date(`2026-08-${String(20 - index).padStart(2, "0")}`),
    rating: 0,
    ratingCount: 0,
    sold: 0,
    totalStock: variants.reduce((sum, variant) => sum + variant.stock, 0),
    variants,
  };
});

export function getLocalCatalog() {
  return { products, categories };
}
