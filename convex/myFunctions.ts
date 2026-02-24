import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { api } from "./_generated/api";
import { authComponent, createAuth, options } from "./betterAuth/auth";

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
