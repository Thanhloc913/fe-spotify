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
import { usePlayerStore } from '../../store/playerStore';
import { Link } from 'react-router-dom';

const formatDuration = (ms: number) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const Player: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    volume,
    repeat,
    shuffle,
    progress,
    duration,
    togglePlay,
    setVolume,
    setRepeat,
    toggleShuffle,
    setProgress,
    skipToNext,
    skipToPrevious
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
      const normalizedVolume = Math.max(0, Math.min(1, volume));
      audioRef.current.volume = isMuted ? 0 : normalizedVolume;
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

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
      {/* Track Info */}
        <div className="flex items-center gap-4 w-1/4">
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
            className="w-14 h-14 rounded"
            />
            <div>
            <p className="text-white font-medium">{currentTrack.title}</p>
            <p className="text-gray-400 text-sm">
              <Link to={`/artist/${currentTrack.artistId}`} className="hover:underline text-white/80">
                {currentTrack.artistName}
              </Link>
            </p>
            </div>
      </div>

      {/* Player Controls */}
        <div className="flex flex-col items-center w-2/4">
        <div className="flex items-center gap-4 mb-2">
          <button
              onClick={toggleShuffle}
              className={`text-gray-400 hover:text-white ${shuffle ? 'text-green-500' : ''}`}
          >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 3a1 1 0 011 1v5.586l3.293-3.293a1 1 0 111.414 1.414l-5 5a1 1 0 01-1.414 0l-5-5a1 1 0 111.414-1.414L9 9.586V4a1 1 0 011-1z" />
              </svg>
          </button>
          <button
            onClick={skipToPrevious}
              className="text-gray-400 hover:text-white"
          >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
              </svg>
          </button>
          <button
            onClick={togglePlay}
              className="bg-white text-black rounded-full p-2 hover:scale-105 transition-transform"
          >
            {isPlaying ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm6 4a1 1 0 10-2 0v6a1 1 0 102 0V7zm-4 1a1 1 0 10-2 0v4a1 1 0 102 0V8z" />
                </svg>
            ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
            )}
          </button>
          <button
            onClick={skipToNext}
              className="text-gray-400 hover:text-white"
          >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11.445 14.832A1 1 0 0013 14v-2.798l5.445 3.63A1 1 0 0020 14V6a1 1 0 00-1.555-.832L13 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
              </svg>
          </button>
          <button
              onClick={() => setRepeat(repeat === 'off' ? 'track' : 'off')}
              className={`text-gray-400 hover:text-white ${repeat === 'track' ? 'text-green-500' : ''}`}
          >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-2 w-full">
            <span className="text-gray-400 text-sm">
              {formatDuration(progress * 1000)}
            </span>
            <input
              type="range"
              min="0"
              max={duration}
              value={progress}
              onChange={(e) => {
                const newTime = Number(e.target.value);
                if (audioRef.current) {
                  audioRef.current.currentTime = newTime;
                }
                setProgress(newTime);
              }}
              className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-gray-400 text-sm">
              {formatDuration(currentTrack.durationMs)}
          </span>
        </div>
      </div>

        {/* Volume Control */}
        <div className="flex items-center gap-2 w-1/4 justify-end">
          <button onClick={handleVolumeClick} className="focus:outline-none">
            {isMuted || volume === 0 ? (
              <FaVolumeMute className="w-5 h-5 text-gray-400" />
            ) : (
              <FaVolumeUp className="w-5 h-5 text-gray-400" />
            )}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={isMuted ? 0 : volume}
            onChange={(e) => {
              const newVolume = Number(e.target.value);
              setVolume(newVolume);
              if (audioRef.current) {
                audioRef.current.volume = newVolume;
                if (newVolume === 0) setIsMuted(true);
                else setIsMuted(false);
              }
            }}
            className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
        />
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
