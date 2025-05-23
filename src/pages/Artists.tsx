import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Artist, Track, Album } from "../types";
import { artistsApi } from "../api";
import { Link } from "react-router-dom";
import { usePlayerStore } from "../store/playerStore";

const formatDuration = (ms: number) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

// Define the extended artist interface that includes API response data
interface ExtendedArtist
  extends Omit<Artist, "albums" | "singles" | "topTracks" | "related"> {
  albums: Album[];
  singles: Album[];
  topTracks: Track[];
  relatedArtists: Artist[];
}

const ArtistDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [artist, setArtist] = useState<ExtendedArtist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setCurrentTrack, playTrack } = usePlayerStore();

  useEffect(() => {
    const fetchArtistData = async () => {
      try {
        if (!id) return;

        // Fetch artist details with all related data
        const artistResponse = await artistsApi.getArtistById(id);
        if (artistResponse.status === 200 && artistResponse.data) {
          const { artist, albums, singles, topTracks, relatedArtists } =
            artistResponse.data;
          setArtist({
            ...artist,
            albums,
            singles,
            topTracks,
            relatedArtists,
          });
        } else {
          setError("Artist not found");
        }
      } catch (err) {
        setError("Failed to fetch artist data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchArtistData();
  }, [id]);

  const handlePlayTrack = (track: Track) => {
    setCurrentTrack(track);
    playTrack();
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!artist) return <div>Artist not found</div>;

  return (
    <div className="p-8">
      {/* Artist Header */}
      <div className="flex items-end gap-6 mb-8">
        <img
          src={artist?.avatarUrl}
          alt={artist?.name}
          className="w-48 h-48 rounded-full object-cover"
        />
        <div>
          <h1 className="text-5xl font-bold mb-4">{artist?.name}</h1>
          <p className="text-gray-400 mb-2">
            {artist?.genres?.length
              ? artist.genres.join(", ")
              : "No genres available"}
          </p>
          <p className="text-gray-500">
            {artist?.monthlyListeners?.toLocaleString() || 0} monthly listeners
          </p>
        </div>
      </div>

      {/* Artist Bio */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">About</h2>
        <p className="text-gray-400">{artist.bio}</p>
      </div>

      {/* Top Tracks */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Popular Tracks</h2>
        <div className="bg-gray-800 rounded-lg">
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-700">
            <div className="col-span-1 text-gray-400">#</div>
            <div className="col-span-5 text-gray-400">Title</div>
            <div className="col-span-4 text-gray-400">Album</div>
            <div className="col-span-2 text-gray-400">Duration</div>
          </div>
          {artist.topTracks.map((track, index) => (
            <div
              key={track.id}
              className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-700 transition-colors cursor-pointer"
              onClick={() => handlePlayTrack(track)}
            >
              <div className="col-span-1 text-gray-400">{index + 1}</div>
              <div className="col-span-5 flex items-center gap-4">
                <img
                  src={track.coverUrl}
                  alt={track.title}
                  className="w-10 h-10 rounded"
                />
                <div>
                  <Link
                    to={`/track/${track.id}`}
                    className="text-white hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {track.title}
                  </Link>
                  {track.explicit && (
                    <span className="ml-2 text-xs bg-gray-600 px-1 rounded">
                      E
                    </span>
                  )}
                </div>
              </div>
              <div className="col-span-4">
                <Link
                  to={`/album/${track.albumId}`}
                  className="text-gray-400 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {track.albumName}
                </Link>
              </div>
              <div className="col-span-2 text-gray-400">
                {formatDuration(track.durationMs)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Albums */}
      {Array.isArray(artist.albums) && artist.albums.length > 0 ? (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Albums</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {artist.albums.map((album) => (
              <Link
                key={album.id}
                to={`/album/${album.id}`}
                className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <img
                  src={album.coverUrl}
                  alt={album.title}
                  className="w-full aspect-square object-cover rounded-lg mb-2"
                />
                <h3 className="font-medium">{album.title}</h3>
                <p className="text-sm text-gray-400">
                  {album.releaseDate.split("-")[0]}
                </p>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-8 text-gray-400">No albums found.</div>
      )}
    </div>
  );
};

export default ArtistDetail;
