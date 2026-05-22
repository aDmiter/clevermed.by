import type { UserRole } from "@/app/generated/prisma/client";
import type { SessionPermission } from "@/lib/auth/rbac";
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      login: string;
      email: string | null;
      firstName: string;
      lastName: string;
      name: string;
      role: UserRole;
      permissions: SessionPermission[];
    };
  }

  interface User {
    id: string;
    login: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    permissions: SessionPermission[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    login?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    role?: UserRole;
    permissions?: SessionPermission[];
  }
}
