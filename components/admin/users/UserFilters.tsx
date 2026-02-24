"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SortOrder = "newest" | "oldest";
type RoleFilter = "all" | "driver" | "sponsor" | "admin";

type ToggleProps = {
    showFilters: boolean;
    onToggleFilters: () => void;
};

type PanelProps = {
    sortOrder: SortOrder;
    onSortOrderChange: (value: SortOrder) => void;
    roleFilter: RoleFilter;
    onRoleFilterChange: (value: RoleFilter) => void;
    nameSearch: string;
    onNameSearchChange: (value: string) => void;
    emailSearch: string;
    onEmailSearchChange: (value: string) => void;
};

export function UserFiltersToggle({
                                      showFilters,
                                      onToggleFilters,
                                  }: ToggleProps) {
    return (
        <Button type="button" variant="outline" onClick={onToggleFilters}>
            {showFilters ? "Hide Filters" : "Filter Users"}
        </Button>
    );
}

export function UserFiltersPanel({
                                     sortOrder,
                                     onSortOrderChange,
                                     roleFilter,
                                     onRoleFilterChange,
                                     nameSearch,
                                     onNameSearchChange,
                                     emailSearch,
                                     onEmailSearchChange,
                                 }: PanelProps) {
    return (
        <div className="mb-4 grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1">
                <label htmlFor="sortOrder" className="text-sm font-medium">
                    Sort by account creation date
                </label>
                <select
                    id="sortOrder"
                    value={sortOrder}
                    onChange={(e) => onSortOrderChange(e.target.value as SortOrder)}
                    className="border-input bg-background h-9 rounded-md border px-3 text-sm"
                >
                    <option value="newest">Newest to oldest</option>
                    <option value="oldest">Oldest to newest</option>
                </select>
            </div>

            <div className="flex flex-col gap-1">
                <label htmlFor="roleFilter" className="text-sm font-medium">
                    Filter users by role
                </label>
                <select
                    id="roleFilter"
                    value={roleFilter}
                    onChange={(e) => onRoleFilterChange(e.target.value as RoleFilter)}
                    className="border-input bg-background h-9 rounded-md border px-3 text-sm"
                >
                    <option value="all">All roles</option>
                    <option value="driver">Driver</option>
                    <option value="sponsor">Sponsor</option>
                    <option value="admin">Admin</option>
                </select>
            </div>

            <div className="flex flex-col gap-1">
                <label htmlFor="nameSearch" className="text-sm font-medium">
                    Search users by name
                </label>
                <Input
                    id="nameSearch"
                    value={nameSearch}
                    onChange={(e) => onNameSearchChange(e.target.value)}
                    placeholder="Enter name"
                />
            </div>

            <div className="flex flex-col gap-1">
                <label htmlFor="emailSearch" className="text-sm font-medium">
                    Search users by email
                </label>
                <Input
                    id="emailSearch"
                    value={emailSearch}
                    onChange={(e) => onEmailSearchChange(e.target.value)}
                    placeholder="Enter email"
                />
            </div>
        </div>
    );
}