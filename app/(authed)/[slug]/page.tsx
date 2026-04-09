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
    <div className="flex flex-col pt-4 w-2xl mx-auto">

      <Link className="mx-auto py-2" href={`${slug}/catalog`}><Button>Catalog</Button></Link>
      {me?.role == "driver" && <Link className="mx-auto py-1" href={`${slug}/owned`}><Button>Owned Items</Button></Link>}

      {isSponsor && (
        <>
          <Link className="mx-auto py-2" href={`${slug}/settings`}><Button>Settings</Button></Link>
          <DriverApplications />
        </>
      )}

    </div>
  );
}
