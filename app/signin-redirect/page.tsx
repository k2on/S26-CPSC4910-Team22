"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
    const router = useRouter();
    const { data: session, isPending } = authClient.useSession();

    useEffect(() => {
        if (isPending) return;

        if (!session?.user) {
            router.replace("/signin");
            return;
        }

        const role = (session.user as { role?: string }).role;

        if (role === "admin") {
            router.replace("/admin");
            return;
        }

        router.replace("/");
    }, [isPending, router, session]);

    return <div className="min-h-svh" />;
}