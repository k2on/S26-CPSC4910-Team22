import { AdminSidebar } from "@/components/admin/Sidebar";
import { api } from "@/convex/_generated/api";
import { fetchAuthQuery } from "@/lib/auth-server";
import { notFound } from "next/navigation";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const result = await fetchAuthQuery(api.myFunctions.getMe)
  if (!result || result.role != "admin") return notFound();

  return (
    <div className="flex flex-1">
      <AdminSidebar />
      <div className="w-lg mx-auto pt-8 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

