"use client";

import Link from "next/link";
import { Home } from "lucide-react";
import { UserDropdown } from "./header/UserDropdown";
import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";

export function Header() {
    const { data, isPending } = authClient.useSession();

    return (
        <header className="bg-background sticky top-0 z-50 flex w-full items-center border-b">
            <div className="flex h-(--header-height) w-full items-center justify-between gap-2 px-4">
                <Link href="/" className="font-semibold">
                    cpsc4911.com
                </Link>

                {!isPending && data ? (
                    <div className="flex items-center gap-2">
                        <Link href="/home">
                            <Button variant="outline" size="icon" aria-label="Return to home page">
                                <Home />
                            </Button>
                        </Link>
                        <UserDropdown />
                    </div>
                ) : (
                    <Link href="/signin">
                        <Button>Login</Button>
                    </Link>
                )}
            </div>
        </header>
    );
}