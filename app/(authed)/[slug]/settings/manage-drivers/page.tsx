import { OrganizationDriverStatusChart } from "@/components/org/manage-drivers/OrganizationDriverStatusChart";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    return (
        <div className="pt-8">
            <OrganizationDriverStatusChart slug={slug} />
        </div>
    );
}