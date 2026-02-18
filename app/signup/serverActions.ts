"use server";

import { api } from "@/convex/_generated/api";
import { fetchAuthMutation } from "@/lib/auth-server";

//used to fix error where page sometimes couldn't find user auth on sign up
export async function createUserProfileServer(args: {
    role: "driver" | "sponsor" | "admin";
    address?: string;
    profilePictureBorderColor?: string;
    profilePictureId?: string;
}) {
    return fetchAuthMutation(api.userProfiles.createUserProfile, args);
}
