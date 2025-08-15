// playerApi.ts
import { Track, PlayerState, ApiResponse } from "../../types/index";

const mockQueue: Track[] = [
  {
    id: "track-1",
    title: "Mock Song",
    artistId: "artist-1",
    artistName: "Mock Artist",
    albumId: "album-1",
    albumName: "Mock Album",
    coverUrl: "https://via.placeholder.com/150",
    previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    durationMs: 180000,
    explicit: false,
    popularity: 85,
    trackNumber: 1,
    isPlayable: true,
  },
  {
    id: "track-2",
    title: "Mock Song 2",
    artistId: "artist-1",
    artistName: "Mock Artist",
    albumId: "album-1",
    albumName: "Mock Album",
    coverUrl: "https://via.placeholder.com/150",
    previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    durationMs: 200000,
    explicit: false,
    popularity: 70,
    trackNumber: 2,
    isPlayable: true,
  },
];

const playerState: PlayerState = {
  currentTrack: mockQueue[0],
  queue: mockQueue,
  isPlaying: false,
  volume: 1,
  repeat: "off",
  shuffle: false,
  progress: 0,
};

export const MockApi = {
  getPlayerState: (): ApiResponse<PlayerState> => ({
    data: playerState,
    status: 200,
  }),

  play: (): ApiResponse<PlayerState> => {
    playerState.isPlaying = true;
    return { data: playerState, status: 200, message: "Playing" };
  },

  pause: (): ApiResponse<PlayerState> => {
    playerState.isPlaying = false;
    return { data: playerState, status: 200, message: "Paused" };
  },

  next: (): ApiResponse<PlayerState> => {
    const index = playerState.queue.findIndex(
      (t) => t.id === playerState.currentTrack?.id
    );
    const nextTrack = playerState.queue[index + 1] || playerState.queue[0];
    playerState.currentTrack = nextTrack;
    playerState.isPlaying = true;
    playerState.progress = 0;
    return { data: playerState, status: 200, message: "Next track" };
  },

  previous: (): ApiResponse<PlayerState> => {
    const index = playerState.queue.findIndex(
      (t) => t.id === playerState.currentTrack?.id
    );
    const prevTrack =
      playerState.queue[index - 1] ||
      playerState.queue[playerState.queue.length - 1];
    playerState.currentTrack = prevTrack;
    playerState.isPlaying = true;
    playerState.progress = 0;
    return { data: playerState, status: 200, message: "Previous track" };
  },
};
