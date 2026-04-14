import { notFound } from "next/navigation";
import { OrganizationPoints } from "@/components/org/ManagePoints";
import { PointTransfer } from "@/components/org/points/PointTransfer";
import { fetchAuthQuery } from "@/lib/auth-server";
import { api } from "@/convex/_generated/api";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const me = await fetchAuthQuery(api.myFunctions.getMe);

    if (
        !me ||
        (me.role !== "admin" && me.role !== "sponsor" && me.role !== "driver")
    ) {
        notFound();
    }

    return (
        <div className="pt-8">
            <div className="mb-12">
                <OrganizationPoints
                    slug={slug}
                    role={me.role}
                />
            </div>

            {me.role === "driver" ? (
                <PointTransfer slug={slug} />
            ) : null}
        </div>
    );
}