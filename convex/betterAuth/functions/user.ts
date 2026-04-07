import { query } from "../_generated/server";
import { v } from "convex/values";
import {
    getUsersByIdsInternal,
    getUserByEmailInternal,
} from "./internal/user";

export const getUsersByIds = query({
    args: {
        userIds: v.array(v.string()),
    },
    returns: v.array(
        v.object({
            _id: v.id("user"),
            _creationTime: v.number(),
            name: v.string(),
            email: v.string(),
            emailVerified: v.boolean(),
            image: v.optional(v.union(v.string(), v.null())),
            createdAt: v.number(),
            updatedAt: v.number(),
            userId: v.optional(v.union(v.string(), v.null())),
            role: v.optional(v.union(v.string(), v.null())),
            banned: v.optional(v.union(v.boolean(), v.null())),
            banReason: v.optional(v.union(v.string(), v.null())),
            banExpires: v.optional(v.union(v.number(), v.null())),
            address: v.optional(v.union(v.string(), v.null())),
            imageBorderColor: v.optional(v.union(v.string(), v.null())),
        })
    ),
    handler: async (ctx, args) => {
        return getUsersByIdsInternal(ctx, args.userIds);
    },
});

export const getUserByEmail = query({
    args: {
        email: v.string(),
    },
    returns: v.union(
        v.null(),
        v.object({
            _id: v.id("user"),
            _creationTime: v.number(),
            name: v.string(),
            email: v.string(),
            emailVerified: v.boolean(),
            image: v.optional(v.union(v.string(), v.null())),
            createdAt: v.number(),
            updatedAt: v.number(),
            userId: v.optional(v.union(v.string(), v.null())),
            role: v.optional(v.union(v.string(), v.null())),
            banned: v.optional(v.union(v.boolean(), v.null())),
            banReason: v.optional(v.union(v.string(), v.null())),
            banExpires: v.optional(v.union(v.number(), v.null())),
            address: v.optional(v.union(v.string(), v.null())),
            imageBorderColor: v.optional(v.union(v.string(), v.null())),
        })
    ),
    handler: async (ctx, args) => {
        return getUserByEmailInternal(ctx, args.email);
    },
});