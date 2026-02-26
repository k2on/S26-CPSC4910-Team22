import { OrganizationMembers } from "@/components/org/Members";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
        const { slug } = await params;
        return (
                <div className="mx-auto max-w-lg pt-8">
                        <OrganizationMembers slug={slug} />
                </div>
        )
}
