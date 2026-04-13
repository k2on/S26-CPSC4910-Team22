"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useState } from "react";

export function CartManager({ slug }: { slug: string }){
    const organizationId = useQuery(api.appFunctions.getOrganizationIdBySlug, {slug});
    const cartItems = useQuery(api.cart.getMyCart, organizationId ? { organizationId } : "skip");
    const remove = useMutation(api.cart.removeFromCart);
    const userPoints = useQuery(api.myFunctions.getMyPoints, organizationId ? { organizationId } : "skip");
    const isLoading = cartItems === undefined || userPoints === undefined;
    const [isPurchasing, setIsPurchasing] = useState(false);
    const purchase = useMutation(api.cart.purchaseCartItems);
    const handlePurchase = async () => {
        if(!organizationId || !cartItems || cartItems.length === 0) return;
        try{
            await purchase({
                organizationId,
                items: cartItems.map((item) => ({
                    trackId: item.trackId,
                    price: item.price,
                })),
            });
        } catch (err){
            console.error("Failed to purchase cart items", err);
        }
    }
    if(cartItems === undefined || !organizationId){
      return (<div>Loading Cart...</div>);
    }
    if(cartItems.length === 0){
        return <div>No Items in Cart</div>
    }
    if(isLoading){
        return <div>Loading point balance...</div>
    }
    const total = cartItems.reduce((sum, item) => sum + item.price, 0);
    const sufficientPoints = !isLoading && userPoints >= total;

    return (
        <div className="py-4 max-w-xl">
            <div className="space-y-4">
                {cartItems.map((item) => (
                    <div className="flex flex-row" key={item._id}>
                        <img src={item.artworkUrl}></img>
                        <div className="flex flex-col">
                            <div className="text-lg font-bold">{item.name}</div>
                            <div className="text-lg">{item.artistName}</div>
                            <div className="text-lg">{item.price.toLocaleString()} Points</div>
                        </div>
                        <div className="my-auto ml-auto align-right">
                            <Button size="sm" variant="destructive" onClick={() => remove({trackId: item.trackId, organizationId: organizationId!})}><Trash2 />Remove</Button>
                        </div>
                    </div>
                ))}
                <div className="border-t-3 border-dashed justify-between items-center">
                    <div className="flex flex-col">
                        <span className="text-xl font-bold mx-auto">Total Cost: {total.toLocaleString()} Points</span>
                        <span className="text-md mx-auto">You Have {userPoints.toLocaleString()} Points</span>
                    
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
                </div>
            </div>
        </div>
    );
}