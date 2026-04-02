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
