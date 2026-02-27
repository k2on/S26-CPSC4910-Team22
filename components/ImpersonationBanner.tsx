import { fetchAuthQuery } from "@/lib/auth-server";
import { api } from "@/convex/_generated/api";
import { StopImpersonating } from "./StopImpersonating";


export async function ImpersonationBanner() {
        const impersonating = await fetchAuthQuery(api.myFunctions.getImpersonationData);
        if (!impersonating) return;

        return <div className="fixed bottom-0 z-50 w-full bg-orange-300 p-1 flex justify-between items-center">
                Assuming Identity of {impersonating.name}

                <StopImpersonating />
        </div>
}
