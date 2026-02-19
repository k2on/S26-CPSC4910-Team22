import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { type options } from "@/convex/betterAuth/auth";
import { adminClient } from "better-auth/client/plugins";
import { ac, roles } from "@/lib/permissions";

export const authClient = createAuthClient({
  fetchOptions: {
    throw: true
  },
  plugins: [
    convexClient(),
    inferAdditionalFields<typeof options>(),
    adminClient({ ac, roles }),
  ],
})
