import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { api } from "./_generated/api";
import { authComponent, createAuth, createAuthOptions, options } from "./betterAuth/auth";
import { Organization } from "better-auth/plugins";
import { Doc } from "./_generated/dataModel";
import { Id } from "./betterAuth/_generated/dataModel";

// Write your Convex functions in any file inside this directory (`convex`).
// See https://docs.convex.dev/functions for more.

export const getNumbers = query({
  handler: async (ctx) => {
    return {
      numbers: await ctx.db.query("numbers").collect()
    }
  }
})

export const addNumber = mutation({
  args: {
    number: v.number()
  },
  handler: async (ctx, args) => {

  }
})

export const getAbout = query({
  handler: async (ctx) => {
    return {
      about: await ctx.db.query("aboutPageInfo").first()
    }
  }
})

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const getImageUrl = mutation({
  args: {
    id: v.id("_storage")
  },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.id)
  },
});

export const getMe = query({
  handler: async (ctx) => {
    return ctx.auth.getUserIdentity();
  }
})

export const getImpersonationData = query({
  handler: async (ctx) => {
    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
    const response = await auth.api.getSession({ headers });
    if (!response) return;

    if (!response.session.impersonatedBy) return;

    return {
      by: response.session.impersonatedBy,
      name: response.user.name,
    }
  }
})

export const getAuditLog = query({
  handler: async (ctx) => {
    return ctx.db.query("auditLog").collect();
  }
})


function parseOrg(org: any) {
  return {
    ...org,
    createdAt: org.createdAt ? new Date(org.createdAt).getTime() : null,
    logo: org.logo === "undefined" ? null : org.logo,
    metadata: org.metadata === "undefined" ? null : org.metadata,
    id: org.id as Id<"organization">
  };

}

export const getDriverApplications = query({
  handler: async (ctx) => {
    const authed = await ctx.auth.getUserIdentity();
    if (authed == null) return [];

    const apps = await ctx.db.query("driverApplication")
      .withIndex("by_user_id", q => q.eq("userId", authed.subject))
      .collect();

    const { auth } = await authComponent.getAuth(createAuth, ctx);
    const db = auth.options.database(auth.options);


    let newApps: { application: Doc<"driverApplication">, organization: typeof auth.$Infer.Organization }[] = [];

    for (const application of apps) {
      const organization = await db.findOne({
        model: "organization",
        where: [
          {
            field: "_id",
            value: application.orgId,
          }
        ],
      });
      if (!organization) continue;

      newApps.push({ organization: parseOrg(organization), application });
    }

    return newApps;
  }
})

export const applyForDriverApplication = mutation({
  args: {
    organizationId: v.string()
  },
  handler: async (ctx, args) => {
    const me = await ctx.auth.getUserIdentity();
    if (!me) throw new Error("You are not authed");

    await ctx.db.insert("driverApplication", {
      orgId: args.organizationId,
      status: 'waiting',
      userId: me.subject,
    })
  }
})

export const listOrgs = query({
  handler: async (ctx) => {
    const { auth } = await authComponent.getAuth(createAuth, ctx);
    const db = auth.options.database(auth.options);
    const allOrgs = await db.findMany({
      model: "organization",
      where: [],
    });
    return allOrgs.map(parseOrg);
  }
})
