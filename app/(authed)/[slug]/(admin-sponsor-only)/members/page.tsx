import { OrganizationMembers } from "@/components/org/members/Members";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    return (
        <div className="pt-8">
            <OrganizationMembers slug={slug} />
        </div>
    )
}
