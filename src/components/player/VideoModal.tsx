import React, { useRef } from "react";
import { usePlayerStore } from "../../store/playerStore";

interface VideoModalProps {
  videoUrl: string;
}

const VideoModal: React.FC<VideoModalProps> = ({ videoUrl }) => {
  const { toggleVideoModal, volume } = usePlayerStore();
  const videoRef = useRef<HTMLVideoElement>(null);

  // Handle escape key to close modal
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        toggleVideoModal();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [toggleVideoModal]);

  // Apply volume to video
  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume / 100;
    }
  }, [volume]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <div className="relative w-full max-w-4xl p-4 max-h-screen flex flex-col">
        <div className="flex justify-end mb-2">
          <button
            onClick={toggleVideoModal}
            className="bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center"
            aria-label="Close video"
          >
            ✕
          </button>
        </div>

        <div className="relative overflow-hidden rounded-lg shadow-lg bg-black w-full aspect-video">
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full"
            controls
            autoPlay
            onError={(e) => console.error("Video error:", e)}
          />
        </div>
      </div>
    </div>
  );
};

export default VideoModal;
