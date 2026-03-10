"use client";

import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import Link from "next/link";
import { CreateOrganizationModel } from "./CreateOrganizationModel";
import { usePathname } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function OrganizationsSidebar() {
  const pathname = usePathname();

  const orgs = useQuery(api.myFunctions.getAllOrganizations);

  return (
      <Sidebar collapsible="offcanvas" className="top-(--header-height) h-[calc(100svh-var(--header-height))]! left-(--sidebar-width)">
        <SidebarContent>
          <SidebarGroup>
            <CreateOrganizationModel />
            <SidebarGroupLabel>Organizations</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {orgs === undefined ? (
                    <OrganizationsSkeleton />
                ) : orgs.map((org) => {
                  return (
                      <SidebarMenuItem key={org._id}>
                        <SidebarMenuButton asChild isActive={pathname.includes(org.slug)}>
                          <Link href={`/admin/orgs/${org.slug}`}>
                            <span>{org.name}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
  )
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