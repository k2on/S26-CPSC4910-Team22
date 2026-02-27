"use client";

import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import Link from "next/link";
import { CreateOrganizationModel } from "./CreateOrganizationModel";
import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

export function OrganizationsSidebar() {
  const pathname = usePathname();

  const { data: orgs, isLoading } = useQuery({
    queryKey: ["orgs"],
    queryFn: () => authClient.organization.list()
  })

  return (
    <Sidebar collapsible="offcanvas" className="top-(--header-height) h-[calc(100svh-var(--header-height))]! left-(--sidebar-width)">
      <SidebarContent>
        <SidebarGroup>
          <CreateOrganizationModel />
          <SidebarGroupLabel>Organizations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {isLoading ? (
                <OrganizationsSkeleton />
              ) : orgs?.map(org => {
                return (
                  <SidebarMenuItem key={org.id}>
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
