import { PurchaseButton } from "@/components/catalog/PurchaseButton";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

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

interface iTunesResponse{
    resultCount: number;
    results: iTunesResult[];
}

const pointsPerDollar = 100; //1 point = 1 cent
const defaultPrice = 100;

const getPrice = (item: iTunesResult) => {
    const price = item.trackPrice || item.collectionPrice || 0;
    const points = Math.abs(Math.round(price * pointsPerDollar));
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

export default async function Page({params, searchParams}: {
    params: Promise<{slug: string}>,
    searchParams: Promise<{[key: string]: string | undefined}>
}) {
    const {slug} = await params;
    const queryParams = await searchParams;
    const itemId = queryParams.id;
    const itemResponse = await fetch(`https://itunes.apple.com/lookup?id=${itemId}`);
    if (!itemResponse.ok){
        console.error("Failed to fetch item from iTunes");
    }
    const itemData: iTunesResponse = await itemResponse.json();
    const item = itemData.results[0];

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
                        Would you like to purchase this item for {getPrice(item)} points?   
                    </div> 
                    <PurchaseButton
                        slug={slug}
                        trackId={Number(itemId)}
                        price={getPrice(item)}
                    />
                </div>
            </div>
        </div>
    );
}
