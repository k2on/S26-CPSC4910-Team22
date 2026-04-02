"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function CartManager({ slug }: { slug: string }){
    const org = useQuery(api.myFunctions.getVisibleOrganizationBySlug, {slug});
    const organizationId = org?._id;
    const cartItems = useQuery(api.cart.getMyCart, organizationId ? { organizationId } : "skip");
    const remove = useMutation(api.cart.removeFromCart);
    if(cartItems === undefined || !organizationId){
      return (<div>Loading Cart...</div>);
    }
    if(cartItems.length === 0){
        return <div>No Items in Cart</div>
    }
    const total = cartItems.reduce((sum, item) => sum + item.price, 0);

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
                        <span className="text-xl mx-auto">Total: {total.toLocaleString()} Points</span>
                    </div>
                    <div>
                        
                    </div>
                </div>
            </div>
        </div>
    );
}