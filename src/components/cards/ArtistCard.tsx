import type React from 'react';
import type { Artist } from '../../types';
import { Link } from 'react-router-dom';
import { FaPlay } from 'react-icons/fa';

interface ArtistCardProps {
  artist: Artist;
}

const ArtistCard: React.FC<ArtistCardProps> = ({ artist }) => {
  return (
    <Link to={`/artist/${artist.id}`} className="card p-4 transition duration-300 group">
      <div className="relative mb-4">
        <img
          src={artist.imageUrl}
          alt={artist.name}
          className="w-full aspect-square object-cover rounded-full shadow-md"
        />
        <button className="absolute bottom-0 right-0 bg-spotify-green text-black p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <FaPlay />
        </button>
      </div>
      <h3 className="text-spotify-text-primary font-medium text-base truncate">{artist.name}</h3>
      <p className="text-spotify-text-secondary text-sm">Artist</p>
    </Link>
  );
};

export default ArtistCard;
