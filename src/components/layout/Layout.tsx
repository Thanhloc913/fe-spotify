import React, { useRef } from 'react';
import Sidebar from './Sidebar';
import Player from '../player/Player';
import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { usePlayerStore } from '../../store/playerStore';
import VideoPlayer from '../player/VideoPlayer';
import VideoModal from '../player/VideoModal';
import axios from 'axios';

const Layout: React.FC = () => {
  const { showVideo, isVideoModalOpen, currentTrack, isPlaying, progress, volume, setShowVideo, repeat } = usePlayerStore();
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const navigate = useNavigate();

  const handleTrackEnd = () => {
    if (repeat === 'track') {
      const video = (window as any).__globalVideoRef as HTMLVideoElement;
      if (video) {
        video.currentTime = 0;
        video.play();
      }
    } else {
      usePlayerStore.getState().pauseTrack();
    }
  };

  return (
    <div className="h-screen bg-spotify-black text-spotify-text-primary flex flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Main content */}
        <main className="flex-1 overflow-auto relative">
          <div className="">
            {showVideo && currentTrack && currentTrack.videoUrl ? (
              <VideoPlayer
                videoUrl={currentTrack.videoUrl}
                isPlaying={isPlaying}
                progress={progress}
                volume={volume}
                onClose={() => setShowVideo(false)}
                onVideoRefChange={ref => { videoElementRef.current = ref; (window as any).__globalVideoRef = ref; }}
                onEnded={handleTrackEnd}
              />
            ) : (
              <Outlet />
            )}
          </div>
        </main>
      </div>

      {/* Video Modal */}
      {isVideoModalOpen && currentTrack && currentTrack.songUrl && (
        <VideoModal videoUrl={currentTrack.songUrl} />
      )}

      {/* Player - Fixed at bottom */}
      <Player />
    </div>
  );
};

export default Layout;
