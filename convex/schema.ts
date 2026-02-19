import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  numbers: defineTable({
    number: v.number()
  }),
  applications: defineTable({
    submitter: v.string(),
    organization: v.string()
  }),
    userProfiles: defineTable({
        role: v.optional(v.union(
            v.literal('driver'),
            v.literal('sponsor'),
            v.literal('admin'))), //optional to avoid errors
        address: v.optional(v.string()),
        profilePictureId: v.optional(v.string()),
        profilePictureBorderColor: v.optional(v.string()),
        tokenIdentifier: v.optional(v.string()), //optional to avoid errors
    }).index("by_token", ["tokenIdentifier"]),
  aboutPageInfo: defineTable({
    team: v.number(),
    version: v.number(),
    releaseDate: v.number(),
    productName: v.string(),
    productDescription: v.string(),
  })
});
