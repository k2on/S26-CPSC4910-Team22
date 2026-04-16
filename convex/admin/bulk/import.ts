import { action, internalMutation } from "../../_generated/server";
import { v } from "convex/values";
import { components, internal } from "../../_generated/api";
import { parseBulkFile } from "./parse";
import { DriverIdsAndPoints } from "./types";

// Main action that orchestrates the bulk import
export const processFile = action({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    // 1. Verify the caller is an admin
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const blob = await ctx.storage.get(args.storageId);
    if (!blob) throw new Error("File not found in storage");
    const text = await blob.text();
    const parsed = parseBulkFile(text);

    const response = await ctx.runMutation(components.betterAuth.bulk.processBulk, { parsed });
    await ctx.runMutation(internal.admin.bulk.import.uploadPointsForUsers, response);
    return response;
  },
});

export const uploadPointsForUsers = internalMutation({
  args: DriverIdsAndPoints,
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    for (const driver of args.pointsForIds) {
      if (!driver.points) continue;

      await ctx.db.insert("pointChanges", {
        changedByUserId: identity.subject,
        driverUserId: driver.userId,
        organizationId: driver.orgId,
        pointChange: driver.points,
        reason: driver.reason || "Bulk Upload",
        time: new Date().getTime()
      })
    }
  }
})
