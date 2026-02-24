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
};

type ListUsersResponse =
    | { users?: UserData[] }
    | { data?: { users?: UserData[] } }
    | UserData[];

export function useUserData() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const loadUsers = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage(null);

        try {
            const response = await (authClient as unknown as {
                admin: {
                    listUsers: (args?: { limit?: number; offset?: number }) => Promise<unknown>;
                };
            }).admin.listUsers({
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

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    return {
        users,
        isLoading,
        errorMessage,
        loadUsers,
    };
}