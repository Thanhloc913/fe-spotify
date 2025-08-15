import { useState, useEffect } from "react";
import { FaPlay, FaPause, FaHeart, FaList } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
// import { mockTracks, mockAlbums } from "../mock/data";
import { usePlayerStore } from "../store/playerStore";
import { getUserPlaylists, addTrackToPlaylist } from "../api/user";
import { Track } from "../types";
import { musicApi } from "../api/musicApi";
import { getProfileByAccountID } from "../api/profileApi";
import { getImageUrl } from "../api/storageApi";

const tabs = [
  { key: "all", label: "Tất cả" },
  { key: "artist", label: "Nghệ sĩ" },
  { key: "song", label: "Bài hát" },
  { key: "podcast", label: "Podcast và chương trình" },
  { key: "playlist", label: "Playlist" },
  { key: "album", label: "Album" },
  { key: "profile", label: "Hồ sơ" },
];

// Hàm loại bỏ dấu tiếng Việt để tìm kiếm dễ hơn
// function removeVietnameseTones(str: string) {
//   return str
//     .normalize("NFD")
//     .replace(/\p{Diacritic}/gu, "")
//     .replace(/đ/g, "d")
//     .replace(/Đ/g, "D");
// }

function formatDuration(ms: number) {
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

export default function Search() {
  const { keyword } = useParams();
  const [activeTab, setActiveTab] = useState("all");
  const navigate = useNavigate();
  const { setCurrentTrack, playTrack, currentTrack, isPlaying, togglePlay } =
    usePlayerStore();
  const [showPlaylistPopup, setShowPlaylistPopup] = useState(false);
  const [playlists, setPlaylists] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [likedTracks, setLikedTracks] = useState<string[]>([]);

  // State cho search API
  const [searchResult, setSearchResult] = useState<{ result?: Array<{ id: string; artistId?: string | number; title?: string; duration?: number; durationMs?: number; coverUrl?: string; backgroundUrl?: string; songUrl?: string; previewUrl?: string; storageId?: string; storageImageId?: string }> } | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [artistNames, setArtistNames] = useState<Record<string, string>>({});
  // Thêm state để lưu URL ảnh
  const [songImages, setSongImages] = useState<Record<string, string>>({});

  // Tách hàm loadLikedTracks ra để có thể tái sử dụng
  const loadLikedTracks = async () => {
    try {
      const tracks = await musicApi.getLikedSongs();
      console.log("Đã tải xong danh sách yêu thích:", tracks.length, "bài hát");
      setLikedTracks(tracks.map((t) => t.id));
    } catch (error) {
      console.error("Lỗi khi tải bài hát yêu thích:", error);
    }
  };

  // Load liked tracks khi component mount và lắng nghe sự kiện liked-changed
  useEffect(() => {
    loadLikedTracks();

    // Lắng nghe sự kiện từ các component khác
    const handleLikedChanged = (event: Event) => {
      console.log("Search.tsx: Đã nhận sự kiện liked-changed");

      // Kiểm tra xem có custom data từ event không
      if (event instanceof CustomEvent && event.detail) {
        const { songId, action } = event.detail as { songId?: string; action?: string };
        console.log("Chi tiết sự kiện:", songId, action);

        // Cập nhật trực tiếp trạng thái mà không cần gọi API lại
        if (action === "unlike" && songId) {
          console.log("Xóa bài hát khỏi danh sách yêu thích:", songId);
          setLikedTracks((currentLiked) =>
            currentLiked.filter((id) => id !== songId)
          );
          return;
        } else if (action === "like" && songId) {
          console.log("Thêm bài hát vào danh sách yêu thích:", songId);
          setLikedTracks((currentLiked) => [...currentLiked, songId]);
          return;
        }
      }

      // Nếu không có data chi tiết thì tải lại toàn bộ
      loadLikedTracks();
    };

    window.addEventListener("liked-changed", handleLikedChanged);
    return () =>
      window.removeEventListener("liked-changed", handleLikedChanged);
  }, []);

  const query = keyword ? decodeURIComponent(keyword) : "";

  useEffect(() => {
    if (!query) {
      setSearchResult(null);
      return;
    }
    setSearchLoading(true);
    setSearchError(null);
    musicApi
      .searchSongsByTitle(query, 1, 10)
      .then((res) => {
        setSearchResult(res.data || res); // tuỳ API trả về
      })
      .catch(() => {
        setSearchError("Có lỗi xảy ra khi tìm kiếm");
        setSearchResult(null);
      })
      .finally(() => setSearchLoading(false));
  }, [query]);

  // Thêm useEffect để tải lại danh sách yêu thích mỗi khi tìm kiếm xong
  useEffect(() => {
    if (searchResult && searchResult.result && searchResult.result.length > 0) {
      loadLikedTracks();
    }
  }, [searchResult]);

  useEffect(() => {
    if (!searchResult || !searchResult.result) return;
    const artistIds = Array.from(
      new Set(
        searchResult.result
          .map((song) => String(song.artistId))
          .filter(Boolean)
      )
    ) as string[];

    // Lấy tất cả ID nghệ sĩ cần tìm
    artistIds.forEach(async (id: string) => {
      try {
        const profile = await getProfileByAccountID(id);
        if (profile && profile.fullName) {
          setArtistNames((prev) => ({ ...prev, [id]: profile.fullName }));
        } else {
          console.log(`Không tìm thấy thông tin nghệ sĩ ID: ${id}`);
          setArtistNames((prev) => ({
            ...prev,
            [id]: "Nghệ sĩ không xác định",
          }));
        }
      } catch (error) {
        console.error(`Lỗi khi lấy thông tin nghệ sĩ ID ${id}:`, error);
        setArtistNames((prev) => ({ ...prev, [id]: "Nghệ sĩ không xác định" }));
      }
    });
  }, [searchResult]);

  // Thêm useEffect để lấy ảnh từ storageImageId
  useEffect(() => {
    if (!searchResult || !searchResult.result) return;

    // Lấy danh sách các bài hát cần lấy ảnh (song không có coverUrl và có storageImageId)
    const songsNeedImage = searchResult.result.filter(
      (song) => !song.coverUrl && (song.storageImageId || song.storageId)
    );

    // Nếu không có bài hát nào cần lấy ảnh, dừng
    if (songsNeedImage.length === 0) return;

    // Lấy ảnh cho từng bài hát
    songsNeedImage.forEach(async (song) => {
      try {
        // Ưu tiên lấy từ storageImageId trước
        const imageId = song.storageImageId;

        let imageUrl: string | null = null;

        if (imageId) {
          console.log(
            `Đang lấy ảnh cho bài hát "${song.title}" từ storageImageId: ${imageId}`
          );
          imageUrl = await getImageUrl(imageId);
        }

        // Nếu không có storageImageId hoặc không lấy được, thử dùng storageId
        if (!imageUrl && song.storageId) {
          console.log(
            `Đang lấy ảnh cho bài hát "${song.title}" từ storageId: ${song.storageId}`
          );
          imageUrl = await getImageUrl(song.storageId);
        }

        if (imageUrl) {
          console.log(
            `Đã lấy được URL ảnh cho bài hát "${song.title}": ${imageUrl}`
          );
          setSongImages((prev) => ({
            ...prev,
            [song.id as string]: imageUrl,
          }));
        }
      } catch (error) {
        console.error(`Lỗi khi lấy ảnh cho bài hát "${song.title}":`, error);
      }
    });
  }, [searchResult]);

  const handlePlayTrack = (track: Track & { duration?: number; durationMs?: number; backgroundUrl?: string }) => {
    if (currentTrack?.id === track.id) {
      togglePlay();
    } else {
      // Kiểm tra và đảm bảo rằng track có tất cả thông tin cần thiết
      const enhancedTrack: Track = {
        ...track,
        // Đảm bảo các trường cần thiết đều được đưa vào
        songUrl: track.songUrl || track.previewUrl || undefined,
        previewUrl: track.previewUrl || track.songUrl || undefined,
        coverUrl:
          track.backgroundUrl ||
          songImages[track.id] ||
          track.coverUrl ||
          "",
        artistName: track.artistName || "",
        durationMs:
          track.durationMs || (track.duration ? track.duration * 1000 : 0),
      } as Track;

      setCurrentTrack(enhancedTrack);
      playTrack();
    }
  };

  const handlePlayAll = () => {
    if (searchResult && searchResult.result && searchResult.result.length > 0) {
      const firstTrack = searchResult.result[0] as Track & {
        duration?: number;
        backgroundUrl?: string;
      };
      // Tương tự như handlePlayTrack, đảm bảo track có tất cả thông tin cần thiết
      const enhancedTrack: Track = {
        ...firstTrack,
        songUrl: firstTrack.songUrl || firstTrack.previewUrl || undefined,
        previewUrl: firstTrack.previewUrl || firstTrack.songUrl || undefined,
        coverUrl:
          firstTrack.backgroundUrl ||
          songImages[firstTrack.id] ||
          firstTrack.coverUrl ||
          "",
        artistName: firstTrack.artistName || "",
        durationMs:
          firstTrack.durationMs ||
          (firstTrack.duration ? firstTrack.duration * 1000 : 0),
      } as Track;

      console.log(
        "Đang phát bài hát đầu tiên với thông tin:",
        JSON.stringify(enhancedTrack, null, 2)
      );
      setCurrentTrack(enhancedTrack);
      playTrack();
    }
  };

  const handleToggleFavorite = async (track: Track) => {
    const profileId = localStorage.getItem("profile_id");
    if (!profileId) return;

    try {
      if (likedTracks.includes(track.id)) {
        // Bỏ thích bài hát
        await musicApi.deleteFavorite(profileId, track.id);
        setLikedTracks(likedTracks.filter((id) => id !== track.id));

        // Dispatch custom event với thông tin chi tiết
        window.dispatchEvent(
          new CustomEvent("liked-changed", {
            detail: { songId: track.id, action: "unlike" },
          })
        );
      } else {
        // Thêm vào yêu thích
        await musicApi.createFavorite(profileId, track.id);
        setLikedTracks([...likedTracks, track.id]);

        // Dispatch custom event với thông tin chi tiết
        window.dispatchEvent(
          new CustomEvent("liked-changed", {
            detail: { songId: track.id, action: "like" },
          })
        );
      }
    } catch (error) {
      console.error("Lỗi khi thực hiện yêu thích:", error);
    }
  };

  const handleAddToPlaylist = async (playlistId: string) => {
    if (selectedTrack) {
      await addTrackToPlaylist(playlistId, selectedTrack.id);
      setShowPlaylistPopup(false);
      window.dispatchEvent(new Event("playlist-changed"));
    }
  };

  const openPlaylistPopup = async (track: Track) => {
    setSelectedTrack(track);
    const pls = await getUserPlaylists();
    setPlaylists(pls.map((p) => ({ id: p.id, name: p.name })));
    setShowPlaylistPopup(true);
  };

  // Hàm xử lý khi click vào tên nghệ sĩ
  const handleArtistClick = (artistId: string) => {
    if (!artistId) return;

    console.log(`Đang chuyển đến trang nghệ sĩ ID: ${artistId}`);
    navigate(`/artist/${artistId}`);
  };

  return (
    <div className="p-6 text-white min-h-screen bg-black">
      {/* Tabs */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`px-4 py-1 rounded-full font-semibold transition-colors ${
              activeTab === tab.key
                ? "bg-white text-black"
                : "bg-gray-800 text-white hover:bg-gray-700"
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {searchLoading && (
        <div className="text-center text-2xl text-gray-400 mt-20">
          Đang tìm kiếm...
        </div>
      )}
      {/* Lỗi */}
      {searchError && (
        <div className="text-center text-2xl text-red-400 mt-20">
          {searchError}
        </div>
      )}
      {/* Không có kết quả */}
      {!searchLoading &&
        !searchError &&
        searchResult &&
        (!searchResult.result || searchResult.result.length === 0) && (
          <div className="text-center text-2xl text-gray-400 mt-20">
            Không tìm thấy kết quả
          </div>
        )}

      {/* Kết quả bài hát */}
      {!searchLoading &&
        !searchError &&
        searchResult &&
        searchResult.result &&
        searchResult.result.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Bài hát</h2>
              <button
                onClick={handlePlayAll}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full transition-colors"
              >
                Phát tất cả
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {searchResult.result.map((song) => (
                <div
                  key={song.id}
                  className="group flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3 hover:bg-gray-700 transition-colors"
                >
                  {/* Play/Pause Button */}
                  <button
                    onClick={() => handlePlayTrack(song)}
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                  >
                    {currentTrack?.id === song.id && isPlaying ? (
                      <FaPause />
                    ) : (
                      <FaPlay />
                    )}
                  </button>

                  {/* Ảnh bài hát */}
                  <img
                    src={
                      song.backgroundUrl ||
                      songImages[song.id] ||
                      "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiMzMzMiLz48dGV4dCB4PSI1MCIgeT0iNTAiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIiBmaWxsPSIjZmZmIj5NdXNpYzwvdGV4dD48L3N2Zz4="
                    }
                    alt={song.title}
                    className="w-12 h-12 rounded mr-4 cursor-pointer"
                    onClick={() => navigate(`/track/${song.id}`)}
                    onError={(e) => {
                      const currentSrc = e.currentTarget.src;
                      if (!currentSrc.startsWith("data:image/")) {
                        e.currentTarget.src =
                          "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiMzMzMiLz48dGV4dCB4PSI1MCIgeT0iNTAiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIiBmaWxsPSIjZmZmIj5NdXNpYzwvdGV4dD48L3N2Zz4=";
                      }
                    }}
                  />

                  {/* Thông tin bài hát */}
                  <div className="flex-1">
                    <div className="font-semibold text-white">
                      {song.title}
                      {song.explicit && (
                        <span className="bg-gray-600 text-xs px-1 rounded ml-1">
                          E
                        </span>
                      )}
                    </div>
                    <div
                      className="text-gray-400 text-sm cursor-pointer hover:underline"
                      onClick={() => handleArtistClick(song.artistId as string)}
                    >
                      {song.artistName ||
                        artistNames[String(song.artistId)] ||
                        "Đang tải..."}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-4">
                    {/* Thời lượng */}
                    <div className="text-gray-400 text-sm">
                      {song.durationMs
                        ? formatDuration(song.durationMs)
                        : song.duration
                        ? formatDuration(song.duration * 1000)
                        : ""}
                    </div>

                    {/* Favorite Button */}
                    <button
                      onClick={() => handleToggleFavorite(song)}
                      className={`w-8 h-8 flex items-center justify-center transition-colors ${
                        likedTracks.includes(song.id)
                          ? "text-green-500"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      <FaHeart />
                    </button>

                    {/* Add to Playlist Button */}
                    <button
                      onClick={() => openPlaylistPopup(song)}
                      className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                    >
                      <FaList />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Playlist Popup */}
      {showPlaylistPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-96">
            <h3 className="text-xl font-bold mb-4">Thêm vào playlist</h3>
            <div className="max-h-60 overflow-y-auto">
              {playlists.map((playlist) => (
                <div
                  key={playlist.id}
                  className="flex items-center justify-between p-2 hover:bg-gray-700 rounded cursor-pointer"
                  onClick={() => handleAddToPlaylist(playlist.id)}
                >
                  <span>{playlist.name}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowPlaylistPopup(false)}
              className="mt-4 w-full bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Related sections */}
      {/* Có thể bổ sung phần liên quan nếu muốn */}
    </div>
  );
}
