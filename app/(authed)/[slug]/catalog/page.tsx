import { api } from "@/convex/_generated/api";
import { fetchAuthQuery } from "@/lib/auth-server";
import { CatalogManager } from "@/components/catalog/CatalogManager"

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
    
    const me = await fetchAuthQuery(api.myFunctions.getMe);
    const isDriver = (me?.role == "driver");

    const fullResponse = await fetch(`https://itunes.apple.com/search?${fullQuery.toString()}`);
    if (!fullResponse.ok){
        console.error("Failed to fetch full search results");
    }
    const fullData: iTunesResponse = await fullResponse.json();
    const fullResults = fullData.results;
    const results = fullResults.slice(offset, offset+itemsPerPage);

    return(
        <CatalogManager 
        slug={slug} 
        results={results} 
        isDriver={isDriver}
        totalResults={fullResults.length} 
        />
    );
}
