import { usePlayerStore } from '../store/playerStore';
import { FaPlay, FaPause, FaStepBackward, FaStepForward, FaVolumeUp, FaRandom, FaRedoAlt } from 'react-icons/fa';
import { MdOndemandVideo } from 'react-icons/md';

const Player = () => {
  const {
    currentTrack,
    isPlaying,
    volume,
    progress,
    repeat,
    shuffle,
    playTrack,
    togglePlay,
    setVolume,
    setProgress,
    setRepeat,
    toggleShuffle,
    skipToNext,
    skipToPrevious,
    openMusicVideo
  } = usePlayerStore();

  if (!currentTrack) {
    return null;
  }

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleRepeatClick = () => {
    const nextRepeat = repeat === 'off' ? 'track' : repeat === 'track' ? 'context' : 'off';
    setRepeat(nextRepeat);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-spotify-black border-t border-spotify-border h-20 px-4 flex items-center justify-between">
      {/* Left section - Track info */}
      <div className="flex items-center gap-4 w-1/4">
        <img
          src={currentTrack.coverUrl}
          alt={currentTrack.title}
          className="w-14 h-14 object-cover"
        />
        <div className="flex flex-col">
          <h4 className="text-white font-medium">{currentTrack.title}</h4>
          <p className="text-spotify-text-secondary text-sm">{currentTrack.artistName}</p>
          
          {/* Hiển thị trong phần thông tin bài hát */}
          {currentTrack.songType === 'MUSIC_VIDEO' && (
            <button 
              onClick={openMusicVideo}
              className="flex items-center gap-1 text-spotify-green hover:text-white text-sm mt-1"
            >
              <MdOndemandVideo size={16} />
              <span>Xem video</span>
            </button>
          )}
        </div>
      </div>

      {/* Center section - Controls */}
      <div className="flex flex-col items-center gap-2 w-2/4">
        <div className="flex items-center gap-4">
          <button 
            className={`text-spotify-text-secondary hover:text-white ${shuffle ? 'text-spotify-green' : ''}`}
            onClick={toggleShuffle}
          >
            <FaRandom />
          </button>
          <button 
            className="text-spotify-text-secondary hover:text-white"
            onClick={skipToPrevious}
          >
            <FaStepBackward />
          </button>
          <button
            onClick={togglePlay}
            className="bg-white text-black p-2 rounded-full hover:scale-105 transition-transform"
          >
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>
          <button 
            className="text-spotify-text-secondary hover:text-white"
            onClick={skipToNext}
          >
            <FaStepForward />
          </button>
          <button 
            className={`text-spotify-text-secondary hover:text-white ${repeat !== 'off' ? 'text-spotify-green' : ''}`}
            onClick={handleRepeatClick}
          >
            <FaRedoAlt />
          </button>
          
          {/* Hiển thị thêm nút xem video nổi bật hơn khi là MUSIC_VIDEO */}
          {currentTrack.songType === 'MUSIC_VIDEO' && (
            <button 
              onClick={openMusicVideo}
              className="flex items-center gap-1 bg-spotify-green text-white rounded-full px-3 py-1 text-sm ml-4 hover:bg-spotify-green-hover transition-colors"
            >
              <MdOndemandVideo size={16} />
              <span>Xem MV</span>
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 w-full">
          <span className="text-spotify-text-secondary text-xs">
            {formatDuration(progress * 1000)}
          </span>
          <div className="flex-1 h-1 bg-spotify-border rounded-full">
            <div 
              className="h-full bg-spotify-green rounded-full" 
              style={{ width: `${(progress / (currentTrack.durationMs / 1000)) * 100}%` }} 
            />
          </div>
          <span className="text-spotify-text-secondary text-xs">
            {formatDuration(currentTrack.durationMs)}
          </span>
        </div>
      </div>

      {/* Right section - Volume */}
      <div className="flex items-center gap-2 w-1/4 justify-end">
        <FaVolumeUp className="text-spotify-text-secondary" />
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="w-24 accent-spotify-green"
        />
      </div>
    </div>
  );
};

export default Player; 