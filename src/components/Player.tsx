import { usePlayerStore } from "../store/playerStore";
import {
  FaPlay,
  FaPause,
  FaStepBackward,
  FaStepForward,
  FaVolumeUp,
  FaRandom,
  FaRedoAlt,
} from "react-icons/fa";
import { MdOndemandVideo } from "react-icons/md";
import { useEffect, useState } from "react";

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
    openMusicVideo,
    showVideo,
    setShowVideo,
  } = usePlayerStore();

  const [videoError, setVideoError] = useState<string | null>(null);

  useEffect(() => {
    if (currentTrack) {
      console.log("Current track loaded:", currentTrack);
      console.log("Song type:", currentTrack.songType);
      console.log("Song URL:", currentTrack.songUrl);
    }
  }, [currentTrack]);

  // Reset video error when video state changes
  useEffect(() => {
    if (showVideo) {
      setVideoError(null);
    }
  }, [showVideo]);

  if (!currentTrack) {
    return null;
  }

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleRepeatClick = () => {
    const nextRepeat =
      repeat === "off" ? "track" : repeat === "track" ? "context" : "off";
    setRepeat(nextRepeat);
  };

  // Function to handle video button click
  const handleVideoClick = () => {
    console.log("Video button clicked");
    console.log("Song URL:", currentTrack.songUrl);

    // Directly open the video in a new tab if we have issues showing it in the app
    if (videoError) {
      window.open(currentTrack.songUrl, "_blank");
      return;
    }

    // Toggle video player
    setShowVideo(!showVideo);
  };

  // Handle video error
  const handleVideoError = (
    e: React.SyntheticEvent<HTMLVideoElement, Event>
  ) => {
    console.error("Video error:", e);
    setVideoError(
      "Không thể phát video. Vui lòng thử lại hoặc mở trong tab mới."
    );
  };

  return (
    <>
      {/* Video Player */}
      {showVideo && currentTrack.songUrl && (
        <div className="fixed top-0 left-0 right-0 bottom-20 bg-black z-40 flex flex-col items-center justify-center">
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            <button
              className="absolute top-4 right-4 text-white bg-red-600 hover:bg-red-700 rounded-full p-2 z-50"
              onClick={() => setShowVideo(false)}
            >
              ✕
            </button>

            {videoError ? (
              <div className="text-white text-center p-6 bg-gray-800 rounded-lg">
                <p className="mb-4">{videoError}</p>
                <div className="flex gap-3 justify-center">
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                    onClick={() => window.open(currentTrack.songUrl, "_blank")}
                  >
                    Mở trong tab mới
                  </button>
                  <button
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
                    onClick={() => setShowVideo(false)}
                  >
                    Đóng
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Try HTML5 video first */}
                <video
                  className="max-w-full max-h-full"
                  src={currentTrack.songUrl}
                  controls
                  autoPlay
                  onError={handleVideoError}
                  ref={(el) => {
                    if (el) {
                      // Store reference to video element globally to control it
                      (window as any).__globalVideoRef = el;
                    }
                  }}
                />

                {/* Fallback to iframe if needed */}
                {videoError && (
                  <iframe
                    src={currentTrack.songUrl}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-spotify-black border-t border-spotify-border h-20 px-4 flex items-center justify-between">
        {/* Left section - Track info */}
        <div className="flex items-center gap-4 w-1/4">
          <img
            src={currentTrack.coverUrl}
            alt={currentTrack.title}
            className="w-14 h-14 object-cover"
          />
          <div>
            <h4 className="text-white font-medium">{currentTrack.title}</h4>
            <p className="text-spotify-text-secondary text-sm">
              {currentTrack.artistName}
            </p>
          </div>
        </div>

        {/* Center section - Controls */}
        <div className="flex flex-col items-center gap-2 w-2/4">
          <div className="flex items-center gap-4">
            <button
              className={`text-spotify-text-secondary hover:text-white ${
                shuffle ? "text-spotify-green" : ""
              }`}
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
              className={`text-spotify-text-secondary hover:text-white ${
                repeat !== "off" ? "text-spotify-green" : ""
              }`}
              onClick={handleRepeatClick}
            >
              <FaRedoAlt />
            </button>

            {/* Video button - always show */}
            <button
              onClick={handleVideoClick}
              className={`text-spotify-text-secondary hover:text-blue-500 ${
                showVideo ? "text-blue-500" : ""
              }`}
              title="Xem video"
            >
              <MdOndemandVideo size={20} />
            </button>
          </div>
          <div className="flex items-center gap-2 w-full">
            <span className="text-spotify-text-secondary text-xs">
              {formatDuration(progress * 1000)}
            </span>
            <div className="flex-1 h-1 bg-spotify-border rounded-full">
              <div
                className="h-full bg-spotify-green rounded-full"
                style={{
                  width: `${
                    (progress / (currentTrack.durationMs / 1000)) * 100
                  }%`,
                }}
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
    </>
  );
};

export default Player;
