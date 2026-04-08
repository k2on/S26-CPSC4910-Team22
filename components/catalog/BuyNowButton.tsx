"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface ButtonParams { 
    slug: string;
    trackId: number;
}

export function BuyNowButton({ slug, trackId }: ButtonParams) {
    const router = useRouter();
    const org = useQuery(api.myFunctions.getVisibleOrganizationBySlugForDriver, { slug });
    const organizationId = org?._id ? String(org._id) : undefined;
    const isOwned = useQuery(api.cart.isOwned, {trackId});

    const handleClick = async () => {
        router.push(`catalog/purchase?id=${trackId}`);
    }

    return ( 
        <div>
            {(!isOwned) && (<Button 
                disabled={!organizationId}
                variant="default"
                size="sm"
                onClick={handleClick}
                className="w-full justify-center flex gap-2">
                    Buy Now
            </Button>)}
        </div>
    );
} 