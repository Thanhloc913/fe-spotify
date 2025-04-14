import { create } from 'zustand';
import type { Track } from '../types';

interface PlayerStore {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  queue: Track[];
  history: Track[];
  repeat: 'off' | 'track' | 'context';
  shuffle: boolean;
  duration: number;
  progress: number;

  // Actions
  setCurrentTrack: (track: Track | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setVolume: (volume: number) => void;
  setQueue: (queue: Track[]) => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (trackId: string) => void;
  clearQueue: () => void;
  setRepeat: (repeat: 'off' | 'track' | 'context') => void;
  setShuffle: (shuffle: boolean) => void;
  setDuration: (duration: number) => void;
  setProgress: (progress: number) => void;
  playTrack: (track: Track, queue?: Track[]) => void;
  togglePlay: () => void;
  skipToNext: () => void;
  skipToPrevious: () => void;
}

const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  volume: 0.5,
  queue: [],
  history: [],
  repeat: 'off',
  shuffle: false,
  duration: 0,
  progress: 0,

  // Set current track
  setCurrentTrack: (track) => set({ currentTrack: track }),

  // Toggle playing state
  setIsPlaying: (isPlaying) => set({ isPlaying }),

  // Set volume
  setVolume: (volume) => set({ volume }),

  // Queue management
  setQueue: (queue) => set({ queue }),

  addToQueue: (track) => set((state) => ({
    queue: [...state.queue, track]
  })),

  removeFromQueue: (trackId) => set((state) => ({
    queue: state.queue.filter(track => track.id !== trackId)
  })),

  clearQueue: () => set({ queue: [] }),

  // Repeat mode
  setRepeat: (repeat) => set({ repeat }),

  // Shuffle mode
  setShuffle: (shuffle) => set({ shuffle }),

  // Track progress
  setDuration: (duration) => set({ duration }),

  setProgress: (progress) => set({ progress }),

  // Play a track and optionally set a new queue
  playTrack: (track, queue = []) => {
    const currentTrack = get().currentTrack;

    // Add current track to history if it exists
    if (currentTrack) {
      set((state) => ({
        history: [...state.history, currentTrack]
      }));
    }

    set({
      currentTrack: track,
      isPlaying: true,
      progress: 0,
      duration: track.durationMs / 1000, // Convert to seconds
      queue: queue.length > 0 ? queue : get().queue,
    });
  },

  // Toggle play/pause
  togglePlay: () => set((state) => ({
    isPlaying: !state.isPlaying
  })),

  // Skip to next track in queue
  skipToNext: () => {
    const { queue, currentTrack, repeat } = get();

    if (!queue.length) return;

    if (repeat === 'track' && currentTrack) {
      // If repeat one, just reset progress
      set({ progress: 0 });
      return;
    }

    // Get the next track
    const nextTrack = queue[0];

    // Add current track to history
    if (currentTrack) {
      set((state) => ({
        history: [...state.history, currentTrack]
      }));
    }

    // Set the next track as current and remove it from queue
    set({
      currentTrack: nextTrack,
      queue: queue.slice(1),
      progress: 0,
      duration: nextTrack.durationMs / 1000, // Convert to seconds
    });

    // If repeat all and queue is now empty, refill it
    if (repeat === 'context' && queue.length === 1) {
      // This implementation is simplified. In a real app, we'd need to store the original context
      const history = get().history;
      if (history.length > 0) {
        set({ queue: [...history] });
      }
    }
  },

  // Skip to previous track in history
  skipToPrevious: () => {
    const { history, currentTrack, progress } = get();

    // If current progress is more than 3 seconds, restart the current track
    if (progress > 3 && currentTrack) {
      set({ progress: 0 });
      return;
    }

    if (!history.length) return;

    const previousTrack = history[history.length - 1];

    // Add current track to the beginning of queue
    if (currentTrack) {
      set((state) => ({
        queue: [currentTrack, ...state.queue]
      }));
    }

    // Set the previous track as current and remove it from history
    set({
      currentTrack: previousTrack,
      history: history.slice(0, -1),
      progress: 0,
      duration: previousTrack.durationMs / 1000, // Convert to seconds
    });
  },
}));

export default usePlayerStore;
