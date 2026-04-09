import { PurchaseManager } from "@/components/catalog/PurchaseManager";

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

export default async function Page({params, searchParams}: {
    params: Promise<{slug: string}>,
    searchParams: Promise<{[key: string]: string | undefined}>
}) {
    const {slug} = await params;
    const queryParams = await searchParams;
    const itemId = queryParams.id;
    if(!itemId){
        return <div className="max-w-lg mx-auto text-center py-10">No item specified</div>
    }
    const itemResponse = await fetch(`https://itunes.apple.com/lookup?id=${itemId}`);
    if (!itemResponse.ok){
        console.error("Failed to fetch item from iTunes");
    }
    const itemData: iTunesResponse = await itemResponse.json();
    const item = itemData.results[0];
    if(!item){
        return <div className="max-w-lg mx-auto text-center py-10">Failed to fetch item</div>
    }

    return (
        <PurchaseManager
            slug={slug}
            item={item}
            itemId={itemId}
         />
    );
}
