import { createClient } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import type { GenericCtx } from "@convex-dev/better-auth/utils";
import { betterAuth, type BetterAuthOptions } from "better-auth";
import { DataModel } from "../_generated/dataModel";
import { components } from "../_generated/api";
import authConfig from "../auth.config";
import schema from "./schema";
import { admin, organization } from "better-auth/plugins";
import { ac, roles } from "../../lib/permissions";
import { Resend } from 'resend';

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
      sendResetPassword: async ({ user, url, token }, request) => {
        const resend = new Resend(process.env.RESEND_KEY);
        await resend.emails.send({
          from: 'noreply@team22.cpsc4911.com',
          to: user.email,
          subject: 'Password Reset',
          html: `Here is your <a href="https://team22.cpsc4911.com/reset-password/${token}">password reset link</a>.`
        })
      }
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
      }),
      organization({
        schema: {
          organization: {
            additionalFields: {
              pointValue: {
                type: "number",
                required: true,
                defaultValue: 0.01
              }
            }
          }
        }
      })
    ]
  } satisfies BetterAuthOptions;
}

export const options = createAuthOptions({} as GenericCtx<DataModel>);

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth(createAuthOptions(ctx));
}
