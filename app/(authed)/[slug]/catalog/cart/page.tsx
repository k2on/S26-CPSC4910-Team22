import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { ArrowLeft } from "lucide-react";
import { CartManager } from "@/components/catalog/CartManager"
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function Page({ params }: { params: Promise<{ slug: string }>}){
    const { slug } = await params;
    
    return(
        <div className="max-w-4xl mx-auto">
            <Link href={`/${slug}/catalog`} className="flex py-2 mx-auto">
                <div className="flex flex-row mx-auto"><Button><ArrowLeft />Back to Catalog</Button></div>
            </Link>
            <div className="text-2xl text-bold text-center">Your Cart</div>
            <CartManager slug={slug} />
        </div>
    );
};