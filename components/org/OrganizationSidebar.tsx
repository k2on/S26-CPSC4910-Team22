"use client";

import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { HomeIcon, LucideIcon, Users2Icon } from "lucide-react";

const LINKS = [
        {
                label: "General",
                href: "/",
                icon: HomeIcon
        },
        {
                label: "Members",
                href: "/users",
                icon: Users2Icon
        },
] satisfies { label: string, href: string, icon: LucideIcon }[];

export function OrganizationSidebar({ baseUrl }: { baseUrl?: string }) {
        const pathname = usePathname();


        return (
                <Sidebar collapsible="offcanvas" className="top-(--header-height) h-[calc(100svh-var(--header-height))]! left-[--sidebar-width]">
                        <SidebarContent>
                                <SidebarGroup>
                                        <SidebarGroupLabel>Organization</SidebarGroupLabel>
                                        <SidebarGroupContent>
                                                <SidebarMenu>
                                                        {LINKS.map(link => {
                                                                const href = baseUrl ? baseUrl + link.href : link.href;
                                                                return (
                                                                        <SidebarMenuItem key={href}>
                                                                                <SidebarMenuButton asChild isActive={pathname.includes(href)}>
                                                                                        <Link href={href}>
                                                                                                <link.icon />
                                                                                                <span>{link.label}</span>
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
