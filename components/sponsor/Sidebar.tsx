"use client";

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { type LucideIcon, LogsIcon, UsersRoundIcon, HomeIcon, BuildingIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation";

const LINKS = [
    {
        label: "General",
        href: "/sponsor",
        icon: HomeIcon
    },
    {
        label: "Users",
        href: "/sponsor/users",
        icon: UsersRoundIcon
    },
    {
        label: "Organizations",
        href: "/sponsor/orgs",
        icon: BuildingIcon
    },
    // {
    //         label: "Reports",
    //         href: "/admin/reports",
    //         icon: LineChartIcon
    // },
    {
        label: "Audit Log",
        href: "/sponsor/log",
        icon: LogsIcon
    },
] satisfies { label: string, href: string, icon: LucideIcon }[];

export function SponsorSidebar() {
    const pathname = usePathname();

    return (
        <Sidebar
            collapsible="offcanvas"
            showRail={false}
            className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
        >
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Sponsor</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {LINKS.map(link => (
                                <SidebarMenuItem key={link.href}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={link.href == "/sponsor" ? pathname == "/sponsor" : pathname.includes(link.href)}
                                    >
                                        <Link href={link.href}>
                                            <link.icon />
                                            <span>{link.label}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}