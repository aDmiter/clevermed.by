"use client";

import type { AdminSection, UserRole } from "@/app/generated/prisma/client";
import {
  ADMIN_SECTION_META,
  PERMISSION_SECTIONS_ORDER,
  type SessionPermission,
} from "@/lib/auth/rbac";
import { createAdminUser, updateAdminUser } from "@/app/admin/(dashboard)/users/actions";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export type UserFormInitial = {
  id?: string;
  login: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  permissions: SessionPermission[];
};

type UserFormProps = {
  initial: UserFormInitial;
  canAssignSuperAdmin: boolean;
  mode: "create" | "edit";
};

export function UserForm({
  initial,
  canAssignSuperAdmin,
  mode,
}: UserFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<UserRole>(initial.role);

  const [permissions, setPermissions] = useState<Record<string, SessionPermission>>(
    () => {
      const map: Record<string, SessionPermission> = {};
      for (const section of PERMISSION_SECTIONS_ORDER) {
        const existing = initial.permissions.find((p) => p.section === section);
        map[section] = existing ?? {
          section,
          canRead: false,
          canWrite: false,
        };
      }
      return map;
    },
  );

  const permissionsPayload = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(permissions).map(([section, p]) => [
          section,
          { canRead: p.canRead, canWrite: p.canWrite },
        ]),
      ),
    [permissions],
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.set("permissions", JSON.stringify(permissionsPayload));
    formData.set("role", role);
    formData.set("isActive", formData.get("isActive") === "on" ? "true" : "false");

    const result =
      mode === "create"
        ? await createAdminUser(formData)
        : await updateAdminUser(initial.id!, formData);

    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.push("/admin/users");
    router.refresh();
  }

  function togglePermission(
    section: AdminSection,
    field: "canRead" | "canWrite",
    value: boolean,
  ) {
    setPermissions((prev) => {
      const next = { ...prev };
      const current = { ...next[section] };
      current[field] = value;
      if (field === "canWrite" && value) current.canRead = true;
      if (field === "canRead" && !value) current.canWrite = false;
      next[section] = current;
      return next;
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
      {error && (
        <p className="rounded-lg bg-accent-warmth/10 px-4 py-3 text-sm text-accent-warmth">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Логин *</span>
          <input
            name="login"
            required
            defaultValue={initial.login}
            pattern="[a-zA-Z0-9._-]{3,64}"
            className="w-full rounded-xl border border-neutral-border px-4 py-3"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Email *</span>
          <input
            name="email"
            type="email"
            required
            defaultValue={initial.email}
            className="w-full rounded-xl border border-neutral-border px-4 py-3"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Имя *</span>
          <input
            name="firstName"
            required
            defaultValue={initial.firstName}
            className="w-full rounded-xl border border-neutral-border px-4 py-3"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Фамилия *</span>
          <input
            name="lastName"
            required
            defaultValue={initial.lastName}
            className="w-full rounded-xl border border-neutral-border px-4 py-3"
          />
        </label>
      </div>

      <label className="block max-w-md">
        <span className="mb-1 block text-sm font-medium">
          {mode === "create" ? "Пароль *" : "Новый пароль (оставьте пустым, чтобы не менять)"}
        </span>
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          required={mode === "create"}
          className="w-full rounded-xl border border-neutral-border px-4 py-3"
        />
        <span className="mt-1 block text-xs text-primary-dark/50">
          Мин. 12 символов, заглавная и строчная буква, цифра, спецсимвол
        </span>
      </label>

      <div className="flex flex-wrap gap-6">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Роль</span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="rounded-xl border border-neutral-border px-4 py-3"
          >
            <option value="ADMIN">Администратор</option>
            {canAssignSuperAdmin && (
              <option value="SUPER_ADMIN">Суперадминистратор</option>
            )}
          </select>
        </label>

        <label className="flex items-center gap-2 pt-8">
          <input
            name="isActive"
            type="checkbox"
            defaultChecked={initial.isActive}
            className="h-4 w-4 rounded border-neutral-border"
          />
          <span className="text-sm font-medium">Активен</span>
        </label>
      </div>

      {role !== "SUPER_ADMIN" && (
        <div className="rounded-2xl border border-neutral-border bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-primary-dark">
            Права по разделам
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-border text-primary-dark/60">
                  <th className="py-2 pr-4">Раздел</th>
                  <th className="px-4 py-2">Просмотр</th>
                  <th className="px-4 py-2">Изменение</th>
                </tr>
              </thead>
              <tbody>
                {PERMISSION_SECTIONS_ORDER.map((section) => (
                  <tr key={section} className="border-b border-neutral-border/60">
                    <td className="py-3 pr-4">
                      <span className="font-medium text-primary-dark">
                        {ADMIN_SECTION_META[section].label}
                      </span>
                      <span className="mt-0.5 block text-xs text-primary-dark/50">
                        {ADMIN_SECTION_META[section].description}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={permissions[section]?.canRead ?? false}
                        onChange={(e) =>
                          togglePermission(section, "canRead", e.target.checked)
                        }
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={permissions[section]?.canWrite ?? false}
                        onChange={(e) =>
                          togglePermission(section, "canWrite", e.target.checked)
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {role === "SUPER_ADMIN" && (
        <p className="rounded-xl bg-secondary-mint/50 px-4 py-3 text-sm text-primary-dark/80">
          Суперадминистратор имеет неограниченный доступ ко всем разделам без
          отдельных прав.
        </p>
      )}

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={loading}
          className="rounded-full bg-primary-green px-8 hover:bg-primary-dark"
        >
          {loading ? "Сохранение…" : mode === "create" ? "Создать" : "Сохранить"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          onClick={() => router.back()}
        >
          Отмена
        </Button>
      </div>
    </form>
  );
}
