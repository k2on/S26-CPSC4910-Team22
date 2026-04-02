import { ReactNode } from "react";
import { notFound } from "next/navigation";

import { OrganizationSidebar, OrganizationSidebarRole } from "@/components/org/OrganizationSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { fetchAuthQuery } from "@/lib/auth-server";
import { api } from "@/convex/_generated/api";
import { OrgProvider } from "@/components/org/context";

export default async function OrganizationLayout({
    children,
    params,
}: {
    children: ReactNode;
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const me = await fetchAuthQuery(api.myFunctions.getMe);
    const org = await fetchAuthQuery(api.myFunctions.getOrg, { organizationSlug: slug });

    if (
        !me ||
        (me.role !== "admin" && me.role !== "sponsor" && me.role !== "driver")
    ) {
        notFound();
    }

    if (!org) return <div>Organization not found</div>;

    return (
        <OrgProvider org={org}>
            <SidebarProvider>
                <OrganizationSidebar
                    baseUrl={`/${slug}`}
                    role={me.role as OrganizationSidebarRole}
                />
                <SidebarInset>
                    {children}
                </SidebarInset>
            </SidebarProvider>
        </OrgProvider>
    );
}
