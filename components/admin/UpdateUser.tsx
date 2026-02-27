import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "../ui/breadcrumb";
import { DialogContent, DialogDescription, DialogTitle } from "../ui/dialog";
import { SidebarProvider, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, Sidebar } from "../ui/sidebar";

import { useState } from "react";
import { LINKS } from "./users/sidebar/links";

export function UpdateUserDialogContent({ userId }: { userId: string }) {
        type Link = typeof LINKS[number]['label'];
        const [page, setPage] = useState<Link>("General");

        const Page = LINKS.find(p => p.label == page)!.component;

        return (
                <DialogContent className="overflow-hidden p-0 md:max-h-[500px] md:max-w-[700px] lg:max-w-[800px]">
                        <DialogTitle className="sr-only">Update User</DialogTitle>
                        <DialogDescription className="sr-only">Make changes to the user. Click save when you're done.</DialogDescription>
                        <SidebarProvider className="items-start">
                                <Sidebar collapsible="none" className="hidden md:flex">
                                        <SidebarContent>
                                                <SidebarGroup>
                                                        <SidebarGroupContent>
                                                                <SidebarMenu>
                                                                        {LINKS.map((item) => (
                                                                                <SidebarMenuItem key={item.label}>
                                                                                        <SidebarMenuButton
                                                                                                asChild
                                                                                                isActive={item.label === page}
                                                                                                onMouseDown={() => setPage(item.label)}
                                                                                        >
                                                                                                <a href="#">
                                                                                                        <item.icon />
                                                                                                        <span>{item.label}</span>
                                                                                                </a>
                                                                                        </SidebarMenuButton>
                                                                                </SidebarMenuItem>
                                                                        ))}
                                                                </SidebarMenu>
                                                        </SidebarGroupContent>
                                                </SidebarGroup>
                                        </SidebarContent>
                                </Sidebar>
                                <main className="flex h-[480px] flex-1 flex-col overflow-hidden">
                                        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                                                <div className="flex items-center gap-2 px-4">
                                                        <Breadcrumb>
                                                                <BreadcrumbList>
                                                                        <BreadcrumbItem className="hidden md:block">
                                                                                <BreadcrumbLink href="#">Update User</BreadcrumbLink>
                                                                        </BreadcrumbItem>
                                                                        <BreadcrumbSeparator className="hidden md:block" />
                                                                        <BreadcrumbItem>
                                                                                <BreadcrumbPage>{page}</BreadcrumbPage>
                                                                        </BreadcrumbItem>
                                                                </BreadcrumbList>
                                                        </Breadcrumb>
                                                </div>
                                        </header>
                                        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 pt-0">
                                                <Page userId={userId} />
                                        </div>
                                </main>
                        </SidebarProvider>
                </DialogContent>
        );
}
