"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Gem, KeyRound, User } from "lucide-react";
import { adminLogin } from "@/server/actions";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    const r = await adminLogin(username, password);
    setBusy(false);
    if (r.ok) {
      router.replace("/admin");
      router.refresh();
    } else {
      setErr("بيانات الدخول مش صحيحة");
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-ink-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-gold-500/15 text-gold-400">
            <Gem size={26} />
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold text-cream-50">
            لوميير
          </h1>
          <p className="mt-1 text-xs text-cream-500">لوحة الإدارة</p>
        </div>
        <form onSubmit={submit} className="card space-y-4 p-6">
          <div>
            <label className="label">اسم المستخدم</label>
            <div className="relative">
              <User
                size={15}
                className="absolute top-1/2 right-3.5 -translate-y-1/2 text-cream-500"
              />
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input !pr-10"
                placeholder="mohamed"
              />
            </div>
          </div>
          <div>
            <label className="label">كلمة السر</label>
            <div className="relative">
              <KeyRound
                size={15}
                className="absolute top-1/2 right-3.5 -translate-y-1/2 text-cream-500"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input !pr-10"
                placeholder="••••••••"
              />
            </div>
          </div>
          {err && (
            <div className="rounded-xl border border-bad/30 bg-bad/10 px-4 py-3 text-xs font-bold text-bad">
              {err}
            </div>
          )}
          <button type="submit" disabled={busy} className="btn-gold w-full">
            {busy ? "..." : "دخول"}
          </button>
        </form>
      </div>
    </div>
  );
}
