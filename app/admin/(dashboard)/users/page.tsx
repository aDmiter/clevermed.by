import { unlockAdminUser } from "@/app/admin/(dashboard)/users/actions";
import {
  canAssignSuperAdmin,
  canManageUsers,
  isSuperAdmin,
} from "@/lib/auth/rbac";
import { requirePermission } from "@/lib/auth/require-permission";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminUsersPage() {
  const actor = await requirePermission("USERS", false);
  const canWrite = canManageUsers(actor);
  const showSuperAdminRole = canAssignSuperAdmin(actor);

  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { lastName: "asc" }],
    include: { permissions: true },
  });

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary-dark">Пользователи</h1>
          <p className="mt-2 text-primary-dark/60">
            Учётные записи админ-панели, роли и права доступа к разделам
          </p>
        </div>
        {canWrite && (
          <Link
            href="/admin/users/new"
            className="rounded-full bg-primary-green px-6 py-3 text-sm font-medium text-white hover:bg-primary-dark"
          >
            + Новый пользователь
          </Link>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-bg text-primary-dark/70">
            <tr>
              <th className="px-4 py-3">ФИО</th>
              <th className="px-4 py-3">Логин</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Роль</th>
              <th className="px-4 py-3">Статус</th>
              <th className="px-4 py-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const locked =
                user.lockedUntil && user.lockedUntil.getTime() > Date.now();
              const canEditThis =
                canWrite &&
                (showSuperAdminRole || user.role !== "SUPER_ADMIN");

              return (
                <tr key={user.id} className="border-t border-neutral-border">
                  <td className="px-4 py-3 font-medium">
                    {user.lastName} {user.firstName}
                  </td>
                  <td className="px-4 py-3">{user.login}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">
                    {isSuperAdmin(user.role) ? (
                      <span className="rounded-full bg-primary-green/10 px-2 py-1 text-xs font-semibold text-primary-green">
                        Суперадмин
                      </span>
                    ) : (
                      <span className="text-primary-dark/70">Администратор</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {!user.isActive && (
                      <span className="text-accent-warmth">Отключён</span>
                    )}
                    {user.isActive && locked && (
                      <span className="text-accent-warmth">Заблокирован</span>
                    )}
                    {user.isActive && !locked && (
                      <span className="text-primary-green">Активен</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {canEditThis && (
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="text-primary-green hover:underline"
                        >
                          Изменить
                        </Link>
                      )}
                      {canWrite && locked && (
                        <form
                          action={async () => {
                            "use server";
                            await unlockAdminUser(user.id);
                          }}
                        >
                          <button
                            type="submit"
                            className="text-primary-dark/60 hover:text-primary-dark"
                          >
                            Разблокировать
                          </button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
