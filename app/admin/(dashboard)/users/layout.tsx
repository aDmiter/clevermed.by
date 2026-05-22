import { requirePermission } from "@/lib/auth/require-permission";

export default async function UsersSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePermission("USERS", false);
  return children;
}
