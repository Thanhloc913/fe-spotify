import type React from "react";
import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaSearch,
  FaBook,
  FaPlus,
  FaHeart,
  FaSpotify,
  FaEllipsisH,
} from "react-icons/fa";
import { createPlaylist, getUserPlaylists, UserPlaylist } from "../../api/user";
import { mockTracks } from "../../mock/data";
import { useUser } from "../../contexts/UserContext";

const Sidebar: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [playlistName, setPlaylistName] = useState("");
  const [selectedTracks, setSelectedTracks] = useState<string[]>([]);
  const [playlists, setPlaylists] = useState<UserPlaylist[]>([]);
  const [showMenuId, setShowMenuId] = useState<string | null>(null);
  const [showRenameId, setShowRenameId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const { artist } = useUser();

  useEffect(() => {
    getUserPlaylists().then(setPlaylists);
    const handler = () => getUserPlaylists().then(setPlaylists);
    window.addEventListener("playlist-changed", handler);
    return () => window.removeEventListener("playlist-changed", handler);
  }, [showForm]);

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    const newPlaylist: UserPlaylist = {
      id: Date.now().toString(),
      name: playlistName,
      coverUrl: "https://misc.scdn.co/liked-songs/liked-songs-640.png",
      trackIds: [],
    };
    await createPlaylist(newPlaylist);
    setPlaylists([newPlaylist, ...playlists]);
    setShowForm(false);
    setPlaylistName("");
    setSelectedTracks([]);
  };

  const handleDeletePlaylist = (id: string) => {
    const playlistsNew = playlists.filter((p) => p.id !== id);
    localStorage.setItem("user_playlists", JSON.stringify(playlistsNew));
    setPlaylists(playlistsNew);
    setShowMenuId(null);
  };

  const handleRenamePlaylist = (id: string) => {
    const playlistsNew = playlists.map((p) =>
      p.id === id ? { ...p, name: renameValue } : p
    );
    localStorage.setItem("user_playlists", JSON.stringify(playlistsNew));
    setPlaylists(playlistsNew);
    setShowRenameId(null);
    setShowMenuId(null);
  };

  return (
    <aside className="w-64 bg-black flex flex-col overflow-hidden">
      {/* Playlist Section */}
      <div className="p-6 space-y-4">
        <div
          className="sidebar-item cursor-pointer"
          onClick={() => setShowForm(true)}
        >
          <div className="bg-spotify-text-secondary rounded-sm p-1">
            <FaPlus className="text-black text-sm" />
          </div>
          <span>Create Playlist</span>
        </div>
        <NavLink
          to="/liked-songs"
          className={({ isActive }) =>
            `sidebar-item cursor-pointer flex items-center gap-2 ${
              isActive ? "text-spotify-green" : ""
            }`
          }
        >
          <div className="bg-gradient-to-br from-purple-700 to-spotify-text-secondary rounded-sm p-1">
            <FaHeart className="text-white text-sm" />
          </div>
          <span>Liked Songs</span>
        </NavLink>
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <form
            onSubmit={handleCreatePlaylist}
            className="bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-md"
          >
            <h2 className="text-xl font-bold mb-4 text-white">
              Tạo playlist mới
            </h2>
            <div className="mb-4">
              <label className="block text-white mb-1">Tên playlist</label>
              <input
                type="text"
                className="w-full p-2 rounded bg-gray-800 text-white"
                required
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                className="px-4 py-2 rounded bg-gray-700 text-white"
                onClick={() => setShowForm(false)}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded bg-spotify-green text-black font-semibold"
              >
                Tạo
              </button>
            </div>
          </form>
        </div>
      )}
      {/* Divider */}
      <div className="border-t border-gray-800 my-2" />
      {/* Playlists */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <ul className="space-y-2 text-spotify-text-secondary">
          {playlists.map((playlist) => (
            <li
              key={playlist.id}
              className="relative truncate hover:text-spotify-text-primary transition-colors flex items-center"
            >
              <NavLink
                to={`/playlist/${playlist.id}`}
                className="text-sm flex-1 block truncate pr-8"
              >
                {playlist.name}
              </NavLink>
            </li>
          ))}
          <li className="truncate hover:text-spotify-text-primary transition-colors">
            <NavLink to="/playlist/1" className="text-sm">
              My Playlist #1
            </NavLink>
          </li>
          <li className="truncate hover:text-spotify-text-primary transition-colors">
            <NavLink to="/playlist/2" className="text-sm">
              Discover Weekly
            </NavLink>
          </li>
          <li className="truncate hover:text-spotify-text-primary transition-colors">
            <NavLink to="/playlist/3" className="text-sm">
              Release Radar
            </NavLink>
          </li>
          <li className="truncate hover:text-spotify-text-primary transition-colors">
            <NavLink to="/playlist/4" className="text-sm">
              Chill Vibes
            </NavLink>
          </li>
          <li className="truncate hover:text-spotify-text-primary transition-colors">
            <NavLink to="/playlist/5" className="text-sm">
              Workout Mix
            </NavLink>
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
