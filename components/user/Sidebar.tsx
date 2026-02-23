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
import { type LucideIcon, User2Icon, AtSignIcon, KeyIcon, ImageIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation";

const LINKS = [
    {
        label: "General",
        href: "/user",
        icon: User2Icon
    },
    {
        label: "Profile Image",
        href: "/user/image",
        icon: ImageIcon
    },
    {
        label: "Email",
        href: "/user/email",
        icon: AtSignIcon
    },
    {
        label: "Password",
        href: "/user/password",
        icon: KeyIcon
    }
] satisfies { label: string, href: string, icon: LucideIcon }[];

export function UserSidebar() {
    const pathname = usePathname();

    return (
        <Sidebar collapsible="icon" className="top-(--header-height) h-[calc(100svh-var(--header-height))]!">
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>User</SidebarGroupLabel>
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
