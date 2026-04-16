import { Infer, v } from "convex/values";

export const ParsedOrg = v.object({
  line: v.number(),
  name: v.string(),
});

export const ParsedUser = v.object({
  line: v.number(),
  type: v.union(v.literal("D"), v.literal("S")),
  orgName: v.string(),
  firstName: v.string(),
  lastName: v.string(),
  email: v.string(),
  points: v.optional(v.number()),
  reason: v.optional(v.string()),
});

export const ParsedError = v.object({
  line: v.number(),
  raw: v.string(),
  message: v.string(),
});

export const ParseResult = v.object({
  organizations: v.array(ParsedOrg),
  drivers: v.array(ParsedUser),
  sponsors: v.array(ParsedUser),
  errors: v.array(ParsedError),
});

export type IParseResult = Infer<typeof ParseResult>;

export const DriverIdsAndPoints = v.object({
  errors: v.array(v.object({
    line: v.number(),
    message: v.string(),
  })),
  pointsForIds: v.array(v.object({
    orgId: v.string(),
    userId: v.string(),
    points: v.optional(v.number()),
    reason: v.optional(v.string()),
  }))
});

export type IDriverIdsAndPoints = Infer<typeof DriverIdsAndPoints>;
