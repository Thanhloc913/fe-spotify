import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getUserPlaylists,
  UserPlaylist,
  renamePlaylist,
  deletePlaylist,
} from "../api/user";
import { mockTracks } from "../mock/data";
import { usePlayerStore } from "../store/playerStore";
import { FaEllipsisH } from "react-icons/fa";

const PlaylistDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [playlist, setPlaylist] = useState<UserPlaylist | null>(null);
  const [tracks, setTracks] = useState<any[]>([]);
  const { setCurrentTrack, playTrack } = usePlayerStore();
  const [showMenu, setShowMenu] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = () => {
      getUserPlaylists().then((playlists) => {
        const found = playlists.find((p) => p.id === id);
        setPlaylist(found || null);
        if (found) {
          const playlistTracks = found.trackIds
            .map((trackId) => mockTracks.find((t) => t.id === trackId))
            .filter(Boolean);
          setTracks(playlistTracks);
        }
      });
    };
    fetchData();
    const handler = () => fetchData();
    window.addEventListener("playlist-changed", handler);
    return () => window.removeEventListener("playlist-changed", handler);
  }, [id]);

  // Đóng popup menu khi click ra ngoài
  useEffect(() => {
    if (!showMenu) return;
    const handleClick = (e: MouseEvent) => {
      const menu = document.getElementById("playlist-menu-popup");
      if (menu && !menu.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showMenu]);

  if (!playlist)
    return <div className="p-8 text-white">Playlist not found.</div>;

  return (
    <div className="p-8">
      <div className="flex items-end gap-8 mb-8 relative">
        <img
          src={playlist.coverUrl}
          alt={playlist.name}
          className="w-48 h-48 object-cover rounded-lg shadow-lg"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-4xl font-bold text-white mb-2 truncate">
              {playlist.name}
            </h1>
            <button
              className="ml-2 text-gray-400 hover:text-white p-2 rounded-full focus:outline-none"
              onClick={() => setShowMenu((v) => !v)}
            >
              <FaEllipsisH className="w-5 h-5" />
            </button>
            {showMenu && (
              <div
                id="playlist-menu-popup"
                className="absolute left-56 top-8 z-50 bg-gray-900 border border-gray-700 rounded shadow-lg py-1 px-2 flex flex-col gap-1 min-w-[140px]"
              >
                <button
                  className="text-left text-white hover:bg-gray-700 px-2 py-1 rounded"
                  onClick={() => {
                    setShowRename(true);
                    setRenameValue(playlist.name);
                    setShowMenu(false);
                  }}
                >
                  Đổi tên
                </button>
                <button
                  className="text-left text-red-500 hover:bg-gray-700 px-2 py-1 rounded"
                  onClick={() => {
                    setShowDeleteConfirm(true);
                    setShowMenu(false);
                  }}
                >
                  Xóa
                </button>
              </div>
            )}
          </div>
          <p className="text-gray-400">{tracks.length} bài hát</p>
        </div>
      </div>
      {showRename && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-white">
              Đổi tên playlist
            </h2>
            <input
              type="text"
              className="w-full p-2 rounded bg-gray-800 text-white mb-4"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              maxLength={40}
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                className="px-4 py-2 rounded bg-gray-700 text-white"
                onClick={() => setShowRename(false)}
              >
                Hủy
              </button>
              <button
                className="px-4 py-2 rounded bg-spotify-green text-black font-semibold"
                onClick={async () => {
                  await renamePlaylist(playlist.id, renameValue);
                  setPlaylist({ ...playlist, name: renameValue });
                  setShowRename(false);
                  setShowMenu(false);
                  window.dispatchEvent(new Event("playlist-changed"));
                }}
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-white">
              Xóa playlist này?
            </h2>
            <p className="text-white mb-4">
              Bạn có chắc chắn muốn xóa playlist "{playlist.name}" không?
            </p>
            <div className="flex gap-2 justify-end">
              <button
                className="px-4 py-2 rounded bg-gray-700 text-white"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Hủy
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 text-white font-semibold"
                onClick={async () => {
                  await deletePlaylist(playlist.id);
                  setShowDeleteConfirm(false);
                  setShowMenu(false);
                  window.dispatchEvent(new Event("playlist-changed"));
                  navigate("/");
                }}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="bg-black/30 rounded-lg p-4">
        <table className="w-full text-left">
          <thead>
            <tr className="text-white/70 text-sm border-b border-white/10">
              <th className="py-2 px-2 font-normal">#</th>
              <th className="py-2 px-2 font-normal">Tiêu đề</th>
              <th className="py-2 px-2 font-normal">Nghệ sĩ</th>
              <th className="py-2 px-2 font-normal text-right">Thời lượng</th>
            </tr>
          </thead>
          <tbody>
            {tracks.map((track, idx) => (
              <tr
                key={track.id}
                className="hover:bg-white/5 group transition cursor-pointer"
                onClick={() => {
                  setCurrentTrack(track);
                  playTrack();
                }}
              >
                <td className="py-2 px-2 text-white/70 w-8">{idx + 1}</td>
                <td className="py-2 px-2 flex items-center gap-3">
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
              </tr>
            ))}
          </tbody>
        </table>
        {tracks.length === 0 && (
          <div className="text-white/60 py-8 text-center">
            Playlist này chưa có bài hát nào.
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistDetail;
