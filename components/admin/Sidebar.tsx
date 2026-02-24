"use client";

import {
        Sidebar,
        SidebarContent,
        SidebarFooter,
        SidebarGroup,
        SidebarGroupContent,
        SidebarGroupLabel,
        SidebarHeader,
        SidebarMenu,
        SidebarMenuButton,
        SidebarMenuItem,
} from "@/components/ui/sidebar"
import { type LucideIcon, User2Icon, AtSignIcon, KeyIcon, ImageIcon, LogsIcon, Users2Icon, HomeIcon, BuildingIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation";

const LINKS = [
        {
                label: "General",
                href: "/admin",
                icon: HomeIcon
        },
        {
                label: "Users",
                href: "/admin/users",
                icon: Users2Icon
        },
        {
                label: "Organizations",
                href: "/admin/orgs",
                icon: BuildingIcon
        },
        {
                label: "Audit Log",
                href: "/admin/log",
                icon: LogsIcon
        },
] satisfies { label: string, href: string, icon: LucideIcon }[];

export function AdminSidebar() {
        const pathname = usePathname();

        return (
                <Sidebar collapsible="icon" className="top-(--header-height) h-[calc(100svh-var(--header-height))]!">
                        <SidebarContent>
                                <SidebarGroup>
                                        <SidebarGroupLabel>Admin</SidebarGroupLabel>
                                        <SidebarGroupContent>
                                                <SidebarMenu>

                                                        {LINKS.map(link => <SidebarMenuItem key={link.href}>
                                                                <SidebarMenuButton asChild isActive={pathname == link.href}>
                                                                        <Link href={link.href}>
                                                                                <link.icon />
                                                                                <span>{link.label}</span>
                                                                        </Link>
                                                                </SidebarMenuButton>
                                                        </SidebarMenuItem>)}

                                                </SidebarMenu>
                                        </SidebarGroupContent>
                                </SidebarGroup>
                        </SidebarContent>
                </Sidebar>
        )
}

