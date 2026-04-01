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
    BookUp,
    CircleDollarSign,
    House,
    LucideIcon,
    Settings,
    ScrollText,
    UserRoundIcon,
    UsersRoundIcon,
} from "lucide-react";

export type OrganizationSidebarRole = "admin" | "sponsor" | "driver";

const LINKS = [
    {
        label: "General",
        href: "",
        icon: House,
        roles: ["admin", "sponsor", "driver"],
    },
    {
        label: "Members",
        href: "/members",
        icon: UsersRoundIcon,
        roles: ["admin", "sponsor"],
    },
    {
        label: "Driver Management",
        href: "/driver-management",
        icon: UserRoundIcon,
        roles: ["admin", "sponsor"],
    },
    {
        label: "Points",
        href: "/points",
        icon: CircleDollarSign,
        roles: ["admin", "sponsor", "driver"],
    },
    {
        label: "Catalog",
        href: "/catalog",
        icon: BookUp,
        roles: ["admin", "sponsor", "driver"],
    },
    {
        label: "Audit Log",
        href: "/log",
        icon: ScrollText,
        roles: ["admin"],
    },
    {
        label: "Settings",
        href: "/settings",
        icon: Settings,
        roles: ["admin", "sponsor"],
    },
] satisfies {
    label: string;
    href: string;
    icon: LucideIcon;
    roles: OrganizationSidebarRole[];
}[];

function isLinkActive(pathname: string, href: string) {
    if (href === "") {
        return pathname === "";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
}

export function OrganizationSidebar({
                                        baseUrl,
                                        role,
                                    }: {
    baseUrl: string;
    role: OrganizationSidebarRole;
}) {
    const pathname = usePathname();

    const visibleLinks = LINKS.filter((link) => link.roles.includes(role));

    return (
        <Sidebar
            collapsible="offcanvas"
            className="top-(--header-height) h-[calc(100svh-var(--header-height))]! left-[--sidebar-width]"
        >
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Organization</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {visibleLinks.map((link) => {
                                const href = `${baseUrl}${link.href}`;
                                return (
                                    <SidebarMenuItem key={href}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isLinkActive(pathname, href)}
                                        >
                                            <Link href={href}>
                                                <link.icon />
                                                <span>{link.label}</span>
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