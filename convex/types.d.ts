import "convex/server";
import type { createAuth } from "./betterAuth/auth";
import type { AppRole } from "../lib/permissions";

type Auth = ReturnType<typeof createAuth>;
type User = Auth["$Infer"]["Session"]["user"];

declare module "convex/server" {
  interface UserIdentity extends Omit<User, "role"> {
    role: AppRole;
  }
}
