"use client";

import type { UserData } from "@/hooks/use-userData";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

type Props = {
    selectedUser?: UserData;
    isUpdatingUser: boolean;
    onToggleUserActive: (user: UserData) => void;
};

export function ManageAccountMenu({
                                      selectedUser,
                                      isUpdatingUser,
                                      onToggleUserActive,
                                  }: Props) {
    const isDisabled = !selectedUser;
    const isActive = selectedUser ? !selectedUser.banned : false;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button type="button" disabled={isDisabled}>
                    Manage Account
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start">
                <DropdownMenuItem disabled>
                    Edit user details
                </DropdownMenuItem>

                <DropdownMenuItem disabled>
                    Log in as user
                </DropdownMenuItem>

                <DropdownMenuItem
                    disabled={isDisabled || isUpdatingUser}
                    onClick={() => {
                        if (!selectedUser) return;
                        onToggleUserActive(selectedUser);
                    }}
                >
                    {isActive ? "Deactivate account" : "Activate account"}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}