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
    event: v.string(),
  }),
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
  })
      .index("organizationId", ["organizationId"])
      .index("driverUserId", ["driverUserId"]),
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
  }).index("by_user_track", ["userId", "trackId"]),
});