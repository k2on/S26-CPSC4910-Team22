import { ReactNode } from "react";
import { notFound } from "next/navigation";
import { fetchAuthQuery } from "@/lib/auth-server";
import { api } from "@/convex/_generated/api";
import { MainSidebar } from "@/components/MainSidebar";

type Props = {
    children: ReactNode;
};

export default async function MainSidebarEndpointsLayout({ children }: Props) {
    const user = await fetchAuthQuery(api.myFunctions.getMe);

    if (!user) {
        notFound();
    }

    return (
        <>
            <MainSidebar role={user.role} />
            {children}
        </>
    );
}