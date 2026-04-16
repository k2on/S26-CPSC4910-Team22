import { mutation } from "./_generated/server";
import {
  DriverIdsAndPoints,
  IDriverIdsAndPoints,
  ParseResult } from "../admin/bulk/types";


export const processBulk = mutation({
  args: {
    parsed: ParseResult
  },
  returns: DriverIdsAndPoints,
  handler: async (ctx, args) => {
    const response: IDriverIdsAndPoints = {
      pointsForIds: [],
      errors: [],
    };

    for (const org of args.parsed.organizations) {
      const newOrg = await ctx.db.query("organization")
        .withIndex("name", q => q.eq("name", org.name))
        .first();
      if (!newOrg) {
        await ctx.db.insert("organization", {
          name: org.name,
          slug: org.name.toLowerCase(),
          pointValue: 0.01,
          createdAt: new Date().getTime(),
        });
      }
    }

    for (const sponsor of args.parsed.sponsors) {
      const org = await ctx.db.query("organization")
        .withIndex("name", q => q.eq("name", sponsor.orgName))
        .first();
      if (!org) {
        response.errors.push({
          line: sponsor.line,
          message: `The '${sponsor.orgName}' organization does not exist`
        });
        continue;
      }
      const userId = await ctx.db.insert("user", {
        name: `${sponsor.firstName} ${sponsor.lastName}`,
        email: sponsor.email,
        emailVerified: false,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
        role: "sponsor",
      });
      await ctx.db.insert("member", {
        organizationId: org._id,
        userId,
        createdAt: new Date().getTime(),
        role: "admin",
      });
    }

    for (const driver of args.parsed.drivers) {
      const org = await ctx.db.query("organization")
        .withIndex("name", q => q.eq("name", driver.orgName))
        .first();
      if (!org) {
        response.errors.push({
          line: driver.line,
          message: `The '${driver.orgName}' organization does not exist`
        });
        continue;
      }
      const userId = await ctx.db.insert("user", {
        name: `${driver.firstName} ${driver.lastName}`,
        email: driver.email,
        emailVerified: false,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
        role: "driver",
      });
      await ctx.db.insert("member", {
        organizationId: org._id,
        userId,
        createdAt: new Date().getTime(),
        role: "member",
      });
      response.pointsForIds.push({
        orgId: org._id,
        userId: userId,
        points: driver.points,
        reason: driver.reason,
      })
    }

    return response;
  }
});
