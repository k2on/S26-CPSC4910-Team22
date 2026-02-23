"use client";

import Link from "next/link";
import { UserDropdown } from "./header/UserDropdown";
import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";

export function Header() {
        const { data, isPending } = authClient.useSession();

        return (
                <header className="bg-background sticky top-0 z-50 flex w-full items-center border-b">
                        <div className="flex h-(--header-height) w-full items-center gap-2 px-4 justify-between">
                                <Link href="/">
                                        COMPANY
                                </Link>

                                {!isPending && data ? <UserDropdown /> : (
                                        <Link href="/signin">
                                                <Button>Login</Button>
                                        </Link>

                                )}
                        </div>
                </header>
        );
}
