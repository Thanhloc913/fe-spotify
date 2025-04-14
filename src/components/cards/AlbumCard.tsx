import type React from 'react';
import { FaPlay } from 'react-icons/fa';
import type { Album } from '../../types';
import { Link } from 'react-router-dom';

interface AlbumCardProps {
  album: Album;
}

const AlbumCard: React.FC<AlbumCardProps> = ({ album }) => {
  return (
    <Link to={`/album/${album.id}`} className="card p-4 transition duration-300 group">
      <div className="relative mb-4">
        <img
          src={album.coverUrl}
          alt={album.title}
          className="w-full aspect-square object-cover rounded-md shadow-md"
        />
        <button className="absolute bottom-2 right-2 bg-spotify-green text-black p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <FaPlay />
        </button>
      </div>
      <h3 className="text-spotify-text-primary font-medium text-base truncate">{album.title}</h3>
      <p className="text-spotify-text-secondary text-sm truncate">{album.artistName}</p>
      <p className="text-spotify-text-secondary text-xs mt-1">
        {album.type.charAt(0).toUpperCase() + album.type.slice(1)} • {new Date(album.releaseDate).getFullYear()}
      </p>
    </Link>
  );
};

export default AlbumCard;
