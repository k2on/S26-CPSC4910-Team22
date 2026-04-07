import type { QueryCtx, MutationCtx } from "../../_generated/server";
import type { Id } from "../../_generated/dataModel";

export async function getUsersByIdsInternal(
    ctx: QueryCtx | MutationCtx,
    userIds: string[]
) {
    const uniqueIds = Array.from(new Set(userIds));

    const users = await Promise.all(
        uniqueIds.map((userId) => ctx.db.get(userId as Id<"user">))
    );

    return users.filter((user) => user !== null);
}

export async function getUserByEmailInternal(
    ctx: QueryCtx | MutationCtx,
    email: string
) {
    return ctx.db
        .query("user")
        .withIndex("email_name", (q) => q.eq("email", email))
        .unique();
}