import { UserForm } from "@/components/admin/user-form";
import { canAssignSuperAdmin } from "@/lib/auth/rbac";
import { requirePermission } from "@/lib/auth/require-permission";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

export default async function EditAdminUserPage({ params }: Props) {
  const actor = await requirePermission("USERS", true);
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: { permissions: true },
  });

  if (!user) notFound();

  if (user.role === "SUPER_ADMIN" && !canAssignSuperAdmin(actor)) {
    redirect("/admin/users?error=forbidden");
  }

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold text-primary-dark">
        Редактирование: {user.lastName} {user.firstName}
      </h1>
      <UserForm
        mode="edit"
        canAssignSuperAdmin={canAssignSuperAdmin(actor)}
        initial={{
          id: user.id,
          login: user.login,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isActive: user.isActive,
          permissions: user.permissions.map((p) => ({
            section: p.section,
            canRead: p.canRead,
            canWrite: p.canWrite,
          })),
        }}
      />
    </div>
  );
}
