"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import {
    UserFiltersPanel,
    UserFiltersToggle,
} from "@/components/admin/users/UserFilters";
import { UsersTable } from "@/components/admin/users/UsersTable";
import { ManageAccountMenu } from "@/components/admin/users/ManageAccountMenu";
import { useUserData } from "@/hooks/use-userData";

type SortOrder = "newest" | "oldest";
type RoleFilter = "all" | "driver" | "sponsor" | "admin";

export default function Page() {
    const {
        users,
        isLoading,
        isUpdatingUser,
        errorMessage,
        loadUsers,
        toggleUserActive,
    } = useUserData();

    const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
    const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
    const [nameSearch, setNameSearch] = useState("");
    const [emailSearch, setEmailSearch] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | undefined>(undefined);

    const getCreatedAtTimestamp = (value: string | Date | null | undefined) => {
        if (!value) return 0;
        const date = value instanceof Date ? value : new Date(value);
        return date.getTime();
    };

    const filteredAndSortedUsers = useMemo(() => {
        const normalizedNameSearch = nameSearch.trim().toLowerCase();
        const normalizedEmailSearch = emailSearch.trim().toLowerCase();

        const filtered = users.filter((user) => {
            const userName = (user.name ?? "").toLowerCase();
            const userEmail = (user.email ?? "").toLowerCase();

            if (roleFilter !== "all" && user.role !== roleFilter) {
                return false;
            }

            if (normalizedNameSearch && !userName.includes(normalizedNameSearch)) {
                return false;
            }

            if (normalizedEmailSearch && !userEmail.includes(normalizedEmailSearch)) {
                return false;
            }

            return true;
        });

        filtered.sort((a, b) => {
            const aTime = getCreatedAtTimestamp(a.createdAt);
            const bTime = getCreatedAtTimestamp(b.createdAt);

            if (sortOrder === "oldest") return aTime - bTime;
            return bTime - aTime;
        });

        return filtered;
    }, [users, sortOrder, roleFilter, nameSearch, emailSearch]);

    const selectedUser = useMemo(() => {
        if (!selectedUserId) return undefined;
        return filteredAndSortedUsers.find((user) => user.id === selectedUserId);
    }, [filteredAndSortedUsers, selectedUserId]);

    const selectedUserText = selectedUser
        ? `${selectedUser.name || "—"} (${selectedUser.email || "—"})`
        : "Select a user to manage";

    return (
        <main className="w-full">
            <Card className="w-full max-w-none">
                <CardHeader className="space-y-4">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                        <div className="space-y-1">
                            <CardTitle>Users</CardTitle>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <UserFiltersToggle
                                showFilters={showFilters}
                                onToggleFilters={() => setShowFilters((prev) => !prev)}
                            />

                            <Button
                                type="button"
                                variant="outline"
                                onClick={loadUsers}
                                disabled={isLoading || isUpdatingUser}
                            >
                                Refresh
                            </Button>
                        </div>
                    </div>

                    <div className="rounded-md border bg-muted/20 p-3">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <p className="text-sm font-medium break-words">{selectedUserText}</p>

                            <div className="shrink-0">
                                <ManageAccountMenu
                                    selectedUser={selectedUser}
                                    isUpdatingUser={isUpdatingUser}
                                    onToggleUserActive={toggleUserActive}
                                />
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {showFilters && (
                        <UserFiltersPanel
                            sortOrder={sortOrder}
                            onSortOrderChange={setSortOrder}
                            roleFilter={roleFilter}
                            onRoleFilterChange={setRoleFilter}
                            nameSearch={nameSearch}
                            onNameSearchChange={setNameSearch}
                            emailSearch={emailSearch}
                            onEmailSearchChange={setEmailSearch}
                        />
                    )}

                    {isLoading ? (
                        <div className="flex items-center gap-2 py-6">
                            <Spinner />
                            <span>Loading users...</span>
                        </div>
                    ) : errorMessage ? (
                        <div className="py-4 text-sm text-destructive">{errorMessage}</div>
                    ) : filteredAndSortedUsers.length === 0 ? (
                        <div className="py-4 text-sm text-muted-foreground">No users found.</div>
                    ) : (
                        <UsersTable
                            users={filteredAndSortedUsers}
                            selectedUserId={selectedUserId}
                            onSelectUser={(user) => setSelectedUserId(user.id)}
                        />
                    )}
                </CardContent>
            </Card>
        </main>
    );
}