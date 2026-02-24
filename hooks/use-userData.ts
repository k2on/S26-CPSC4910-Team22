"use client";

import { authClient } from "@/lib/auth-client";
import { useCallback, useEffect, useState } from "react";

export type UserData = {
    id?: string;
    name?: string | null;
    email?: string | null;
    role: "driver" | "sponsor" | "admin";
    address?: string | null;
    createdAt?: string | Date | null;
    banned?: boolean;
};

type ListUsersResponse =
    | { users?: UserData[] }
    | { data?: { users?: UserData[] } }
    | UserData[];

type AdminClient = {
    admin: {
        listUsers: (args?: { limit?: number; offset?: number }) => Promise<unknown>;
        banUser: (args: { userId: string }) => Promise<unknown>;
        unbanUser: (args: { userId: string }) => Promise<unknown>;
    };
};

export function useUserData() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdatingUser, setIsUpdatingUser] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const loadUsers = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage(null);

        try {
            const response = await (authClient as unknown as AdminClient).admin.listUsers({
                limit: 100,
                offset: 0,
            });

            const parsed = response as ListUsersResponse;

            let nextUsers: UserData[] = [];

            if (Array.isArray(parsed)) {
                nextUsers = parsed;
            } else if ("users" in parsed && Array.isArray(parsed.users)) {
                nextUsers = parsed.users;
            } else if (
                "data" in parsed &&
                parsed.data &&
                typeof parsed.data === "object" &&
                "users" in parsed.data &&
                Array.isArray(parsed.data.users)
            ) {
                nextUsers = parsed.data.users;
            }

            setUsers(nextUsers);
        } catch (error) {
            console.error("Failed to load users:", error);
            const message = error instanceof Error ? error.message : "Failed to load users.";
            setErrorMessage(message);
            setUsers([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const toggleUserActive = useCallback(
        async (user: UserData) => {
            if (!user.id) {
                setErrorMessage("Unable to update user: missing user id.");
                return;
            }

            setIsUpdatingUser(true);
            setErrorMessage(null);

            try {
                const adminClient = (authClient as unknown as AdminClient).admin;
                const isCurrentlyActive = !user.banned;

                if (isCurrentlyActive) {
                    await adminClient.banUser({ userId: user.id });
                } else {
                    await adminClient.unbanUser({ userId: user.id });
                }

                await loadUsers();
            } catch (error) {
                console.error("Failed to update user active status:", error);
                const message =
                    error instanceof Error ? error.message : "Failed to update user.";
                setErrorMessage(message);
            } finally {
                setIsUpdatingUser(false);
            }
        },
        [loadUsers]
    );

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    return {
        users,
        isLoading,
        isUpdatingUser,
        errorMessage,
        loadUsers,
        toggleUserActive,
    };
}