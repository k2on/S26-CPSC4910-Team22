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
        <div className="rounded-md border bg-muted/20 p-3">
            <div className="space-y-3 overflow-x-auto">
                <div className="flex flex-nowrap gap-3">
                    <div className="w-[320px] shrink-0">
                        <label htmlFor="sortOrder" className="mb-1 block text-sm font-medium">
                            Sort by account creation date
                        </label>
                        <select
                            id="sortOrder"
                            value={sortOrder}
                            onChange={(e) => onSortOrderChange(e.target.value as SortOrder)}
                            className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
                        >
                            <option value="newest">Newest to oldest</option>
                            <option value="oldest">Oldest to newest</option>
                        </select>
                    </div>

                    <div className="w-[320px] shrink-0">
                        <label htmlFor="roleFilter" className="mb-1 block text-sm font-medium">
                            Filter users by role
                        </label>
                        <select
                            id="roleFilter"
                            value={roleFilter}
                            onChange={(e) => onRoleFilterChange(e.target.value as RoleFilter)}
                            className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
                        >
                            <option value="all">All roles</option>
                            <option value="driver">Driver</option>
                            <option value="sponsor">Sponsor</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                </div>

                <div className="flex flex-nowrap gap-3">
                    <div className="w-[320px] shrink-0">
                        <label htmlFor="nameSearch" className="mb-1 block text-sm font-medium">
                            Search by name
                        </label>
                        <Input
                            id="nameSearch"
                            value={nameSearch}
                            onChange={(e) => onNameSearchChange(e.target.value)}
                            placeholder="Enter name"
                        />
                    </div>

                    <div className="w-[320px] shrink-0">
                        <label htmlFor="emailSearch" className="mb-1 block text-sm font-medium">
                            Search by email
                        </label>
                        <Input
                            id="emailSearch"
                            value={emailSearch}
                            onChange={(e) => onEmailSearchChange(e.target.value)}
                            placeholder="Enter email"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}