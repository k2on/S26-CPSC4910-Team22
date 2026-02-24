import { AdminSidebar } from "@/components/admin/Sidebar";
import { api } from "@/convex/_generated/api";
import { fetchAuthQuery } from "@/lib/auth-server";
import { notFound } from "next/navigation";

export default async function RootLayout({
                                             children,
                                         }: Readonly<{
    children: React.ReactNode;
}>) {
    const result = await fetchAuthQuery(api.myFunctions.getMe);
    if (!result || result.role != "admin") return notFound();

    return (
        <div className="flex flex-1 min-h-0">
            <AdminSidebar />
            <div className="flex-1 min-w-0 pt-8 px-4 md:px-6 overflow-y-auto">
                {children}
            </div>
        </div>
    );
}