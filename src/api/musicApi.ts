// musicService.ts
import { MockApi } from '../lib/mocks/playerApi';
import { PlayerState } from '../types/index';
import { Track, ApiResponse } from '../types';
import { mockData } from '../mock/data';

let audio: HTMLAudioElement | null = null;

// Constants
const USE_MOCK_DATA = true; // Toggle this to switch between real API and mock data

// Helper to format response
const createResponse = <T>(data: T, status = 200, message?: string): ApiResponse<T> => {
  return {
    data,
    status,
    message,
  };
};

export interface PlaybackState {
  isPlaying: boolean;
  currentTrack: Track | null;
  progress: number;
  volume: number;
  shuffle: boolean;
  repeat: 'off' | 'track' | 'context';
}

// Initial playback state
const initialPlaybackState: PlaybackState = {
  isPlaying: false,
  currentTrack: null,
  progress: 0,
  volume: 0.5,
  shuffle: false,
  repeat: 'off'
};

// Mock playback state for client-side usage
let playbackState: PlaybackState = { ...initialPlaybackState };

export const Player = {
  async play(): Promise<PlayerState> {
    const res = MockApi.play();
    const track = res.data.currentTrack;

    if (track && track.previewUrl) {
      if (!audio) audio = new Audio(track.previewUrl);
      else {
        audio.src = track.previewUrl;
      }
      await audio.play();
    }

    return res.data;
  },

  async pause(): Promise<PlayerState> {
    const res = MockApi.pause();
    if (audio) {
      audio.pause();
    }
    return res.data;
  },

  async togglePlay(): Promise<PlayerState> {
    const state = MockApi.getPlayerState().data;
    return state.isPlaying ? this.pause() : this.play();
  },

  async next(): Promise<PlayerState> {
    const res = MockApi.next();
    if (audio) audio.pause();

    const nextTrack = res.data.currentTrack;
    if (nextTrack && nextTrack.previewUrl) {
      audio = new Audio(nextTrack.previewUrl);
      await audio.play();
    }

    return res.data;
  },

  async previous(): Promise<PlayerState> {
    const res = MockApi.previous();
    if (audio) audio.pause();

    const prevTrack = res.data.currentTrack;
    if (prevTrack && prevTrack.previewUrl) {
      audio = new Audio(prevTrack.previewUrl);
      await audio.play();
    }

    return res.data;
  },

  getState(): PlayerState {
    return MockApi.getPlayerState().data;
  },
};

// Music API functions
export const musicApi = {
  // Get current playback state
  getPlaybackState: async (): Promise<ApiResponse<PlaybackState>> => {
    if (USE_MOCK_DATA) {
      return createResponse(playbackState);
    }

    // Real API implementation would go here
    return createResponse(playbackState);
  },

  // Play a track
  play: async (trackId?: string): Promise<ApiResponse<PlaybackState>> => {
    try {
      if (USE_MOCK_DATA) {
        // If trackId is provided, update current track
        if (trackId) {
          const track = mockData.tracks.find(t => t.id === trackId);
          if (!track) {
            return createResponse(playbackState, 404, 'Track not found');
          }
          playbackState.currentTrack = track;
        }

        // If no track is set yet, return error
        if (!playbackState.currentTrack) {
          return createResponse(playbackState, 400, 'No track is currently set');
        }

        playbackState.isPlaying = true;
        return createResponse(playbackState);
      }

      // Real API implementation would go here
      return createResponse(playbackState);
    } catch (error) {
      console.error('Error playing track:', error);
      return createResponse(playbackState, 500, 'Failed to play track');
    }
  },

  // Pause playback
  pause: async (): Promise<ApiResponse<PlaybackState>> => {
    if (USE_MOCK_DATA) {
      playbackState.isPlaying = false;
      return createResponse(playbackState);
    }

    // Real API implementation would go here
    return createResponse(playbackState);
  },

  // Set current track
  setTrack: async (trackId: string): Promise<ApiResponse<PlaybackState>> => {
    try {
      if (USE_MOCK_DATA) {
        const track = mockData.tracks.find(t => t.id === trackId);
        if (!track) {
          return createResponse(playbackState, 404, 'Track not found');
        }

        playbackState.currentTrack = track;
        playbackState.progress = 0;
        return createResponse(playbackState);
      }

      // Real API implementation would go here
      return createResponse(playbackState);
    } catch (error) {
      console.error('Error setting track:', error);
      return createResponse(playbackState, 500, 'Failed to set track');
    }
  },

  // Get track by ID
  getTrack: async (trackId: string): Promise<ApiResponse<Track>> => {
    try {
      if (USE_MOCK_DATA) {
        const track = mockData.tracks.find(t => t.id === trackId);
        if (!track) {
          return createResponse(null as any, 404, 'Track not found');
        }
        return createResponse(track);
      }

      // Real API implementation would go here
      return createResponse(null as any, 500, 'Not implemented');
    } catch (error) {
      console.error('Error getting track:', error);
      return createResponse(null as any, 500, 'Failed to get track');
    }
  },

  // Reset playback state
  resetPlayback: async (): Promise<ApiResponse<PlaybackState>> => {
    playbackState = { ...initialPlaybackState };
    return createResponse(playbackState);
  }
};

export default musicApi;
