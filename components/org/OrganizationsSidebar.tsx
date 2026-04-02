"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";

export function OrganizationsSidebar({
    basePath,
    createAction,
}: {
    basePath: string;
    createAction: ReactNode;
}) {
    const pathname = usePathname();
    const { data: orgs } = authClient.useListOrganizations();

    return (
        <Sidebar collapsible="offcanvas" className="top-(--header-height) h-[calc(100svh-var(--header-height))]! left-(--sidebar-width)">
            <SidebarContent>
                <SidebarGroup>
                    {createAction}
                    <SidebarGroupLabel>Organizations</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {orgs === undefined ? (
                                <OrganizationsSkeleton />
                            ) : orgs?.map((org) => {
                                return (
                                    <SidebarMenuItem key={org.id}>
                                        <SidebarMenuButton asChild isActive={pathname.includes(org.slug)}>
                                            <Link href={`${basePath}/${org.slug}`}>
                                                <span>{org.name}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}

function OrganizationsSkeleton() {
    return (
        <div className="flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-8" />
            ))}
        </div>
    );
} 
