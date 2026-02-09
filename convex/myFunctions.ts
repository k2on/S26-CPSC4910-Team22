import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { api } from "./_generated/api";

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
    const user = await ctx.auth.getUserIdentity()
    if(!user){
      throw Error()
    }
    await ctx.db.insert("numbers", { number: args.number, createdBy: user.name || "joebiden123orsomethingidk"});
    return "ok";
  }
})

