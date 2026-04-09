import { OwnedManager } from "@/components/catalog/OwnedManager";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    return (
        <div className="max-w-2xl mx-auto py-4">
            <OwnedManager slug={slug} />
        </div>
    );
}