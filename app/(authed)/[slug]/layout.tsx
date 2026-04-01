import { ReactNode } from "react";
import { notFound } from "next/navigation";

import { OrganizationSidebar, OrganizationSidebarRole } from "@/components/org/OrganizationSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { fetchAuthQuery } from "@/lib/auth-server";
import { api } from "@/convex/_generated/api";

export default async function OrganizationLayout({
                                                     children,
                                                     params,
                                                 }: {
    children: ReactNode;
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const me = await fetchAuthQuery(api.myFunctions.getMe);

    if (
        !me ||
        (me.role !== "admin" && me.role !== "sponsor" && me.role !== "driver")
    ) {
        notFound();
    }

    return (
        <SidebarProvider>
            <OrganizationSidebar
                baseUrl={`/${slug}`}
                role={me.role as OrganizationSidebarRole}
            />
            <SidebarInset>
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
}