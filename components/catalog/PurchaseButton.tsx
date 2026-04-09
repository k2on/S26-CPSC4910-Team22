"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";


interface ButtonParams { 
    slug: string;
    trackId: number;
    price: number;
}

export function PurchaseButton({ slug, trackId, price }: ButtonParams) {
    const router = useRouter();
    const [isPurchasing, setIsPurchasing] = useState(false);
    const org = useQuery(api.myFunctions.getVisibleOrganizationBySlugForDriver, { slug });
    const organizationId = org?._id || "";
    const userPoints = useQuery(api.myFunctions.getMyPoints, { organizationId: organizationId || "skip" });
    const purchase = useMutation(api.cart.purchaseSingleItem);
    const handlePurchase = async () => {
        if(!organizationId) return;
        setIsPurchasing(true);
        try{
            await purchase({
                organizationId,
                trackId,
                price
            });
            router.push(`/${slug}/catalog`);
            toast.success("Purchase successful!", {position: "top-right"});
        } catch (err){
            console.error("Failed to purchase item", err);
            toast.error("Failed to purchase item :(")
        } finally {
            setIsPurchasing(false);
        }
    };

    if(org === undefined || userPoints === undefined){
        return <Button disabled>Checking Point Balance...</Button>;
    }

    const sufficientPoints = userPoints >= price;

    return (
        <div className="flex flex-col mx-auto"> 
            {sufficientPoints ? (
                <div className="py-1 mx-auto">
                    <Button
                        disabled={!sufficientPoints || isPurchasing}
                        onClick={handlePurchase}>
                        {isPurchasing ? "Processing Purchase..." : "Confirm Purchase"}
                    </Button>
                </div>
            ) : (
                <div className="py-1 text-red-600 font-bold text-2xl mx-auto center-text justify-center">
                    Insufficient Points. Try being a better driver.
                </div>
            )}
        </div>
    )
}