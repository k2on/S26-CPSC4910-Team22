import { createAccessControl } from "better-auth/plugins/access";

export const statement = {
    user: [
        "create",
        "list",
        "set-role",
        "ban",
        "impersonate",
        "delete",
        "set-password",
        "update",
    ],
    session: ["list", "revoke", "delete"],
} as const;

export const ac = createAccessControl(statement);

type UserAction = (typeof statement.user)[number];
type SessionAction = (typeof statement.session)[number];

export const driver = ac.newRole({
    user: [] as UserAction[],
    session: [] as SessionAction[],
});

// sponsor permissions list is same as admin
// specific permission gates can be implemented in convex (ex: creating a new driver account vs admin account)
export const sponsor = ac.newRole({
    user: [
        "create",
        "list",
        "set-role",
        "ban",
        "impersonate",
        "delete",
        "set-password",
        "update",
    ],
    session: ["list", "revoke", "delete"],
});

export const admin = ac.newRole({
    user: [
        "create",
        "list",
        "set-role",
        "ban",
        "impersonate",
        "delete",
        "set-password",
        "update",
    ],
    session: ["list", "revoke", "delete"],
});

export const roles = { driver, sponsor, admin };
export type AppRole = keyof typeof roles;
