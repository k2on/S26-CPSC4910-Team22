import "better-auth/plugins";
import type { createAuth } from "@/convex/betterAuth/auth";
import type { AppRole } from "@/lib/permissions";

type Auth = ReturnType<typeof createAuth>;
type User = Auth["$Infer"]["Session"]["user"];

declare module "better-auth/plugins" {
  interface UserWithRole extends Omit<User, "role"> {
    role: AppRole;
  }
}
