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

const visibleOrganizationPointChangeValidator = v.object({
  id: v.string(),
  driverName: v.string(),
  driverEmail: v.string(),
  changedByName: v.string(),
  pointChange: v.number(),
  reason: v.string(),
  time: v.number(),
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

export const incrementOrganizationMemberCount = mutation({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity || (identity.role !== "admin" && identity.role !== "sponsor")) {
      throw new Error("unauthorized");
    }

    const access = getOrgAccess(identity);

    return await ctx.runMutation(
        components.betterAuth.organizations.incrementOrganizationMemberCount,
        {
          slug: args.slug,
          ...access,
        }
    );
  }
})

export const decrementOrganizationMemberCount = mutation({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity || (identity.role !== "admin" && identity.role !== "sponsor")) {
      throw new Error("unauthorized");
    }

    const access = getOrgAccess(identity);

    return await ctx.runMutation(
        components.betterAuth.organizations.decrementOrganizationMemberCount,
        {
          slug: args.slug,
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

export const getVisibleOrganizationPointChangesBySlug = query({
  args: {
    slug: v.string(),
  },
  returns: v.array(visibleOrganizationPointChangeValidator),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
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

    const driverMap = new Map(
        drivers.map((driver) => [
          driver.userId,
          {
            name: driver.name,
            email: driver.email,
          },
        ])
    );

    const pointChanges = await ctx.db.query("pointChanges").collect();

    const relevantPointChanges = pointChanges.filter((change) =>
        driverMap.has(change.driverUserId)
    );

    const changedByIds = Array.from(
        new Set(relevantPointChanges.map((change) => change.changedByUserId))
    );

    const changedByUsers = await ctx.runQuery(
        components.betterAuth.organizations.getUserNamesByIds,
        {
          userIds: changedByIds,
        }
    );

    const changedByMap = new Map(
        changedByUsers.map((user) => [user.userId, user.name])
    );

    return relevantPointChanges
        .map((change) => {
          const driver = driverMap.get(change.driverUserId);

          return {
            id: String(change._id),
            driverName: driver?.name ?? "Unknown User",
            driverEmail: driver?.email ?? "Unknown Email",
            changedByName: changedByMap.get(change.changedByUserId) ?? "Unknown User",
            pointChange: change.pointChange,
            reason: change.reason,
            time: change.time,
          };
        })
        .sort((a, b) => b.time - a.time);
  }
});

type OrganizationRole = "admin" | "sponsor" | "driver";

type OrganizationSelectionRow = {
  name: string;
  slug: string;
  totalMembers?: number;
  inOrganization?: "Yes" | "No";
  points?: number;
};

type OrganizationSelectionData = {
  role: OrganizationRole;
  rows: OrganizationSelectionRow[];
};

export const getOrganizationSelectionData = query({
  handler: async (ctx): Promise<OrganizationSelectionData> => {
    const identity = await ctx.auth.getUserIdentity();

    if (
        !identity ||
        (identity.role !== "admin" &&
            identity.role !== "sponsor" &&
            identity.role !== "driver")
    ) {
      return {
        role: "driver",
        rows: [],
      };
    }

    return await ctx.runQuery(
        components.betterAuth.organizations.getOrganizationSelectionData,
        {
          authUserId: identity.subject,
          role: identity.role,
        }
    );
  },
});

type OrganizationGeneralResult =
    | {
  role: "admin" | "sponsor";
  name: string;
  totalMembers: number;
}
    | {
  role: "driver";
  name: string;
  currentPoints: number;
  currentPointValue: number;
};

export const getOrganizationGeneralBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args): Promise<OrganizationGeneralResult | null> => {
    const identity = await ctx.auth.getUserIdentity();

    if (
        !identity ||
        (identity.role !== "admin" &&
            identity.role !== "sponsor" &&
            identity.role !== "driver")
    ) {
      return null;
    }

    const organization = await ctx.runQuery(
        components.betterAuth.organizations.getOrganizationGeneralBySlug,
        {
          slug: args.slug,
          userId: identity.subject,
          role: identity.role,
        }
    );

    if (!organization) {
      return null;
    }

    if (identity.role === "driver") {
      const pointTotal = await ctx.db
          .query("pointTotals")
          .filter((q) => q.eq(q.field("driverUserId"), identity.subject))
          .first();

      const currentPoints = pointTotal?.points ?? 0;

      return {
        role: "driver",
        name: organization.name,
        currentPoints,
        currentPointValue: currentPoints * organization.pointValue,
      };
    }

    return {
      role: identity.role,
      name: organization.name,
      totalMembers: organization.totalMembers,
    };
  },
});

export const getCurrentUserName = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return null;
    }

    const users = await ctx.runQuery(
        components.betterAuth.organizations.getUserNamesByIds,
        {
          userIds: [identity.subject],
        }
    );

    return users[0]?.name ?? null;
  },
});