import { OrganizationDrivers } from "@/components/org/ManageDrivers";

// need to update for driver role
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    return (
        <div className="pt-8">
            <OrganizationDrivers slug={slug} />
        </div>
    );
}