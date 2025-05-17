import { useEffect, useState } from "react";
import { getFavoriteTracks, removeFavoriteTrack } from "../api/user";
import { usePlayerStore } from "../store/playerStore";
import { FaHeart } from "react-icons/fa";
import { musicApi } from "../api";

const LikedSongs = () => {
  const [tracks, setTracks] = useState<any[]>([]);
  const { setCurrentTrack, playTrack } = usePlayerStore();

  useEffect(() => {
    const fetchData = () => {
      getFavoriteTracks().then(setTracks);
    };
    fetchData();
    const handler = () => fetchData();
    window.addEventListener("liked-changed", handler);
    musicApi.getLikedSongs();
    return () => window.removeEventListener("liked-changed", handler);
  }, []);

  const handleRemove = async (trackId: string) => {
    await removeFavoriteTrack(trackId);
    setTracks((tracks) => tracks.filter((t) => t.id !== trackId));
    window.dispatchEvent(new Event("liked-changed"));
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
          <p className="text-gray-400">{tracks.length} bài hát</p>
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
            {tracks.map((track, idx) => (
              <tr
                key={track.id}
                className="hover:bg-white/5 group transition cursor-pointer"
              >
                <td className="py-2 px-2 text-white/70 w-8">{idx + 1}</td>
                <td
                  className="py-2 px-2 flex items-center gap-3"
                  onClick={() => {
                    setCurrentTrack(track);
                    playTrack();
                  }}
                >
                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    className="w-10 h-10 rounded shadow"
                  />
                  <span className="text-white font-medium cursor-default">
                    {track.title}
                  </span>
                </td>
                <td className="py-2 px-2 text-white/60">{track.artistName}</td>
                <td className="py-2 px-2 text-white/60 text-right">
                  {Math.floor((track.durationMs || 0) / 60000)}:
                  {String(
                    Math.floor(((track.durationMs || 0) % 60000) / 1000)
                  ).padStart(2, "0")}
                </td>
                <td>
                  <button
                    onClick={() => handleRemove(track.id)}
                    className="text-spotify-green hover:text-red-500"
                  >
                    <FaHeart className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {tracks.length === 0 && (
          <div className="text-white/60 py-8 text-center">
            Chưa có bài hát yêu thích nào.
          </div>
        )}
      </div>
    </div>
  );
};

export default LikedSongs;
