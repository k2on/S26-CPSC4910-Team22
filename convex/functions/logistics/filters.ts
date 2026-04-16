import type { Doc } from "../../_generated/dataModel";
import type { UserIdentity } from "convex/server";

export async function filterPointChangesByIdentity(
    pointChanges: Doc<"pointChanges">[],
    identity: UserIdentity | null
) {
    if (!identity) {
        return [];
    }

    if (identity.role !== "driver") {
        return pointChanges;
    }

    return pointChanges.filter(
        (change) => String(change.driverUserId) === identity.subject
    );
}