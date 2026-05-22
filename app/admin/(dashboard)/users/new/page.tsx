import { UserForm } from "@/components/admin/user-form";
import {
  canAssignSuperAdmin,
  emptyPermissions,
} from "@/lib/auth/rbac";
import { requirePermission } from "@/lib/auth/require-permission";

export default async function NewAdminUserPage() {
  const actor = await requirePermission("USERS", true);

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold text-primary-dark">
        Новый пользователь
      </h1>
      <UserForm
        mode="create"
        canAssignSuperAdmin={canAssignSuperAdmin(actor)}
        initial={{
          login: "",
          email: "",
          firstName: "",
          lastName: "",
          role: "ADMIN",
          isActive: true,
          permissions: emptyPermissions(),
        }}
      />
    </div>
  );
}
