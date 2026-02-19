"use server";

import { api } from "@/convex/_generated/api";
import { fetchAuthMutation } from "@/lib/auth-server";

// creates new convex userProfiles entry and provides role to existing betterAuth entry
export async function createUserProfileAction(args: {
    address?: string;
    profilePictureBorderColor?: string;
    profilePictureId?: string;
    role: "driver" | "sponsor" | "admin";
}) {
    await fetchAuthMutation(api.services.authUsers.setAuthRole, {
        role: args.role,
    });

    return fetchAuthMutation(api.services.userProfiles.createUserProfile, {
        address: args.address,
        profilePictureBorderColor: args.profilePictureBorderColor,
        profilePictureId: args.profilePictureId,
    });
}
