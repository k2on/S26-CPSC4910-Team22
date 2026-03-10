import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
// import {
//   Combobox,
//   ComboboxContent,
//   ComboboxEmpty,
//   ComboboxInput,
//   ComboboxItem,
//   ComboboxList,
// } from "@/components/ui/combobox"

const mediaTypes = [
    "movie", "podcast", "music", "musicVideo", "audiobook", "shortFilm", "tvShow", "software", "ebook", "all"
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
    const query = new URLSearchParams({
        term: queryTerm,
        media: "music",
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
            <Input 
            name="q"
            placeholder="Search the iTunes catalog" 
            defaultValue={queryTerm}
            />
            {/* <Combobox items={mediaTypes}>
            <ComboboxInput placeholder="Sort by media type" />
            <ComboboxContent>
                <ComboboxEmpty>Media types not found</ComboboxEmpty>
                <ComboboxList>
                    {(item) => (
                        <ComboboxItem key={item} value={item}>
                            {item}
                        </ComboboxItem>
                    )}
                </ComboboxList>
            </ComboboxContent>
        </Combobox> */}
        <Button type="submit">Search</Button>
        </form>
        <div className="text-xl font-bold py-2 text-center">Catalog Results</div>
        <div className="flex flex-col py-2">
            {(results.length > 0) ? (
                results.map((track) => (
                    <div key={track.trackId}>
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