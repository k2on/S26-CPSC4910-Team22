import { api } from "@/convex/_generated/api";
import { fetchAuthQuery } from "@/lib/auth-server";
import { notFound } from "next/navigation";
import { OrganizationsSidebar } from "./OrganizationsSidebar";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const result = await fetchAuthQuery(api.myFunctions.getMe)
  if (!result || result.role != "admin") return notFound();

  return (
    <div className="flex flex-1 h-full">
      <OrganizationsSidebar />
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}

