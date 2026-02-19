import { createClient } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import type { GenericCtx } from "@convex-dev/better-auth/utils";
import { betterAuth, type BetterAuthOptions } from "better-auth";
import { DataModel } from "../_generated/dataModel";
import { components } from "../_generated/api";
import authConfig from "../auth.config";
import schema from "./schema";
import { admin } from "better-auth/plugins";
import { ac, roles } from "../../lib/permissions";

export const authComponent = createClient<DataModel, typeof schema>(
  components.betterAuth,
  {
    local: { schema },
    verbose: false,
  }
);

export const createAuthOptions = (ctx: GenericCtx<DataModel>) => {
  return {
    appName: "My App",
    baseURL: process.env.SITE_URL,
    secret: process.env.BETTER_AUTH_SECRET,
    trustedOrigins: ['http://localhost:3000'],
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
    },
    user: {
      changeEmail: {
        enabled: true,
        updateEmailWithoutVerification: true
      },
      additionalFields: {
        role: {
          type: "string",
          defaultValue: "driver",
        },
        address: {
          type: "string",
          required: false,
        },
        imageBorderColor: {
          type: "string",
          defaultValue: "black"
        }
      }
    },
    plugins: [
      convex({ authConfig }),
      admin({
        ac,
        roles,
        defaultRole: "driver",
        allowImpersonatingAdmins: true
      })
    ]
  } satisfies BetterAuthOptions;
}

export const options = createAuthOptions({} as GenericCtx<DataModel>);

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth(createAuthOptions(ctx));
}
