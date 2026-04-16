import { OrganizationSelectionChart } from "@/components/home/OrganizationSelectionChart";
import { Applications } from "@/components/driver/Applications";
import { fetchAuthQuery } from "@/lib/auth-server";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button"
import Link from "next/link";

export default async function HomePage() {
    const me = await fetchAuthQuery(api.myFunctions.getMe);

    return (
        <div className="min-w-0 p-6 flex flex-col gap-4">
            <OrganizationSelectionChart />

            {me?.role == "driver" && <Applications />}

            {me?.role == "admin" && <Link className="mx-auto py-1" href={`log`}><Button>Audit Logs</Button></Link>}
        </div>
    );
}
