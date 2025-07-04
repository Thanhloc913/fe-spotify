import { create } from "zustand";
import { Track } from "../types";
import musicApi from "../api/musicApi";

interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
  repeat: "off" | "track" | "context";
  shuffle: boolean;
  showVideo: boolean;
  isVideoModalOpen: boolean;
  setCurrentTrack: (track: Track) => void;
  playTrack: () => void;
  pauseTrack: () => void;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
  setRepeat: (repeat: "off" | "track" | "context") => void;
  toggleShuffle: () => void;
  skipToNext: () => void;
  skipToPrevious: () => void;
  setShowVideo: (show: boolean) => void;
  openMusicVideo: () => void;
  toggleVideoModal: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  queue: [],
  isPlaying: false,
  volume: 50,
  progress: 0,
  duration: 0,
  repeat: "off",
  shuffle: false,
  showVideo: false,
  isVideoModalOpen: false,
  setCurrentTrack: (track) => {
    const { currentTrack } = get();
    const isSameTrack = currentTrack?.id === track.id;

    set({
      currentTrack: track,
      duration: track.durationMs / 1000,
      progress: isSameTrack ? get().progress : 0,
      showVideo: false,
      isVideoModalOpen: false,
    });

    if (!isSameTrack) {
      musicApi.setTrack(track.id).catch((error) => {
        console.error("Error setting track:", error);
      });
    }
  },
  playTrack: async () => {
    const { currentTrack } = get();
    if (currentTrack) {
      set({ isPlaying: true });

      // Call the API to play the track
      try {
        await musicApi.play(currentTrack.id);
      } catch (error) {
        console.error("Error playing track:", error);
      }
    }
  },
  pauseTrack: async () => {
    set({ isPlaying: false });

    // Call the API to pause playback
    try {
      await musicApi.pause();
    } catch (error) {
      console.error("Error pausing track:", error);
    }
  },
  togglePlay: () => {
    const { isPlaying, playTrack, pauseTrack } = get();
    if (isPlaying) {
      pauseTrack();
    } else {
      playTrack();
    }
  },
  setVolume: (volume) => set({ volume }),
  setProgress: (progress) => set({ progress }),
  setDuration: (duration) => set({ duration }),
  setRepeat: (repeat) => set({ repeat }),
  toggleShuffle: () => set((state) => ({ shuffle: !state.shuffle })),
  skipToNext: () => {
    const { queue, currentTrack, repeat, setCurrentTrack, playTrack } = get();
    if (queue.length > 0) {
      const nextTrack = queue[0];
      setCurrentTrack(nextTrack);
      set({ queue: queue.slice(1) });
      playTrack();
    } else if (repeat === "context") {
      // If repeat context is on and queue is empty, start over
      set({ progress: 0 });
      playTrack();
    }
  },
  skipToPrevious: () => {
    const { progress, setProgress, playTrack } = get();
    // If progress is more than 3 seconds, restart the track
    if (progress > 3) {
      setProgress(0);
      playTrack();
    } else {
      // Otherwise go to previous track (not implemented yet)
      setProgress(0);
    }
  },
  setShowVideo: (show) => set({ showVideo: show }),
  openMusicVideo: () => {
    const { currentTrack } = get();
    if (currentTrack?.songUrl) {
      console.log("Opening music video URL:", currentTrack.songUrl);

      // Mở modal video thay vì set showVideo
      set({ isVideoModalOpen: true });
    }
  },
  toggleVideoModal: () =>
    set((state) => ({ isVideoModalOpen: !state.isVideoModalOpen })),
}));
