import { SponsorSidebar } from "@/components/sponsor/Sidebar";
import { api } from "@/convex/_generated/api";
import { fetchAuthQuery } from "@/lib/auth-server";
import { notFound } from "next/navigation";

export default async function RootLayout({
                                             children,
                                         }: Readonly<{
    children: React.ReactNode;
}>) {
    const result = await fetchAuthQuery(api.myFunctions.getMe)
    if (!result || result.role != "sponsor") return notFound();

    return (
        <div className="flex flex-1">
            <SponsorSidebar />
            <div className="flex-1">
                {children}
            </div>
        </div>
    );
}

