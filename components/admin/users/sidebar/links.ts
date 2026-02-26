import { type LucideIcon, User2Icon, AtSignIcon, KeyIcon, ImageIcon } from "lucide-react"
import { JSX } from "react";
import { UserUpdateGeneral } from "@/components/user/UpdateGeneral";
import { UserUpdateImage } from "@/components/user/UpdateImage";
import { UserUpdateEmail } from "@/components/user/UpdateEmail";
import { AdminUserUpdatePassword } from "@/components/admin/UpdatePassword";

export const LINKS = [
        {
                label: "General",
                icon: User2Icon,
                component: UserUpdateGeneral
        },
        {
                label: "Profile Image",
                icon: ImageIcon,
                component: UserUpdateImage
        },
        {
                label: "Email",
                icon: AtSignIcon,
                component: UserUpdateEmail
        },
        {
                label: "Password",
                icon: KeyIcon,
                component: AdminUserUpdatePassword
        }
] as const satisfies { label: string, icon: LucideIcon, component: () => JSX.Element }[];

