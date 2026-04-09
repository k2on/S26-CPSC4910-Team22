"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api"
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

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

const getName = (item: iTunesResult) => {
    if(item.wrapperType == "audiobook"){
        return item.collectionName;
    }else{
        return item.trackName;
    }
}

function OwnedEntry({ trackId }: { trackId: number }){
    const [item, setItem] = useState<iTunesResult | null>(null); 
    useEffect(() => {
        const fetchItem = async () => {
            try{
                const itemResponse = await fetch(`https://itunes.apple.com/lookup?id=${trackId}`);
                const itemData: iTunesResponse = await itemResponse.json();
                setItem(itemData.results[0]);
            } catch (err){
                console.error("Failed to fetch item from iTunes", err);
                setItem(null);
            }
        };
        fetchItem();
    }, [trackId]);
    if(!item){
        return <div>Loading...</div>;
    }else{
        return(
            <div className="flex flex-row items-left py-1 text-xl">
                <img className="w-24 h-24" src={item.artworkUrl100} alt={getName(item)} />
                <div className="flex flex-col px-2">
                    <strong>{getName(item)}</strong>
                    <div>{item.artistName}</div>
                </div>
            </div>
        );
    }
}

const getResponse = async (trackId: number) => {
    const itemResponse = await fetch(`https://itunes.apple.com/lookup?id=${trackId}`);
    const itemData: iTunesResponse = await itemResponse.json();
    return getName(itemData.results[0]);
}

export function OwnedManager({ slug }: { slug: string }){
    const router = useRouter();
    const ownedItems = useQuery(api.myFunctions.getMyOwned, {});
    const handleClick = async () => {
        router.push(`/${slug}`)
    }

    if(ownedItems === undefined){
        return <div className="text-2xl text-center">Loading...</div>;
    }
    if(ownedItems.length === 0){
        return (
            <div className="text-2xl text-center">
                No owned items found. 
                Try earning some points and go shopping in your organization's catalog!
            </div>
         );
    }

    return (
        <div className="text-2xlpy-2">
            <Button className="y-1" onClick={handleClick}><ArrowLeft />Back Home</Button>
            <h1 className="text-2xl text-center py-2">My Owned Items</h1>

            <div>
                {ownedItems?.map((item) => (
                    <OwnedEntry key={item._id} trackId={item.trackId} />
                ))}
            </div>
        </div>
    );
}