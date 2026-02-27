import { type LucideIcon, UserRoundIcon, AtSignIcon, KeyIcon, ImageIcon } from "lucide-react"
import { JSX } from "react";
import { UserUpdateGeneral } from "@/components/admin/users/UpdateGeneral";
import { UserUpdateImage } from "@/components/admin/users/UpdateImage";
import { UserUpdateEmail } from "@/components/admin/users/UpdateEmail";
import { UserUpdatePassword } from "@/components/admin/users/UpdatePassword";
import { UserPageProps } from "./types";

export const LINKS = [
        {
                label: "General",
                icon: UserRoundIcon,
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
                component: UserUpdatePassword
        }
] as const satisfies { label: string, icon: LucideIcon, component: (props: UserPageProps) => JSX.Element }[];





