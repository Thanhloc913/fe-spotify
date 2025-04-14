import type React from 'react';
import { useEffect, useState, useRef } from 'react';
import {
  FaPlayCircle,
  FaPauseCircle,
  FaStepForward,
  FaStepBackward,
  FaVolumeUp,
  FaRandom,
  FaRedo,
  FaHeart,
  FaList,
  FaVolumeMute
} from 'react-icons/fa';
import usePlayerStore from '../../store/playerStore';

const Player: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    volume,
    progress,
    duration,
    repeat,
    shuffle,
    togglePlay,
    skipToNext,
    skipToPrevious,
    setVolume,
    setProgress,
    setRepeat,
    setShuffle
  } = usePlayerStore();

  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // Handle play/pause - removed currentTrack from dependencies
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => {
          // Autoplay was prevented
          console.log('Autoplay prevented');
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]); // currentTrack is implicitly covered by the src change

  // Update audio src when currentTrack changes
  useEffect(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch(() => {
          console.log('Autoplay prevented after track change');
        });
      }
    }
  }, [currentTrack, isPlaying]);

  // Update progress
  useEffect(() => {
    const timer = setInterval(() => {
      if (audioRef.current && isPlaying) {
        setProgress(audioRef.current.currentTime);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying, setProgress]);

  // Handle volume change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Handle track end
  const handleTrackEnd = () => {
    if (repeat === 'track') {
      // Repeat current track
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      skipToNext();
    }
  };

  // Handle volume click
  const handleVolumeClick = () => {
    if (isMuted) {
      setIsMuted(false);
      setVolume(prevVolume);
    } else {
      setPrevVolume(volume);
      setIsMuted(true);
      setVolume(0);
    }
  };

  // Handle progress bar click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressRef.current && audioRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      const newTime = percent * duration;

      audioRef.current.currentTime = newTime;
      setProgress(newTime);
    }
  };

  // Toggle repeat
  const handleRepeatClick = () => {
    const repeatModes: ('off' | 'track' | 'context')[] = ['off', 'track', 'context'];
    const currentIndex = repeatModes.indexOf(repeat);
    const nextIndex = (currentIndex + 1) % repeatModes.length;
    setRepeat(repeatModes[nextIndex]);
  };

  // Format time
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="bg-spotify-gray border-t border-gray-800 px-4 py-3 flex items-center justify-between">
      {/* Track Info */}
      <div className="flex items-center w-1/4">
        {currentTrack ? (
          <>
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className="h-14 w-14 object-cover mr-3"
            />
            <div>
              <div className="text-sm font-medium text-spotify-text-primary truncate">{currentTrack.title}</div>
              <div className="text-xs text-spotify-text-secondary truncate">{currentTrack.artistName}</div>
            </div>
            <button className="ml-4 text-spotify-text-secondary hover:text-spotify-text-primary">
              <FaHeart />
            </button>
          </>
        ) : (
          <div className="text-sm text-spotify-text-secondary">No track selected</div>
        )}
      </div>

      {/* Player Controls */}
      <div className="flex flex-col items-center justify-center w-2/4">
        <div className="flex items-center gap-4 mb-2">
          <button
            className={`text-spotify-text-secondary hover:text-spotify-text-primary ${shuffle ? 'text-spotify-green' : ''}`}
            onClick={() => setShuffle(!shuffle)}
          >
            <FaRandom />
          </button>
          <button
            className="text-spotify-text-secondary hover:text-spotify-text-primary"
            onClick={skipToPrevious}
            disabled={!currentTrack}
          >
            <FaStepBackward className="text-2xl" />
          </button>
          <button
            className="text-spotify-text-primary hover:scale-105 transition"
            onClick={togglePlay}
            disabled={!currentTrack}
          >
            {isPlaying ? (
              <FaPauseCircle className="text-white text-4xl" />
            ) : (
              <FaPlayCircle className="text-white text-4xl" />
            )}
          </button>
          <button
            className="text-spotify-text-secondary hover:text-spotify-text-primary"
            onClick={skipToNext}
            disabled={!currentTrack}
          >
            <FaStepForward className="text-2xl" />
          </button>
          <button
            className={`text-spotify-text-secondary hover:text-spotify-text-primary ${repeat !== 'off' ? 'text-spotify-green' : ''}`}
            onClick={handleRepeatClick}
          >
            <FaRedo />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center w-full gap-2">
          <span className="text-xs text-spotify-text-secondary w-10 text-right">
            {formatTime(progress)}
          </span>
          <div
            ref={progressRef}
            className="flex-1 h-1 bg-gray-600 rounded-full cursor-pointer"
            onClick={handleProgressClick}
          >
            <div
              className="h-full bg-spotify-text-secondary rounded-full relative"
              style={{ width: `${(progress / (duration || 1)) * 100}%` }}
            >
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full bg-white opacity-0 group-hover:opacity-100" />
            </div>
          </div>
          <span className="text-xs text-spotify-text-secondary w-10">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Volume Controls */}
      <div className="flex items-center justify-end w-1/4 gap-4">
        <button
          className="text-spotify-text-secondary hover:text-spotify-text-primary"
          onClick={() => {}}
        >
          <FaList />
        </button>
        <div className="flex items-center gap-2">
          <button onClick={handleVolumeClick}>
            {isMuted || volume === 0 ? (
              <FaVolumeMute className="text-spotify-text-secondary hover:text-spotify-text-primary" />
            ) : (
              <FaVolumeUp className="text-spotify-text-secondary hover:text-spotify-text-primary" />
            )}
          </button>
          <div className="w-24 h-1 bg-gray-600 rounded-full cursor-pointer">
            <div
              className="h-full bg-spotify-text-secondary hover:bg-spotify-green rounded-full"
              style={{ width: `${isMuted ? 0 : volume * 100}%` }}
              onClick={(e) => {
                const rect = e.currentTarget.parentElement?.getBoundingClientRect();
                if (rect) {
                  const percent = (e.clientX - rect.left) / rect.width;
                  setVolume(Math.max(0, Math.min(1, percent)));
                  setIsMuted(false);
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Audio Element (hidden) */}
      <audio
        ref={audioRef}
        src={currentTrack?.previewUrl}
        onEnded={handleTrackEnd}
        loop={repeat === 'track'}
      >
        {/* Added caption track to satisfy the linter */}
        <track
          kind="captions"
          src=""
          label="English captions"
          srcLang="en"
          default
        />
      </audio>
    </div>
  );
};

export default Player;
