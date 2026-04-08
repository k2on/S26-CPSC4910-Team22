import { Input } from "@/components/ui/input"
import { Button, buttonVariants } from "@/components/ui/button"
import Link from "next/link"
import {
    ShoppingCart,
    ArrowLeft,
    ArrowRight
}from "lucide-react";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { AddToCartButton } from "@/components/catalog/AddToCartButton";
import { BuyNowButton } from "@/components/catalog/BuyNowButton";
import { CatalogHeader } from "@/components/catalog/CatalogHeader";

const mediaTypes = [
    "music", "musicVideo", "audiobook", "tvShow"
    //movies and short films are excluded for not actually existing in search api
    //software and ebooks are excluded for different return structure
    //podcasts are excluded because they're almost all free and thus not really relevant to a purchasing system
    //"all" is excluded so the other excluded categories don't show up and cause issues
]

const pointsPerDollar = 100; //1 point = 1 cent
const defaultPrice = 100;//some things show up with a missing price, thanks iTunes

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

const fixMediaType = (type: string) => {
    if(type === "musicVideo"){
        return "Music Video";
    }else if(type === "tvShow"){
        return "TV Show";
    }else{
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
}

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

const getId = (item: iTunesResult) => {
    if(item.wrapperType == "audiobook"){
        return item.collectionId;
    }else{
        return item.trackId;
    }
}

export default async function Page({params, searchParams}: {
    params: Promise<{ slug: string }>,
    searchParams: Promise<{[key: string]: string | undefined}>}) {
    const { slug } = await params;
    const queryParams = await searchParams;
    const queryTerm = queryParams.q || "";
    const mediaType = queryParams.media || "music";
    const currentPage = Number(queryParams.page) || 0;
    const itemsPerPage = 10;
    const searchLimit = 200;
    const offset = currentPage * itemsPerPage;
    const fullQuery = new URLSearchParams({
        term: queryTerm,
        media: mediaType,
        limit: searchLimit.toString()
    });
    const org = await fetchQuery(api.myFunctions.getVisibleOrganizationBySlugForDriver, {slug});
    const organizationId = org?._id || org?._id.toString() || "";

    const fullResponse = await fetch(`https://itunes.apple.com/search?${fullQuery.toString()}`);
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
            <CatalogHeader slug={slug}/>
            <form className="flex flex-row">
                <Input name="q" placeholder="Search the iTunes catalog" defaultValue={queryTerm}/>
                <Input type="hidden" name="media" value={mediaType} />
                <Button type="submit">Search</Button>
            </form>
            <div className="flex flex-wrap gap-2 py-2 justify-center">
                {mediaTypes.map((type) => (
                    <Link key={type} href={`/${slug}/catalog?q=${queryTerm}&media=${type}&page=0`} className={
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
                        <div key={track.trackId || track.collectionId || index}>
                            <div className="flex py-2">
                                <img src={track.artworkUrl100} alt="Thumbnail" />
                                <div className="flex flex-col px-2 justify-center"><strong>{getName(track)}</strong>{track.artistName}<div>Price: {getPrice(track)} Points</div></div>
                                <div className="flex flex-col justify-center ml-auto">
                                    <AddToCartButton
                                        slug={slug}
                                        trackId={getId(track)}
                                        mediaType={track.kind || track.wrapperType}
                                        name={getName(track)}
                                        artistName={track.artistName}
                                        price={getPrice(track)}
                                        artworkUrl={track.artworkUrl100}
                                    />
                                    <div className="py-1" />
                                    <BuyNowButton
                                        slug={slug}
                                        trackId={getId(track)}
                                    />
                                </div>
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
                    <Link href={`/${slug}/catalog?q=${queryTerm}&media=${mediaType}&page=${currentPage-1}`} className={
                        buttonVariants({
                            variant: "default",
                            size: "lg"
                        })}>
                        <ArrowLeft />
                    </Link>
                </div>}
                {endIndex < fullResults.length && <div className="flex flex-row justify-end ml-auto">
                    <Link href={`/${slug}/catalog?q=${queryTerm}&media=${mediaType}&page=${currentPage+1}`} className={
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
