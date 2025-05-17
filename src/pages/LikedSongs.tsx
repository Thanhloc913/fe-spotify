import { useEffect, useState } from "react";
import { FaHeart } from "react-icons/fa";
import { musicApi } from "../api";
import { ApiSongType } from "../types/api";
import { ApiProfileType } from "../types/api";
import { getProfilesByIds } from "../api/profileApi";

type LikedSongsInfo = ApiSongType & {
  artistName: string;
  backgroundUrl: string;
  isFav: boolean;
};

const formatDuration = (seconds: number) => {
  // seconds to mm:ss
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const LikedSongs = () => {
  const [favs, setFavs] = useState<LikedSongsInfo[]>([]);
  // const { setCurrentTrack, playTrack } = usePlayerStore();

  useEffect(() => {
    const fetchData = async () => {
      const songs: ApiSongType[] = await musicApi.getLikedSongs();
      const artistIds = Array.from(new Set(songs.map((s) => s.artistId)));
      const artists: ApiProfileType[] = await getProfilesByIds(artistIds);
      const artistMap = Object.fromEntries(artists.map((a) => [a.id, a]));
      setFavs(
        songs.map((song) => ({
          ...song,
          artistName: artistMap[song.artistId]?.fullName || "Unknown Artist",
          backgroundUrl: song.backgroundUrl,
          isFav: true,
        }))
      );
    };
    fetchData();
  }, []);

  const handleUnFav = async (track: LikedSongsInfo) => {
    const currentProfileId = localStorage.getItem("profile_id");
    if (!currentProfileId) return;
    await musicApi.deleteFavorite(currentProfileId, track.id);
    setFavs((tracks) =>
      tracks.map((t) => (t.id === track.id ? { ...t, isFav: false } : t))
    );
  };

  const handleReFav = async (track: LikedSongsInfo) => {
    const currentProfileId = localStorage.getItem("profile_id");
    if (!currentProfileId) return;
    await musicApi.createFavorite(currentProfileId, track.id);
    setFavs((tracks) =>
      tracks.map((t) => (t.id === track.id ? { ...t, isFav: true } : t))
    );
  };

  return (
    <div className="p-8">
      <div className="flex items-end gap-8 mb-8">
        <img
          src="https://misc.scdn.co/liked-songs/liked-songs-640.png"
          alt="Liked Songs"
          className="w-48 h-48 object-cover rounded-lg shadow-lg"
        />
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Liked Songs</h1>
          <p className="text-gray-400">{favs.length} bài hát</p>
        </div>
      </div>
      <div className="bg-black/30 rounded-lg p-4">
        <table className="w-full text-left">
          <thead>
            <tr className="text-white/70 text-sm border-b border-white/10">
              <th className="py-2 px-2 font-normal">#</th>
              <th className="py-2 px-2 font-normal">Tiêu đề</th>
              <th className="py-2 px-2 font-normal">Nghệ sĩ</th>
              <th className="py-2 px-2 font-normal text-right">Thời lượng</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {favs.map((track) => (
              <tr
                key={track.id}
                className="hover:bg-white/5 group transition cursor-pointer"
              >
                <td className="py-2 px-2 text-white/70 w-8">{track.id}</td>
                <td
                  className="py-2 px-2 flex items-center gap-3"
                  onClick={() => {
                    // setCurrentTrack(track);
                    // playTrack();
                  }}
                >
                  <img
                    src={track.backgroundUrl}
                    alt={track.title}
                    className="w-10 h-10 rounded shadow"
                  />
                  <span className="text-white font-medium cursor-default">
                    {track.title}
                  </span>
                </td>
                <td className="py-2 px-2 text-white/60">{track.artistName}</td>
                <td className="py-2 px-2 text-white/60 text-right">
                  {formatDuration(track.duration)}
                </td>
                <td>
                  <button
                    onClick={() =>
                      track.isFav ? handleUnFav(track) : handleReFav(track)
                    }
                    className={
                      track.isFav
                        ? "text-spotify-green hover:text-red-500"
                        : "text-gray-400 hover:text-spotify-green"
                    }
                  >
                    <FaHeart
                      className={`w-5 h-5 ${track.isFav ? "" : "opacity-50"}`}
                    />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {favs.length === 0 && (
          <div className="text-white/60 py-8 text-center">
            Chưa có bài hát yêu thích nào.
          </div>
        )}
      </div>
    </div>
  );
};

export default LikedSongs;
