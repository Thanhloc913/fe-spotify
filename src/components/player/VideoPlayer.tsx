import React, { useEffect, useRef } from 'react';

interface VideoPlayerProps {
  videoUrl: string;
  isPlaying: boolean;
  progress: number;
  volume: number;
  onClose: () => void;
  onVideoRefChange?: (ref: HTMLVideoElement | null) => void;
  onEnded?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, isPlaying, progress, volume, onClose, onVideoRefChange, onEnded }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Gửi ref về cho Player
  useEffect(() => {
    if (onVideoRefChange) onVideoRefChange(videoRef.current);
    return () => { if (onVideoRefChange) onVideoRefChange(null); };
  }, [onVideoRefChange]);

  // Play/pause
  useEffect(() => {
    if (!videoRef.current) return;
    if (isPlaying) videoRef.current.play();
    else videoRef.current.pause();
  }, [isPlaying]);

  // Progress
  useEffect(() => {
    if (!videoRef.current) return;
    if (Math.abs(videoRef.current.currentTime - progress) > 1) {
      videoRef.current.currentTime = progress;
    }
  }, [progress]);

  // Volume
  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.volume = volume;
  }, [volume]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
      <div className="relative w-full flex justify-center">
        <button className="absolute top-2 right-2 z-10 bg-black bg-opacity-60 text-white text-2xl rounded-full px-3 py-1" onClick={onClose}>&times;</button>
        <video
          ref={videoRef}
          src={videoUrl}
          style={{ width: '100%', maxWidth: 1200, maxHeight: '70vh', background: '#000' }}
          autoPlay
          playsInline
          controls={false}
          onEnded={onEnded}
        />
      </div>
    </div>
  );
};

export default VideoPlayer; 