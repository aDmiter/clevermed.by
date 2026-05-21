"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";

function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(
          "Неверный email или пароль. Проверьте ADMIN_EMAIL и ADMIN_PASSWORD в .env или выполните npm run db:seed.",
        );
        return;
      }

      if (!result?.ok) {
        setError("Не удалось войти. Проверьте AUTH_SECRET и AUTH_URL в .env (порт 3002).");
        return;
      }

      const callback = searchParams.get("callbackUrl") ?? "/admin";
      window.location.href = callback;
    } catch {
      setError("Ошибка сети при входе. Убедитесь, что сервер запущен (npm run dev).");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md rounded-[2rem] border border-white/80 bg-white/70 p-8 shadow-lg backdrop-blur-[15px]"
    >
      <h1 className="mb-2 text-2xl font-bold text-primary-dark">
        Вход в админ-панель
      </h1>
      <p className="mb-8 text-sm text-primary-dark/60">Clevermed CMS</p>

      {error && (
        <p className="mb-4 rounded-lg bg-accent-warmth/10 px-3 py-2 text-sm text-accent-warmth">
          {error}
        </p>
      )}

      <label className="mb-4 block">
        <span className="mb-1 block text-sm font-medium">Email</span>
        <input
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-neutral-border bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-primary-green/30"
        />
      </label>

      <label className="mb-6 block">
        <span className="mb-1 block text-sm font-medium">Пароль</span>
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-neutral-border bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-primary-green/30"
        />
      </label>

      <Button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-primary-green py-6 hover:bg-primary-dark"
      >
        {loading ? "Вход…" : "Войти"}
      </Button>

      <p className="mt-6 text-center text-xs text-primary-dark/50">
        В dev можно войти с учётными данными из .env, даже если MySQL ещё не
        настроен.
      </p>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <Suspense fallback={<div className="text-primary-dark/60">Загрузка…</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
