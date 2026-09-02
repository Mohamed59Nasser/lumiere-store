"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { translate } from "./i18n";
import type { Lang } from "./utils";
import { toggleWishlist } from "@/server/actions";

export type CartItem = {
  variantId: string;
  productId: string;
  nameAr: string;
  nameEn: string;
  variantLabelAr: string;
  variantLabelEn: string;
  price: number;
  image: string;
  qty: number;
  stock: number;
};

type Toast = { id: number; msg: string; type: "ok" | "err" };

type Ctx = {
  lang: Lang;
  dir: "rtl" | "ltr";
  setLang: (l: Lang) => void;
  t: (k: string, vars?: Record<string, string | number>) => string;
  settings: Record<string, string>;
  customer: { id: string; name: string; email: string; phone: string } | null;
  cart: CartItem[];
  cartReady: boolean;
  addToCart: (item: Omit<CartItem, "qty">, qty?: number) => void;
  setQty: (variantId: string, qty: number) => void;
  removeItem: (variantId: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  wishlist: string[];
  toggleWish: (productId: string) => void;
  getGuestWish: () => string[];
  toasts: Toast[];
  toast: (msg: string, type?: "ok" | "err") => void;
};

const StoreCtx = createContext<Ctx | null>(null);

const CART_KEY = "lumiere_cart";
const WISH_KEY = "lumiere_wish";
const LANG_KEY = "lumiere_lang";

export function StoreProvider({
  children,
  customer,
  wishlistIds,
  settings,
}: {
  children: ReactNode;
  customer: { id: string; name: string; email: string; phone: string } | null;
  wishlistIds: string[];
  settings: Record<string, string>;
}) {
  const [lang, setLangState] = useState<Lang>("ar");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartReady, setCartReady] = useState(false);
  const [wishLocal, setWishLocal] = useState<string[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  /* lang */
  useEffect(() => {
    const l = (localStorage.getItem(LANG_KEY) as Lang) || "ar";
    setLangState(l);
  }, []);
  const dir: "rtl" | "ltr" = lang === "ar" ? "rtl" : "ltr";
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch {
      /* ignore */
    }
  }, [lang, dir]);

  /* cart hydration */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (raw) setCart(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setCartReady(true);
  }, []);
  useEffect(() => {
    if (!cartReady) return;
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      /* ignore */
    }
  }, [cart, cartReady]);

  /* guest wishlist hydration */
  useEffect(() => {
    if (customer) return;
    try {
      const raw = localStorage.getItem(WISH_KEY);
      if (raw) setWishLocal(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, [customer]);

  const toast = useCallback((msg: string, type: "ok" | "err" = "ok") => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }, []);

  const t = useCallback(
    (k: string, vars?: Record<string, string | number>) =>
      translate(lang, k, vars),
    [lang]
  );

  const addToCart = useCallback(
    (item: Omit<CartItem, "qty">, qty = 1) => {
      setCart((prev) => {
        const ex = prev.find((i) => i.variantId === item.variantId);
        if (ex) {
          return prev.map((i) =>
            i.variantId === item.variantId
              ? { ...i, qty: Math.min(i.stock, i.qty + qty) }
              : i
          );
        }
        return [
          ...prev,
          { ...item, qty: Math.min(item.stock, qty) },
        ];
      });
      toast(translate(lang, "added_cart"));
    },
    [lang, toast]
  );

  const setQty = useCallback((variantId: string, qty: number) => {
    setCart((prev) =>
      prev.map((i) =>
        i.variantId === variantId
          ? { ...i, qty: Math.max(1, Math.min(i.stock, qty)) }
          : i
      )
    );
  }, []);

  const removeItem = useCallback(
    (variantId: string) => {
      setCart((prev) => prev.filter((i) => i.variantId !== variantId));
      toast(translate(lang, "removed"));
    },
    [lang, toast]
  );

  const clearCart = useCallback(() => setCart([]), []);

  const wishlist = useMemo(
    () => (customer ? wishlistIds : wishLocal),
    [customer, wishlistIds, wishLocal]
  );

  const toggleWish = useCallback(
    (productId: string) => {
      if (!customer) {
        setWishLocal((prev) => {
          const on = prev.includes(productId);
          const next = on
            ? prev.filter((x) => x !== productId)
            : [...prev, productId];
          try {
            localStorage.setItem(WISH_KEY, JSON.stringify(next));
          } catch {
            /* ignore */
          }
          toast(
            translate(lang, on ? "wish_removed" : "wish_added"),
            "ok"
          );
          return next;
        });
        return;
      }
      const on = wishlist.includes(productId);
      setWishLocal((prev) =>
        on ? prev.filter((x) => x !== productId) : [...prev, productId]
      );
      toast(translate(lang, on ? "wish_removed" : "wish_added"));
      toggleWishlist(productId).then(() => {
        // refresh server-side wishlist via router refresh handled by callers
        if (typeof window !== "undefined")
          window.dispatchEvent(new Event("lumiere:wish"));
      });
    },
    [customer, wishlist, lang, toast]
  );

  const getGuestWish = useCallback(() => {
    try {
      const raw = localStorage.getItem(WISH_KEY);
      if (raw) {
        const arr = JSON.parse(raw);
        localStorage.removeItem(WISH_KEY);
        return arr as string[];
      }
    } catch {
      /* ignore */
    }
    return [];
  }, []);

  const cartCount = cart.reduce((a, i) => a + i.qty, 0);
  const cartSubtotal = cart.reduce((a, i) => a + i.price * i.qty, 0);

  const value: Ctx = {
    lang,
    dir,
    setLang: setLangState,
    t,
    settings,
    customer,
    cart,
    cartReady,
    addToCart,
    setQty,
    removeItem,
    clearCart,
    cartCount,
    cartSubtotal,
    wishlist,
    toggleWish,
    getGuestWish,
    toasts,
    toast,
  };

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore(): Ctx {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
