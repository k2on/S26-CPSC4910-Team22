import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  aboutPageInfo: defineTable({
    team: v.number(),
    version: v.number(),
    releaseDate: v.number(),
    productName: v.string(),
    productDescription: v.string(),
  }),
  auditLog: defineTable({
    time: v.number(),
    event: v.string(),//application, pointChange, passwordChange, loginAttempt
    sponsor: v.optional(v.union(v.null(), v.string())),//sponsor org for applications and point changes
    user: v.optional(v.union(v.null(), v.string())),//user for everything but failed login attempts
    email: v.optional(v.union(v.null(), v.string())),//email for login attempts
    amount: v.optional(v.union(v.null(), v.number())),//amount for point changes
    status: v.optional(v.union(v.null(), v.string())),//waiting/accepted/rejected for application, success/failure for login attempt
    reason: v.optional(v.union(v.null(), v.string())),//reason for application status or point/password change
  })
  .index("by_time", ["time"]),
  driverApplication: defineTable({
    userId: v.string(),
    orgId: v.string(),
    status: v.union(v.literal("waiting"), v.literal("denied"), v.literal("approved")),
    decisionBy: v.optional(v.string())
  }).index("by_user_id", { fields: ["userId"] })
    .index("by_org_id", { fields: ["orgId"] }),
  pointTotals: defineTable({
    driverUserId: v.string(),
    organizationId: v.string(),
    points: v.number(),
  }),
  pointChanges: defineTable({
    driverUserId: v.string(),
    organizationId: v.string(),
    changedByUserId: v.string(),
    pointChange: v.number(),
    reason: v.string(),
    time: v.number(),
  }),
  cartItem: defineTable({
    userId: v.string(),
    organizationId: v.string(),
    trackId: v.number(),
    mediaType: v.string(),
    name: v.string(),
    artistName: v.string(),
    price: v.number(),
    artworkUrl: v.string(),
    createdAt: v.number(),
  })
    .index("by_user_org", ["userId", "organizationId"])
    .index("by_user_org_track", ["userId", "organizationId", "trackId"]),
  ownedItems: defineTable({
    userId: v.string(),
    trackId: v.number(),
    purchasedAt: v.number(),
  })
  .index("by_user_track", ["userId", "trackId"])
  .index("by_user", ["userId"]),
  orgCatalogSettings: defineTable({
    organizationId: v.string(),
    hasMusic: v.boolean(),
    hasMusicVideos: v.boolean(),
    hasAudiobooks: v.boolean(),
    hasShows: v.boolean(),
  })
  .index("by_organization", ["organizationId"]),
});
