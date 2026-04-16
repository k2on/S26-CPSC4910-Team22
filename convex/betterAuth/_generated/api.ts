/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as adapter from "../adapter.js";
import type * as auth from "../auth.js";
import type * as bulk from "../bulk.js";
import type * as functions_internal_organizationMembers from "../functions/internal/organizationMembers.js";
import type * as functions_internal_organizations from "../functions/internal/organizations.js";
import type * as functions_internal_user from "../functions/internal/user.js";
import type * as functions_organizationMembers from "../functions/organizationMembers.js";
import type * as functions_organizations from "../functions/organizations.js";
import type * as functions_user from "../functions/user.js";
import type * as organizations from "../organizations.js";
import type * as user from "../user.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import { anyApi, componentsGeneric } from "convex/server";

const fullApi: ApiFromModules<{
  adapter: typeof adapter;
  auth: typeof auth;
  bulk: typeof bulk;
  "functions/internal/organizationMembers": typeof functions_internal_organizationMembers;
  "functions/internal/organizations": typeof functions_internal_organizations;
  "functions/internal/user": typeof functions_internal_user;
  "functions/organizationMembers": typeof functions_organizationMembers;
  "functions/organizations": typeof functions_organizations;
  "functions/user": typeof functions_user;
  organizations: typeof organizations;
  user: typeof user;
}> = anyApi as any;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
> = anyApi as any;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
> = anyApi as any;

export const components = componentsGeneric() as unknown as {};
