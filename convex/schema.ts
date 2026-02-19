import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  numbers: defineTable({
    number: v.number()
  }),
    userProfiles: defineTable({
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
