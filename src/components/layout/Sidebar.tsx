import type React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FaHome,
  FaSearch,
  FaBook,
  FaPlus,
  FaHeart,
  FaSpotify
} from 'react-icons/fa';

const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-black flex flex-col overflow-hidden">
      {/* Playlist Section */}
      <div className="p-6 border-t border-gray-800 space-y-4">
        <div className="sidebar-item cursor-pointer">
          <div className="bg-spotify-text-secondary rounded-sm p-1">
            <FaPlus className="text-black text-sm" />
          </div>
          <span>Create Playlist</span>
        </div>
        <div className="sidebar-item cursor-pointer">
          <div className="bg-gradient-to-br from-purple-700 to-spotify-text-secondary rounded-sm p-1">
            <FaHeart className="text-white text-sm" />
          </div>
          <span>Liked Songs</span>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-800 my-2" />

      {/* Playlists */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <ul className="space-y-2 text-spotify-text-secondary">
          <li className="truncate hover:text-spotify-text-primary transition-colors">
            <NavLink to="/playlist/1" className="text-sm">My Playlist #1</NavLink>
          </li>
          <li className="truncate hover:text-spotify-text-primary transition-colors">
            <NavLink to="/playlist/2" className="text-sm">Discover Weekly</NavLink>
          </li>
          <li className="truncate hover:text-spotify-text-primary transition-colors">
            <NavLink to="/playlist/3" className="text-sm">Release Radar</NavLink>
          </li>
          <li className="truncate hover:text-spotify-text-primary transition-colors">
            <NavLink to="/playlist/4" className="text-sm">Chill Vibes</NavLink>
          </li>
          <li className="truncate hover:text-spotify-text-primary transition-colors">
            <NavLink to="/playlist/5" className="text-sm">Workout Mix</NavLink>
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
