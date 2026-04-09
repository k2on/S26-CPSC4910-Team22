"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";

interface CartItemProperties {
    slug: string;
    trackId: number;
    mediaType: string;
    name: string;
    artistName: string;
    price: number;
    artworkUrl: string;
}

export function AddToCartButton({ trackId, slug, mediaType, name, artistName, price, artworkUrl }: CartItemProperties) {
    const org = useQuery(api.myFunctions.getVisibleOrganizationBySlugForDriver, { slug });
    const organizationId = org?._id ? String(org._id) : undefined;
    const cartItems = useQuery(api.cart.getMyCart, organizationId ? { organizationId } : "skip");
    const addToCart = useMutation(api.cart.addToCart);
    const removeFromCart = useMutation(api.cart.removeFromCart);
    const isInCart = cartItems?.some((item) => item.trackId === trackId);
    const isOwned = useQuery(api.cart.isOwned, {trackId});

    const handleToggle = async () => {
        if(!organizationId){
            console.error("OrgId not found, can't add to cart");
            return;
        }
        if(isInCart){
            await removeFromCart({trackId, organizationId});
        }else{
            await addToCart({
                organizationId,
                trackId,
                mediaType,
                name,
                artistName,
                price,
                artworkUrl,
            });
        }
    };

    return (
        <div>
            {(!isOwned) ? (<Button
                disabled={!organizationId}
                variant={isInCart ? "destructive" : "default"}
                size="sm"
                onClick={handleToggle}
                className="w-full justify-center flex gap-2"
            >
                {isInCart ? (
                    <div>Remove from Cart</div>
                ) : (
                    <div>Add to Cart</div>
                )}
            </Button>) : (
                <div className="flex flex-col w-full my-auto text-center gap-2">Already Owned</div>
            )}
        </div>
    )
}