<<<<<<< HEAD
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
=======
import { fetchAuthQuery } from "@/lib/auth-server";
import { api } from "@/convex/_generated/api";
import { OrgProvider } from "@/components/org/context";

export default async function RootLayout({
  children,
  params
}: Readonly<{
  params: Promise<{ slug: string }>
  children: React.ReactNode;
}>) {
  const { slug } = await params;

  const org = await fetchAuthQuery(api.myFunctions.getOrg, { organizationSlug: slug });
  if (!org) return <div>Organization not found</div>;

  return <OrgProvider org={org}>{children}</OrgProvider>;
}
>>>>>>> main
