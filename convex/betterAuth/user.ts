import { query } from "./_generated/server";
import { v } from "convex/values";
import { Doc } from "./_generated/dataModel";
import schema from "./schema";

export const getUsersFromIds = query({
  args: {
    ids: v.array(v.id("user"))
  },
  returns: v.array(schema.tables.user.validator.extend({
    _id: v.id("user"),
    _creationTime: v.number(),
  })),
  handler: async (ctx, args) => {
    const users: Doc<"user">[] = [];
    for (const id of args.ids) {
      const user = await ctx.db.get(id);
      if (!user) continue;
      users.push(user);
    }
    return users;
  }
});
