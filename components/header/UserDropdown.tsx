"use client";

import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import Link from "next/link";

export function UserDropdown() {
        const { data } = authClient.useSession();

        const onLogout = async () => {
                await authClient.signOut();
                window.location.href = "";
        }

        return (

                <DropdownMenu>
                        <DropdownMenuTrigger>
                                <Avatar style={{ borderColor: data?.user.imageBorderColor }} className="border">
                                        {data?.user.image && <AvatarImage src={data.user.image} />}
                                        <AvatarFallback>{data?.user.name}</AvatarFallback>
                                </Avatar>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                                <DropdownMenuGroup>
                                        <DropdownMenuLabel>Signed in as {data?.user.name}</DropdownMenuLabel>
                                        <DropdownMenuItem asChild>
                                                <Link href="/user">
                                                        Edit Profile
                                                </Link>
                                        </DropdownMenuItem>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                        <DropdownMenuItem variant="destructive" onClick={onLogout}>
                                                Log out
                                        </DropdownMenuItem>
                                </DropdownMenuGroup>
                        </DropdownMenuContent>
                </DropdownMenu>


        );
}
