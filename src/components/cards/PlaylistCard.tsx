import type React from 'react';
import { FaPlay } from 'react-icons/fa';
import type { Playlist } from '../../types';
import { Link } from 'react-router-dom';

interface PlaylistCardProps {
  playlist: Playlist;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist }) => {
  return (
    <Link to={`/playlist/${playlist.id}`} className="card p-4 transition duration-300 group">
      <div className="relative mb-4">
        <img
          src={playlist.coverUrl}
          alt={playlist.name}
          className="w-full aspect-square object-cover rounded-md shadow-md"
        />
        <button className="absolute bottom-2 right-2 bg-spotify-green text-black p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <FaPlay />
        </button>
      </div>
      <h3 className="text-spotify-text-primary font-medium text-base truncate">{playlist.name}</h3>
      <p className="text-spotify-text-secondary text-sm truncate">{playlist.description}</p>
      <p className="text-spotify-text-secondary text-xs mt-1">
        By {playlist.ownerName} • {playlist.totalTracks} {playlist.totalTracks === 1 ? 'song' : 'songs'}
      </p>
    </Link>
  );
};

export default PlaylistCard;
