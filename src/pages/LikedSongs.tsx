import { useEffect, useState } from "react";
import { FaHeart, FaPlay, FaPause } from "react-icons/fa";
import { musicApi } from "../api";
import { ApiSongType } from "../types/api";
import { ApiProfileType } from "../types/api";
import { getProfilesByIds } from "../api/profileApi";
import { usePlayerStore } from "../store/playerStore";

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
  const { setCurrentTrack, playTrack, currentTrack, isPlaying, togglePlay } =
    usePlayerStore();

  const fetchLikedSongs = async () => {
    try {
      const songs: ApiSongType[] = await musicApi.getLikedSongs();
      console.log("Đã tải xong:", songs.length, "bài hát");

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
    } catch (error) {
      console.error("Lỗi khi tải bài hát yêu thích:", error);
    }
  };

  useEffect(() => {
    fetchLikedSongs();

    // Lắng nghe sự kiện từ Player.tsx
    const handleLikedChanged = (event: Event) => {
      console.log("Đã nhận sự kiện liked-changed");

      // Kiểm tra xem có custom data từ event không
      if (event instanceof CustomEvent && event.detail) {
        const { songId, action } = event.detail;
        console.log("Chi tiết sự kiện:", songId, action);

        // Cập nhật trực tiếp trạng thái
        if (action === "unlike" && songId) {
          console.log("Xóa bài hát khỏi danh sách:", songId);
          setFavs((currentFavs) =>
            currentFavs.filter((song) => song.id !== songId)
          );
          return;
        }
      }

      // Nếu không có data chi tiết thì tải lại toàn bộ
      fetchLikedSongs();
    };

    window.addEventListener("liked-changed", handleLikedChanged);
    return () =>
      window.removeEventListener("liked-changed", handleLikedChanged);
  }, []);

  const handleUnFav = async (track: LikedSongsInfo) => {
    const currentProfileId = localStorage.getItem("profile_id");
    if (!currentProfileId) return;
    await musicApi.deleteFavorite(currentProfileId, track.id);
    // Xóa bài hát khỏi danh sách hoàn toàn thay vì chỉ đánh dấu
    setFavs((tracks) => tracks.filter((t) => t.id !== track.id));

    // Dispatch với thông tin chi tiết
    window.dispatchEvent(
      new CustomEvent("liked-changed", {
        detail: { songId: track.id, action: "unlike" },
      })
    );
  };

  const handleReFav = async (track: LikedSongsInfo) => {
    const currentProfileId = localStorage.getItem("profile_id");
    if (!currentProfileId) return;
    await musicApi.createFavorite(currentProfileId, track.id);
    setFavs((tracks) =>
      tracks.map((t) => (t.id === track.id ? { ...t, isFav: true } : t))
    );

    // Dispatch với thông tin chi tiết
    window.dispatchEvent(
      new CustomEvent("liked-changed", {
        detail: { songId: track.id, action: "like" },
      })
    );
  };

  const handlePlayTrack = (track: LikedSongsInfo) => {
    if (currentTrack?.id === track.id) {
      togglePlay();
    } else {
      // Đảm bảo có đủ thông tin cần thiết cho Track type
      const enhancedTrack = {
        id: track.id,
        title: track.title,
        artistId: track.artistId,
        artistName: track.artistName,
        albumId: "", // Không có trong ApiSongType
        albumName: "", // Không có trong ApiSongType
        coverUrl: track.backgroundUrl,
        previewUrl: track.songUrl,
        durationMs: track.duration * 1000,
        explicit: false, // Mặc định
        popularity: 0, // Mặc định
        songUrl: track.songUrl,
        backgroundUrl: track.backgroundUrl,
        songType: track.songType,
      };

      setCurrentTrack(enhancedTrack as any);
      playTrack();
    }
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
              <th className="py-2 px-2 font-normal"></th>
              <th className="py-2 px-2 font-normal">Tiêu đề</th>
              <th className="py-2 px-2 font-normal">Nghệ sĩ</th>
              <th className="py-2 px-2 font-normal text-right">Thời lượng</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {favs.map((track, index) => (
              <tr
                key={track.id}
                className="hover:bg-white/5 group transition cursor-pointer"
              >
                <td className="py-2 px-2 text-white/70 w-8">{index + 1}</td>
                <td className="py-2 px-2 w-8">
                  <button
                    onClick={() => handlePlayTrack(track)}
                    className="text-white/70 hover:text-white"
                  >
                    {currentTrack?.id === track.id && isPlaying ? (
                      <FaPause />
                    ) : (
                      <FaPlay />
                    )}
                  </button>
                </td>
                <td
                  className="py-2 px-2 flex items-center gap-3"
                  onClick={() => handlePlayTrack(track)}
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
