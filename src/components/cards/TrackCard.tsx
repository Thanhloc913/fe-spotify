import type React from 'react';
import { FaPlay, FaPause } from 'react-icons/fa';
import type { Track } from '../../types';
import { usePlayerStore } from '../../store/playerStore';

interface TrackCardProps {
  track: Track;
}

const TrackCard: React.FC<TrackCardProps> = ({ track }) => {
  const { currentTrack, isPlaying, playTrack, togglePlay, setCurrentTrack } = usePlayerStore();

  const isCurrentTrack = currentTrack?.id === track.id;

  const handlePlay = () => {
    if (isCurrentTrack) {
      togglePlay();
    } else {
      setCurrentTrack(track);
      playTrack();
    }
  };

  return (
    <div className="card group relative overflow-hidden">
      <div className="flex items-center">
        <img
          src={track.coverUrl}
          alt={track.title}
          className="w-12 h-12 object-cover mr-3"
        />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{track.title}</div>
          <div className="text-xs text-spotify-text-secondary truncate">{track.artistName}</div>
        </div>
        <button
          onClick={handlePlay}
          className="opacity-0 group-hover:opacity-100 bg-spotify-green text-black p-2 rounded-full shadow-lg transform transition-all duration-300 hover:scale-105"
        >
          {isCurrentTrack && isPlaying ? (
            <FaPause />
          ) : (
            <FaPlay />
          )}
        </button>
      </div>
    </div>
  );
};

export default TrackCard;
