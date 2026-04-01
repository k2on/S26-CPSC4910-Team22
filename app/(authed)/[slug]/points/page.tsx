import { OrganizationPoints } from "@/components/org/ManagePoints";

// need to update for driver role
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    return (
        <div className="pt-8">
            <OrganizationPoints slug={slug} />
        </div>
    );
}