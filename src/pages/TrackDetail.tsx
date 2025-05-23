import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Track } from "../types";
import { getTrackById } from "../api/tracks";
import { Link } from "react-router-dom";
import { usePlayerStore } from "../store/playerStore";
import { MdOndemandVideo } from "react-icons/md";

const formatDuration = (ms: number) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const TrackDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [track, setTrack] = useState<Track | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { playTrack, currentTrack, setCurrentTrack, openMusicVideo } =
    usePlayerStore();

  useEffect(() => {
    const fetchTrackData = async () => {
      try {
        if (!id) return;

        const response = await getTrackById(id);
        const trackData = response.data;

        // Check and set songType if not present
        if (!trackData.songType) {
          if (trackData.songUrl && trackData.songUrl.includes("/videos/")) {
            trackData.songType = "MUSIC_VIDEO";
          } else {
            trackData.songType = "SONG";
          }
        }

        console.log("Loaded track with data:", trackData);
        console.log("Song type:", trackData.songType);

        setTrack(trackData);
      } catch (err) {
        setError("Failed to fetch track data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrackData();
  }, [id]);

  const handlePlayTrack = () => {
    if (track) {
      console.log("Playing track from TrackDetail:", track);
      console.log("Track song type:", track.songType);
      setCurrentTrack(track);
      playTrack();
    }
  };

  const handleWatchVideo = () => {
    if (track) {
      console.log("Opening music video for:", track);

      // Ensure the track is set as current
      setCurrentTrack(track);

      // Then open the video
      openMusicVideo();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-spotify-green"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-white">Track not found</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Track Header */}
      <div className="flex items-end gap-6 mb-8">
        <img
          src={track.coverUrl}
          alt={track.title}
          className="w-48 h-48 rounded-lg object-cover"
        />
        <div>
          <h1 className="text-5xl font-bold mb-4">{track.title}</h1>
          <div className="flex items-center gap-2 text-xl">
            <Link
              to={`/artist/${track.artistId}`}
              className="text-gray-400 hover:underline"
            >
              {track.artistName}
            </Link>
            <span className="text-gray-400">•</span>
            <Link
              to={`/album/${track.albumId}`}
              className="text-gray-400 hover:underline"
            >
              {track.albumName}
            </Link>
          </div>
          <p className="text-gray-500 mt-2">
            {formatDuration(track.durationMs)} •{" "}
            {track.explicit ? "Explicit" : "Clean"}
            {track.songType && <span> • {track.songType}</span>}
          </p>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handlePlayTrack}
              className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition-colors"
            >
              {currentTrack?.id === track.id ? "Playing" : "Play"}
            </button>

            {track.songType === "MUSIC_VIDEO" && (
              <button
                onClick={handleWatchVideo}
                className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <MdOndemandVideo size={20} />
                <span>Xem video</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Track Info */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">About the track</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-gray-400 mb-2">Popularity</h3>
            <p className="text-white">{track.popularity}%</p>
          </div>
          <div>
            <h3 className="text-gray-400 mb-2">Track Number</h3>
            <p className="text-white">{track.trackNumber}</p>
          </div>
          {track.songType && (
            <div>
              <h3 className="text-gray-400 mb-2">Type</h3>
              <p className="text-white">{track.songType}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackDetail;
