export type Lang = "ar" | "en";

export function uid(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID)
    return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function fmtMoney(n: number, lang: Lang = "ar"): string {
  const v = Math.round(n).toLocaleString("en-US");
  return lang === "ar" ? `${v} ج.م` : `EGP ${v}`;
}

export function fmtDate(iso: string | Date, lang: Lang = "ar"): string {
  const d = new Date(iso);
  return d.toLocaleDateString(lang === "ar" ? "ar-EG-u-nu-latn" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function fmtDateTime(iso: string | Date, lang: Lang = "ar"): string {
  const d = new Date(iso);
  return d.toLocaleString(lang === "ar" ? "ar-EG-u-nu-latn" : "en-GB", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function cls(
  ...xs: (string | false | null | undefined)[]
): string {
  return xs.filter(Boolean).join(" ");
}

export function validPhone(p: string): boolean {
  return /^01[0-9]{9}$/.test(p.replace(/[\s-]/g, ""));
}

/** Read a file as data URL (client) */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

/** Resize an image file to a compressed data URL (client) */
export async function resizeImageFile(
  file: File,
  maxDim = 1100,
  quality = 0.82
): Promise<string> {
  const dataUrl = await fileToDataUrl(file);
  if (typeof window === "undefined") return dataUrl;
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        const scale = Math.min(maxDim / width, maxDim / height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(dataUrl);
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export const PAY_METHODS = ["cod", "wallet", "instapay"] as const;
export type PayMethod = (typeof PAY_METHODS)[number];

export const ORDER_STATUSES = [
  "new",
  "preparing",
  "shipping",
  "delivered",
  "cancelled",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];
