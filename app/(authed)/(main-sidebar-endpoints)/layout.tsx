import { ReactNode } from "react";
import { notFound } from "next/navigation";

import { MainSidebar, MainSidebarRole } from "@/components/MainSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { fetchAuthQuery } from "@/lib/auth-server";
import { api } from "@/convex/_generated/api";

export default async function MainSidebarLayout({
                                                    children,
                                                }: {
    children: ReactNode;
}) {
    const me = await fetchAuthQuery(api.myFunctions.getMe);

    if (
        !me ||
        (me.role !== "admin" && me.role !== "sponsor" && me.role !== "driver")
    ) {
        notFound();
    }

    return (
        <SidebarProvider>
            <MainSidebar role={me.role as MainSidebarRole} />
            <SidebarInset className="min-w-0">
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
}