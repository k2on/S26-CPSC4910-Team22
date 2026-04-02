"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontalIcon } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { columns } from "@/components/admin/users/columns";
import { DataTable } from "@/components/admin/users/data-table";
import { CreateUserModel } from "@/components/admin/users/CreateUserModel";
import { BulkUserUploadModal } from "@/components/admin/users/BulkUserUploadModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type User = Awaited<ReturnType<typeof authClient.admin.listUsers>>["users"][number];
type UserRoleFilter = "all" | "driver" | "sponsor" | "admin";
type UserStatusFilter = "all" | "active" | "deactivated";
type UserSort = "name-asc" | "email-asc" | "newest" | "oldest";

export function AdminUsers() {
    const [showFilters, setShowFilters] = useState(false);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<UserRoleFilter>("all");
    const [statusFilter, setStatusFilter] = useState<UserStatusFilter>("all");
    const [sortBy, setSortBy] = useState<UserSort>("name-asc");

    const { data: usersData } = useQuery({
        queryKey: ["admin", "users"],
        queryFn: () => authClient.admin.listUsers({ query: {} }),
    });

    const filteredUsers = useMemo(() => {
        const users = [...(usersData?.users || [])];
        const normalizedSearch = search.trim().toLowerCase();

        const filtered = users.filter((user) => {
            const matchesSearch =
                normalizedSearch.length === 0 ||
                user.name.toLowerCase().includes(normalizedSearch) ||
                user.email.toLowerCase().includes(normalizedSearch);

            const matchesRole = roleFilter === "all" || user.role === roleFilter;

            const matchesStatus =
                statusFilter === "all" ||
                (statusFilter === "active" && !user.banned) ||
                (statusFilter === "deactivated" && user.banned);

            return matchesSearch && matchesRole && matchesStatus;
        });

        filtered.sort((a, b) => {
            switch (sortBy) {
                case "name-asc":
                    return a.name.localeCompare(b.name);
                case "email-asc":
                    return a.email.localeCompare(b.email);
                case "newest":
                    return Number(b.createdAt) - Number(a.createdAt);
                case "oldest":
                    return Number(a.createdAt) - Number(b.createdAt);
                default:
                    return 0;
            }
        });

        return filtered;
    }, [usersData?.users, search, roleFilter, statusFilter, sortBy]);

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                    <CreateUserModel />
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowFilters((prev) => !prev)}
                    >
                        <SlidersHorizontalIcon />
                        {showFilters ? "Hide Search Options" : "Show Search Options"}
                    </Button>
                    <BulkUserUploadModal />
                </div>
            </div>

            {showFilters && (
                <div className="rounded-md border bg-muted/30 p-4">
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Search Name or Email</label>
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search users..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">User Type</label>
                            <Select
                                value={roleFilter}
                                onValueChange={(value: UserRoleFilter) => setRoleFilter(value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All user types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All User Types</SelectItem>
                                    <SelectItem value="driver">Driver</SelectItem>
                                    <SelectItem value="sponsor">Sponsor</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Account Status</label>
                            <Select
                                value={statusFilter}
                                onValueChange={(value: UserStatusFilter) => setStatusFilter(value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All account statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Accounts</SelectItem>
                                    <SelectItem value="active">Active Only</SelectItem>
                                    <SelectItem value="deactivated">Deactivated Only</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Sort By</label>
                            <Select
                                value={sortBy}
                                onValueChange={(value: UserSort) => setSortBy(value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sort users" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="name-asc">Name A–Z</SelectItem>
                                    <SelectItem value="email-asc">Email A–Z</SelectItem>
                                    <SelectItem value="newest">Newest to Oldest</SelectItem>
                                    <SelectItem value="oldest">Oldest to Newest</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            )}

            <DataTable columns={columns} data={filteredUsers} />
        </div>
    );
} 
