import { Input } from "@/components/ui/input"
import { Button, buttonVariants } from "@/components/ui/button"
import Link from "next/link"

const mediaTypes = [//movies and short films are also supposed to work but they don't show up in search
    "all", "podcast", "music", "musicVideo", "audiobook", "tvShow", "software", "ebook"
]

interface iTunesResult{
    trackId: number;
    trackName: string;
    artistName: string;
    artworkUrl100: string;
}

interface iTunesResponse{
    resultCount: number;
    results: iTunesResult[];
}

export default async function Page({searchParams}: {searchParams: Promise<{[key: string]: string | undefined}>}) {
    const params = await searchParams;
    const queryTerm = params.q || "";
    const mediaType = params.media || "all";
    const query = new URLSearchParams({
        term: queryTerm,
        media: mediaType,
        limit: "10"
    });
    const response = await fetch(`https://itunes.apple.com/search?${query.toString()}`);
    if (!response.ok) {
        return <div className="py-5">Failed to load iTunes results</div>
    }
    const data: iTunesResponse = await response.json();
    const results = data.results;

    return (
    <div className="max-w-lg mx-auto">
        <form className="flex flex-row">
            <Input name="q" placeholder="Search the iTunes catalog" defaultValue={queryTerm}/>
            <input type="hidden" name="media" value={mediaType} />
            <Button type="submit">Search</Button>
        </form>
        <div className="flex flex-wrap gap-2 py-2 justify-center">
            {mediaTypes.map((type) => (
                <Link key={type} href={`?q=${queryTerm}&media=${type}`} className={
                    buttonVariants({
                        variant: mediaType === type ? "default" : "outline",
                        size: "sm"
                })}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                </Link>
            ))}
        </div>
        <div className="text-xl font-bold py-2 text-center">Catalog Results</div>
        <div className="flex flex-col py-2">
            {(results.length > 0) ? (
                results.map((track, index) => (
                    <div key={track.trackId || index}>
                        <div className="flex py-2">
                            <img src={track.artworkUrl100} alt="Thumbnail" />
                            <div className="flex flex-col px-2"><strong>{track.trackName}</strong>{track.artistName}</div>
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
    </div>
  );
}