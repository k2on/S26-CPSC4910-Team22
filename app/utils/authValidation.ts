import { authClient } from "@/lib/auth-client";

// avoids errors trying to access token identifier immediately after getting auth
export async function waitForAuth(maxAttempts = 10, timeBetweenAttempts = 200) {
    for (let i = 0; i < maxAttempts; i++) {
        const session = await authClient.getSession();
        if (session?.data?.session) return true;
        await new Promise((r) => setTimeout(r, timeBetweenAttempts));
    }
    return false;
}
