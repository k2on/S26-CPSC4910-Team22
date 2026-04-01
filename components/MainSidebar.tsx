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
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Cctv,
    House,
    LucideIcon,
    ScrollText,
    UserRoundIcon,
    UsersRound,
    Info,
} from "lucide-react";

export type MainSidebarRole = "admin" | "sponsor" | "driver";

const LINKS = [
    {
        label: "Home",
        href: "/home",
        icon: House,
        roles: ["admin", "sponsor", "driver"],
    },
    {
        label: "My Profile",
        href: "/user",
        icon: UserRoundIcon,
        roles: ["admin", "sponsor", "driver"],
    },
    {
        label: "My Activity",
        href: "/activity",
        icon: Cctv,
        roles: ["admin", "sponsor", "driver"],
    },
    {
        label: "System Users",
        href: "/users",
        icon: UsersRound,
        roles: ["admin"],
    },
    {
        label: "System Log",
        href: "/log",
        icon: ScrollText,
        roles: ["admin"],
    },
    {
        label: "About",
        href: "/about",
        icon: Info,
        roles: ["admin", "sponsor", "driver"],
    },
] satisfies {
    label: string;
    href: string;
    icon: LucideIcon;
    roles: MainSidebarRole[];
}[];

function isLinkActive(pathname: string, href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
}

export function MainSidebar({ role }: { role: MainSidebarRole }) {
    const pathname = usePathname();

    const visibleLinks = LINKS.filter((link) => link.roles.includes(role));

    return (
        <Sidebar
            collapsible="offcanvas"
            className="top-(--header-height) h-[calc(100svh-var(--header-height))]! left-0"
        >
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Home</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {visibleLinks.map((link) => (
                                <SidebarMenuItem key={link.href}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isLinkActive(pathname, link.href)}
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
    );
}