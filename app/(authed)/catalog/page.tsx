import { Input } from "@/components/ui/input"
import { Button, buttonVariants } from "@/components/ui/button"
import Link from "next/link"
import {
    ArrowLeft,
    ArrowRight
}from "lucide-react";

const mediaTypes = [//movies and short films are also supposed to work but they don't show up in search
    "all", "podcast", "music", "musicVideo", "audiobook", "tvShow", "software", "ebook"
]

const pointsPerDollar = 100; //1 point = 1 cent

interface iTunesResult{
    trackId: number;
    trackName: string;
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

const fixMediaType = async (type: string) => {
    if(type === "musicVideo"){
        return "Music Video";
    }else if(type === "tvShow"){
        return "TV Show";
    }else{
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
}

const getPrice = async (item: iTunesResult) => {
    if(item.trackPrice > 0){
        return (item.trackPrice*pointsPerDollar).toFixed(0);
    }else{
        return (item.collectionPrice*pointsPerDollar).toFixed(0);
    }
}

export default async function Page({searchParams}: {searchParams: Promise<{[key: string]: string | undefined}>}) {
    const params = await searchParams;
    const queryTerm = params.q || "";
    const mediaType = params.media || "all";
    const currentPage = Number(params.page) || 0;
    const itemsPerPage = 10;
    const searchLimit = 200
    const offset = currentPage * itemsPerPage
    const fullQuery = new URLSearchParams({
        term: queryTerm,
        media: mediaType,
        limit: searchLimit.toString()
    });

    const fullResponse = await fetch(`https://itunes.apple.com/search?${fullQuery.toString()}`);
    console.log(`https://itunes.apple.com/search?${fullQuery.toString()}`);
    if (!fullResponse.ok){
        console.error("Failed to fetch full search results");
    }
    const fullData: iTunesResponse = await fullResponse.json();
    const fullResults = fullData.results;
    const results = fullResults.slice(offset, offset+itemsPerPage);

    const itemsOnPage = (offset+itemsPerPage < fullResults.length) ? itemsPerPage : fullResults.length-offset
    const startIndex = offset+1
    const endIndex = offset + itemsOnPage

    return (
        <div className="max-w-lg mx-auto">
            <form className="flex flex-row">
                <Input name="q" placeholder="Search the iTunes catalog" defaultValue={queryTerm}/>
                <input type="hidden" name="media" value={mediaType} />
                <Button type="submit">Search</Button>
            </form>
            <div className="flex flex-wrap gap-2 py-2 justify-center">
                {mediaTypes.map((type) => (
                    <Link key={type} href={`?q=${queryTerm}&media=${type}&page=${currentPage}`} className={
                        buttonVariants({
                            variant: mediaType === type ? "default" : "outline",
                            size: "sm"
                        })}>
                        {fixMediaType(type)}
                    </Link>
                ))}
            </div>
            <div className="text-xl font-bold py-2 text-center">Catalog Results</div>
            <div className="flex flex-col py-1">
                {(results.length > 0) ? (
                    results.map((track, index) => (
                        <div key={track.trackId || index}>
                            <div className="flex py-2">
                                <img src={track.artworkUrl100} alt="Thumbnail" />
                                <div className="flex flex-col px-2"><strong>{track.trackName}</strong>{track.artistName}<div>Price: {getPrice(track)} Points</div></div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div>
                        {(queryTerm == "") ? (
                            <div className="flex flex-col mx-auto py-5 text-center">Use the search bar to search for media!</div>
                        ) : (
                            <div className="flex flex-col mx-auto py-5 text-center">No results found</div>
                        )}
                    </div>
                )}
            </div>
            <div className="flex flex-row justify-center">
                {currentPage > 0 && <div>
                    <Link href={`?q=${queryTerm}&media=${mediaType}&page=${currentPage-1}`} className={
                        buttonVariants({
                            variant: "default",
                            size: "lg"
                        })}>
                        <ArrowLeft />
                    </Link>
                </div>}
                {endIndex < fullResults.length && <div className="flex flex-row justify-end ml-auto">
                    <Link href={`?q=${queryTerm}&media=${mediaType}&page=${currentPage+1}`} className={
                        buttonVariants({
                            variant: "default",
                            size: "lg"
                        })} style={{ justifyContent: "right"}}>
                        <ArrowRight />
                    </Link>
                </div>}
            </div>
            {(fullResults.length > 0 && queryTerm != "") && <div className="py-2 text-center">
                Showing {startIndex}-{endIndex} of {fullResults.length} Results 
            </div>}
        </div>
    );
}