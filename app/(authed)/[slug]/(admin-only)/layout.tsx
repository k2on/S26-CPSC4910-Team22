import { ReactNode } from "react";
import { notFound } from "next/navigation";

import { fetchAuthQuery } from "@/lib/auth-server";
import { api } from "@/convex/_generated/api";

export default async function LogLayout({
                                                 children,
                                             }: {
    children: ReactNode;
}) {
    const me = await fetchAuthQuery(api.myFunctions.getMe);

    if (!me || me.role != "admin") {
        notFound();
    }

    return <>{children}</>;
}