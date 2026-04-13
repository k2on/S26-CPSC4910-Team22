"use client";

import { PurchaseButton } from "@/components/catalog/PurchaseButton";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface iTunesResult{
    wrapperType: string;
    kind: string;
    trackId: number;
    collectionId: number;
    trackName: string;
    collectionName: string;
    artistName: string;
    artworkUrl100: string;
    resultCount: string;
    trackPrice: number;
    collectionPrice: number;
}

const defaultPrice = 100;

const getPrice = (item: iTunesResult, pointValue: number) => {
    const price = item.trackPrice || item.collectionPrice || 0;
    const workingPointValue = pointValue > 0 ? pointValue : 0.01;
    const points = Math.abs(Math.round(price / workingPointValue));
    if(points == 0){
        return defaultPrice;
    }else{
        return points;
    }
}

const getName = (item: iTunesResult) => {
    if(item.wrapperType == "audiobook"){
        return item.collectionName;
    }else{
        return item.trackName;
    }
}

export function PurchaseManager({slug, item, itemId}: {
    slug: string;
    item: iTunesResult;
    itemId: string;
}) {
    const pointValue = useQuery(api.myFunctions.getOrgPointValue, {slug});
    if(pointValue === undefined){
        return <div className="max-w-lg mx-auto text-center py-10">Loading...</div>
    }

    return (
        <div className="max-w-lg mx-auto py-4">
            <Link href={`/${slug}/catalog`} className="flex py-2 mx-auto">
                <div className="flex flex-row mx-auto"><ArrowLeft />Back to Catalog</div>
            </Link>
            <div className="flex flex-col">
                <img src={item.artworkUrl100} alt="Thumbnail" className="mx-auto"/>
                <div className="text-center py-2 flex flex-col">
                    <strong>{getName(item)}</strong>{item.artistName}
                    <div className="py-5">
                        Would you like to purchase this item for {getPrice(item, pointValue)} points?   
                    </div> 
                    <PurchaseButton
                        slug={slug}
                        trackId={Number(itemId)}
                        price={getPrice(item, pointValue)}
                    />
                </div>
            </div>
        </div>
    );
}
