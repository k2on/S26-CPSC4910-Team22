import { OrganizationSidebar } from "@/components/org/OrganizationSidebar";

export default async function RootLayout({
  children,
  params
}: Readonly<{
  params: Promise<{ slug: string }>
  children: React.ReactNode;
}>) {
  const { slug } = await params;
  return (
    <div className="flex flex-1 h-full">
      <OrganizationSidebar baseUrl={`/admin/orgs/${slug}`} />
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}


