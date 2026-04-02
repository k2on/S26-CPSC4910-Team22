import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { ArrowLeft } from "lucide-react";
import { CartManager } from "@/components/catalog/CartManager"
import Link from "next/link";

export default async function Page({ params }: { params: Promise<{ slug: string }>}){
    const { slug } = await params;
    
    return(
        <div className="max-w-4xl mx-auto">
            <Link href={`/${slug}/catalog`} className="flex items-center py-2">
                <ArrowLeft />Back to Catalog
            </Link>
            <div className="text-2xl text-bold">Your Cart</div>
            <CartManager slug={slug} />
        </div>
    );
};