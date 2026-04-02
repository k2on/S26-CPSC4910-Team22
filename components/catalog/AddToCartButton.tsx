"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";

interface CartItemProperties {
    organizationId: string,
    trackId: number;
    mediaType: string;
    name: string;
    artistName: string;
    price: number;
    artworkUrl: string;
}

export function AddToCartButton({ trackId, mediaType, name, artistName, price, artworkUrl, organizationId }: CartItemProperties) {
    const cartItems = useQuery(api.cart.getMyCart, { organizationId });
    const addToCart = useMutation(api.cart.addToCart);
    const removeFromCart = useMutation(api.cart.removeFromCart);
    const isInCart = cartItems?.some((item) => item.trackId === trackId);

    const handleToggle = async () => {
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
        <Button
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
        </Button>
    )
}