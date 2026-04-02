<<<<<<< HEAD
import { OrganizationGeneral } from "@/components/org/OrganizationGeneral";

export default async function Page({
                                       params,
                                   }: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    return (
        <div className="mx-auto max-w-lg pt-8">
            <OrganizationGeneral slug={slug} />
        </div>
    );
}
=======
import { fetchAuthQuery } from "@/lib/auth-server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { DriverApplications } from "@/components/sponsor/DriverApplications";

export default async function OrganizationHome({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const me = await fetchAuthQuery(api.myFunctions.getMe)

  const isSponsor = (me?.role == "admin" || me?.role == "sponsor");

  return (
    <div className="pt-4 w-2xl mx-auto">

      {me?.role == "driver" && <Link href={`${slug}/catelog`}><Button>Catelog</Button></Link>}

      {isSponsor && (
        <>
          <Link href={`${slug}/settings`}><Button>Settings</Button></Link>
          <DriverApplications />
        </>
      )}

    </div>
  );
}
>>>>>>> main
