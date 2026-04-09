"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function CatalogHeader({ slug }: { slug?: string}){
    const org = useQuery(api.myFunctions.getVisibleOrganizationBySlugForDriver, slug ? { slug } : "skip");
    const organizationId = org?._id;
    const userPoints = useQuery(api.myFunctions.getMyPoints, { organizationId: organizationId || "skip" });
    const cartItems = useQuery(api.cart.getMyCart, organizationId ? { organizationId } : "skip");
    const isLoading = slug && (org === undefined || (organizationId && cartItems === undefined));
    const count = cartItems?.length ?? 0;

    return(
        <div className="flex flex-col items-center border-b pb-4 mb-4 gap-1">
            {slug && (
                <div className="flex items-center gap-2 text-lg font-bold">
                    <span>Welcome to the {org?.name || ""} Catalog!</span>
                </div>
            )}
            <div className="flex items-center gap-2 text-lg font-bold">You have
                {(userPoints !== undefined && userPoints > 0) ? (
                    <div className="text-xl text-green-600">{userPoints}</div>
                ) : (
                    <div className="text-xl text-red-600">0</div>
                )} points</div>
            <div className="flex flex-row justify-center py-2 items-center">
                <ShoppingCart className="h-5 w-5" />
                <div className="px-1" />
                <span className="font-medium">
                    {isLoading ? "Updating cart..." : `${count} ${count === 1 ? 'item' : 'items'} in cart`}
                    {count > 0 && (
                        <Link href={`/${slug}/catalog/cart`}>
                            <Button className="mx-2" size="sm">
                                View My Cart
                            </Button>
                        </Link>
                    )}
                </span>
            </div>
        </div>
    )
}