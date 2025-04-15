// musicService.ts
import { MockApi } from '../lib/mocks/playerApi';
import { PlayerState } from '../types/index';

let audio: HTMLAudioElement | null = null;

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
