import { notFound } from "next/navigation";
import { OrganizationPoints } from "@/components/org/ManagePoints";
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
            <OrganizationPoints
                slug={slug}
                role={me.role}
            />
        </div>
    );
}