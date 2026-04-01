import OrganizationSettings from "@/components/org/OrganizationSettings";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    return (
        <div className="p-8">
            <OrganizationSettings slug={slug} />
        </div>
    );
}