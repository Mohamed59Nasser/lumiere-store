import {
  pgTable,
  text,
  integer,
  boolean,
  doublePrecision,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  nameAr: text("name_ar").notNull(),
  nameEn: text("name_en").notNull(),
  slug: text("slug").notNull().unique(),
  sort: integer("sort").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const products = pgTable("products", {
  id: text("id").primaryKey(),
  nameAr: text("name_ar").notNull(),
  nameEn: text("name_en").notNull(),
  descAr: text("desc_ar").notNull().default(""),
  descEn: text("desc_en").notNull().default(""),
  categoryId: text("category_id")
    .notNull()
    .references(() => categories.id),
  price: doublePrecision("price").notNull().default(0),
  comparePrice: doublePrecision("compare_price"),
  mainImage: text("main_image").notNull().default(""),
  images: text("images").notNull().default("[]"), // JSON array of image urls
  featured: boolean("featured").notNull().default(false),
  bestSeller: boolean("best_seller").notNull().default(false),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const variants = pgTable(
  "variants",
  {
    id: text("id").primaryKey(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    labelAr: text("label_ar").notNull(),
    labelEn: text("label_en").notNull().default(""),
    price: doublePrecision("price").notNull(),
    stock: integer("stock").notNull().default(0),
    image: text("image"),
    active: boolean("active").notNull().default(true),
  },
  (t) => [index("variants_product_idx").on(t.productId)]
);

export const customers = pgTable("customers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull().default(""),
  passwordHash: text("password_hash").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orders = pgTable(
  "orders",
  {
    id: text("id").primaryKey(),
    orderNo: text("order_no").notNull().unique(),
    customerId: text("customer_id").references(() => customers.id, {
      onDelete: "set null",
    }),
    customerName: text("customer_name").notNull(),
    phone: text("phone").notNull(),
    address: text("address").notNull(),
    city: text("city").notNull().default(""),
    notes: text("notes").notNull().default(""),
    subtotal: doublePrecision("subtotal").notNull(),
    discount: doublePrecision("discount").notNull().default(0),
    couponCode: text("coupon_code"),
    shipping: doublePrecision("shipping").notNull().default(0),
    total: doublePrecision("total").notNull(),
    paymentMethod: text("payment_method").notNull(), // cod | wallet | instapay
    // cod | unconfirmed | confirmed | rejected | collected
    paymentStatus: text("payment_status").notNull().default("cod"),
    // new | preparing | shipping | delivered | cancelled
    status: text("status").notNull().default("new"),
    proofImage: text("proof_image"),
    proofSender: text("proof_sender").notNull().default(""),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("orders_status_idx").on(t.status),
    index("orders_created_idx").on(t.createdAt),
  ]
);

export const orderItems = pgTable("order_items", {
  id: text("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: text("product_id").references(() => products.id, {
    onDelete: "set null",
  }),
  variantId: text("variant_id").references(() => variants.id, {
    onDelete: "set null",
  }),
  productName: text("product_name").notNull(),
  variantLabel: text("variant_label").notNull().default(""),
  price: doublePrecision("price").notNull(),
  qty: integer("qty").notNull().default(1),
  image: text("image").notNull().default(""),
});

export const orderEvents = pgTable(
  "order_events",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    at: timestamp("at").notNull().defaultNow(),
  },
  (t) => [index("order_events_order_idx").on(t.orderId)]
);

export const coupons = pgTable("coupons", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  type: text("type").notNull().default("percent"), // percent | fixed
  value: doublePrecision("value").notNull(),
  minOrder: doublePrecision("min_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  usedCount: integer("used_count").notNull().default(0),
});

export const reviews = pgTable(
  "reviews",
  {
    id: text("id").primaryKey(),
    productId: text("product_id")
      .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
    customerId: text("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    customerName: text("customer_name").notNull(),
    rating: integer("rating").notNull(),
    comment: text("comment").notNull().default(""),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("reviews_product_customer_uq").on(t.productId, t.customerId)]
);

export const wishlist = pgTable(
  "wishlist",
  {
    id: text("id").primaryKey(),
    customerId: text("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("wishlist_customer_product_uq").on(t.customerId, t.productId)
  ]
);

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull().default(""),
});

export const admins = pgTable("admins", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
});

export const sessions = pgTable("sessions", {
  token: text("token").primaryKey(),
  kind: text("kind").notNull(), // customer | admin
  refId: text("ref_id").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});
