import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { components } from "./_generated/api";
import { authComponent, createAuth } from "./betterAuth/auth";

const visibleOrganizationDriverValidator = v.object({
  userId: v.string(),
  name: v.string(),
  email: v.string(),
  points: v.number(),
  active: v.boolean(),
  suspended: v.boolean(),
  suspensionEnd: v.optional(v.union(v.null(), v.number())),
  banReason: v.optional(v.union(v.null(), v.string())),
});

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

function getOrgAccess(identity: { subject: string; role?: string | null }) {
  const canAccessAll = identity.role === "admin";
  return {
    currentUserId: identity.subject,
    canAccessAll,
  };
}

export const getVisibleOrganizations = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity || (identity.role !== "admin" && identity.role !== "sponsor")) {
      return [];
    }

    const access = getOrgAccess(identity);

    return await ctx.runQuery(
        components.betterAuth.organizations.listVisibleOrganizations,
        access
    );
  }
})

export const getVisibleOrganizationBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity || (identity.role !== "admin" && identity.role !== "sponsor")) {
      return null;
    }

    const access = getOrgAccess(identity);

    return await ctx.runQuery(
        components.betterAuth.organizations.getVisibleOrganizationBySlug,
        {
          slug: args.slug,
          ...access,
        }
    );
  }
})

export const getVisibleOrganizationMembersBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity || (identity.role !== "admin" && identity.role !== "sponsor")) {
      return [];
    }

    const access = getOrgAccess(identity);

    return await ctx.runQuery(
        components.betterAuth.organizations.listVisibleOrganizationMembersBySlug,
        {
          slug: args.slug,
          ...access,
        }
    );
  }
})

export const getVisibleOrganizationDriversBySlug = query({
  args: {
    slug: v.string(),
  },
  returns: v.array(visibleOrganizationDriverValidator),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity || (identity.role !== "admin" && identity.role !== "sponsor")) {
      return [];
    }

    const access = getOrgAccess(identity);

    const drivers = await ctx.runQuery(
        components.betterAuth.organizations.listVisibleOrganizationDriversBySlug,
        {
          slug: args.slug,
          ...access,
        }
    );

    return await Promise.all(
        drivers.map(async (driver) => {
          const pointTotal = await ctx.db
              .query("pointTotals")
              .filter((q) => q.eq(q.field("driverUserId"), driver.userId))
              .first();

          return {
            userId: driver.userId,
            name: driver.name,
            email: driver.email,
            points: pointTotal?.points ?? 0,
            active: driver.active,
            suspended: driver.suspended,
            suspensionEnd: driver.suspensionEnd ?? null,
            banReason: driver.banReason ?? null,
          };
        })
    );
  }
})

export const updateDriverPoints = mutation({
  args: {
    driverUserId: v.string(),
    pointChange: v.number(),
    reason: v.string(),
  },
  returns: v.object({
    points: v.number(),
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity || (identity.role !== "admin" && identity.role !== "sponsor")) {
      throw new Error("unauthorized");
    }

    const existingTotal = await ctx.db
        .query("pointTotals")
        .filter((q) => q.eq(q.field("driverUserId"), args.driverUserId))
        .first();

    const currentPoints = existingTotal?.points ?? 0;
    const nextPoints = currentPoints + args.pointChange;

    if (nextPoints < 0) {
      throw new Error("User cannot have less than 0 points");
    }

    if (existingTotal) {
      await ctx.db.patch(existingTotal._id, {
        points: nextPoints,
      });
    } else {
      await ctx.db.insert("pointTotals", {
        driverUserId: args.driverUserId,
        points: nextPoints,
      });
    }

    await ctx.db.insert("pointChanges", {
      driverUserId: args.driverUserId,
      changedByUserId: identity.subject,
      pointChange: args.pointChange,
      reason: args.reason,
      time: Date.now(),
    });

    return {
      points: nextPoints,
    };
  }
})

export const addVisibleOrganizationMemberByEmail = mutation({
  args: {
    slug: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity || (identity.role !== "admin" && identity.role !== "sponsor")) {
      throw new Error("unauthorized");
    }

    const access = getOrgAccess(identity);

    return await ctx.runMutation(
        components.betterAuth.organizations.addMemberByEmail,
        {
          slug: args.slug,
          email: args.email,
          ...access,
        }
    );
  }
})

export const updateVisibleOrganization = mutation({
  args: {
    organizationId: v.string(),
    data: v.object({
      name: v.optional(v.string()),
      slug: v.optional(v.string()),
      pointValue: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity || (identity.role !== "admin" && identity.role !== "sponsor")) {
      throw new Error("unauthorized");
    }

    const access = getOrgAccess(identity);

    await ctx.runMutation(
        components.betterAuth.organizations.updateVisibleOrganization,
        {
          organizationId: args.organizationId,
          data: args.data,
          ...access,
        }
    );
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