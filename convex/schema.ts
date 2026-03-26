import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  numbers: defineTable({
    number: v.number()
  }),
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
  }).index("by_user_id", { fields: ["userId"] }),
  pointTotals: defineTable({
    driverUserId: v.string(),
    points: v.number(),
  }),
  pointChanges: defineTable({
    driverUserId: v.string(),
    changedByUserId: v.string(),
    pointChange: v.number(),
    reason: v.string(),
    time: v.number(),
  })
});
