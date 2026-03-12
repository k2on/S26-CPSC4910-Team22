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

const getPrice = async (item: iTunesResult) => {
    if(item.trackPrice > 0){
        return (item.trackPrice*pointsPerDollar).toFixed(0);
    }else{
        return (item.collectionPrice*pointsPerDollar).toFixed(0);
    }
}

const getName = async (item: iTunesResult) => {
    if(item.wrapperType == "audiobook"){
        return item.collectionName;
    }else{
        return item.trackName;
    }
}

export default async function Page({searchParams}: {searchParams: Promise<{[key: string]: string | undefined}>}) {
    const params = await searchParams;
    const itemId = params.id;
    const itemResponse = await fetch(`https://itunes.apple.com/lookup?id=${itemId}`);
    if (!itemResponse.ok){
        console.error("Failed to fetch item from iTunes");
    }
    const itemData: iTunesResponse = await itemResponse.json();
    const item = itemData.results[0];

    return (
        <div className="max-w-lg mx-auto py-4">
            <div className="flex flex-col">
                <img src={item.artworkUrl100} alt="Thumbnail" className="mx-auto"/>
                <div className="text-center py-2 flex flex-col">
                    <strong>{getName(item)}</strong>{item.artistName}
                    <div className="py-5">
                        Would you like to purchase this item for {getPrice(item)} points?   
                    </div> 
                </div>
            </div>
        </div>
    );
}
