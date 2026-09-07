"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { LogIn, UserPlus } from "lucide-react";
import { useStore } from "@/lib/store-provider";
import { cls } from "@/lib/utils";
import { loginUser, registerCustomer } from "@/server/actions";

function AuthInner() {
  const { t, customer, getGuestWish, toast } = useStore();
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/account";
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  if (customer) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="card p-10">
          <div className="font-display text-xl font-bold text-cream-50">
            {customer.name}
          </div>
          <button
            onClick={() => router.push("/account")}
            className="btn-gold mt-6 w-full"
          >
            {t("account")}
          </button>
        </div>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!email.trim() || !password) {
      setErr(t("fill_all"));
      return;
    }
    if (mode === "register") {
      if (!name.trim()) {
        setErr(t("fill_all"));
        return;
      }
    }
    setBusy(true);
    const wish = getGuestWish();
    try {
      const r =
        mode === "login"
          ? await loginUser(email, password, wish)
          : await registerCustomer({ name, email, phone, password, guestWish: wish });
      if (r.ok) {
        toast(t("saved"));
        router.replace(next);
        router.refresh();
      } else {
        setErr(
          r.error === "auth_unavailable"
            ? "تعذر الاتصال بقاعدة البيانات، حاول مرة أخرى"
            : t(
                r.error === "email_exists"
                  ? "email_exists"
                  : r.error === "wrong_credentials"
                    ? "wrong_credentials"
                    : "fill_all"
              )
        );
      }
    } catch {
      setErr("تعذر الاتصال بقاعدة البيانات، حاول مرة أخرى");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-md place-items-center px-4 py-16">
      <div className="card w-full p-8">
        <div className="mb-6 grid grid-cols-2 rounded-full border border-line p-1">
          <button
            onClick={() => setMode("login")}
            className={cls(
              "flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-bold transition",
              mode === "login" ? "bg-gold-500 text-ink-950" : "text-cream-300"
            )}
          >
            <LogIn size={15} />
            {t("login")}
          </button>
          <button
            onClick={() => setMode("register")}
            className={cls(
              "flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-bold transition",
              mode === "register" ? "bg-gold-500 text-ink-950" : "text-cream-300"
            )}
          >
            <UserPlus size={15} />
            {t("create_account")}
          </button>
        </div>

        <h1 className="font-display text-2xl font-bold text-cream-50">
          {mode === "login" ? t("auth_login_t") : t("auth_reg_t")}
        </h1>
        <p className="mt-1 mb-6 text-xs text-cream-500">
          {mode === "login" ? t("auth_login_s") : t("auth_reg_s")}
        </p>

        <form onSubmit={submit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="label">{t("full_name")}</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder={t("ph_name")} />
            </div>
          )}
          <div>
            <label className="label">{t("email")}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              dir="ltr"
              placeholder="name@email.com"
            />
          </div>
          {mode === "register" && (
            <div>
              <label className="label">{t("phone")}</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input"
                dir="ltr"
                placeholder={t("ph_phone")}
              />
            </div>
          )}
          <div>
            <label className="label">{t("password")}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              dir="ltr"
              placeholder={t("ph_pass")}
            />
          </div>

          {err && (
            <div className="rounded-xl border border-bad/30 bg-bad/10 px-4 py-3 text-xs font-semibold text-bad">
              {err}
            </div>
          )}

          <button type="submit" disabled={busy} className="btn-gold w-full">
            {busy ? "..." : mode === "login" ? t("login") : t("create_account")}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-cream-500">
          {mode === "login" ? t("no_account") : t("have_account")}{" "}
          <button
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="font-bold text-gold-400 hover:underline"
          >
            {mode === "login" ? t("create_account") : t("login")}
          </button>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <AuthInner />
    </Suspense>
  );
}
