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
import { useUserData } from "@/hooks/use-userData";

type SortOrder = "newest" | "oldest";
type RoleFilter = "all" | "driver" | "sponsor" | "admin";

export default function Page() {
    const { users, isLoading, errorMessage, loadUsers } = useUserData();

    const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
    const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
    const [nameSearch, setNameSearch] = useState("");
    const [emailSearch, setEmailSearch] = useState("");
    const [showFilters, setShowFilters] = useState(false);

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

    return (
        <main className="max-w-5xl mx-auto p-4 md:p-6">
            <Card>
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                    <CardTitle>Users</CardTitle>

                    <div className="flex items-center gap-2">
                        <UserFiltersToggle
                            showFilters={showFilters}
                            onToggleFilters={() => setShowFilters((prev) => !prev)}
                        />

                        <Button type="button" onClick={loadUsers} disabled={isLoading}>
                            Refresh
                        </Button>
                    </div>
                </CardHeader>

                <CardContent>
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
                        <UsersTable users={filteredAndSortedUsers} />
                    )}
                </CardContent>
            </Card>
        </main>
    );
}