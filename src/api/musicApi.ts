// musicService.ts
import { MockApi } from "../lib/mocks/playerApi";
import { PlayerState } from "../types/index";
import { Track, ApiResponse } from "../types";
import { mockData } from "../mock/data";
import axios from "axios";
import { ApiSongType } from "../types/api";
import { getProfileByAccountID } from "./profileApi";
import { getCsrfToken } from "./storageApi";
import { getToken } from "../utils/auth";

let audio: HTMLAudioElement | null = null;

// Constants
const USE_MOCK_DATA = false; // Toggle this to switch between real API and mock data

// Helper to format response
const createResponse = <T>(
  data: T,
  status = 200,
  message?: string
): ApiResponse<T> => {
  return {
    data,
    status,
    message,
  };
};

const SONGS_API_URL = "http://localhost:8082";

const songsApi = axios.create({
  baseURL: SONGS_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

const USERS_API_URL = "http://localhost:8081";

const usersApi = axios.create({
  baseURL: USERS_API_URL,
  headers: {
    "X-CSRFToken": getCsrfToken(),
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Interceptor để tự động gắn token vào request
songsApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export interface PlaybackState {
  isPlaying: boolean;
  currentTrack: Track | null;
  progress: number;
  volume: number;
  shuffle: boolean;
  repeat: "off" | "track" | "context";
}

// Initial playback state
const initialPlaybackState: PlaybackState = {
  isPlaying: false,
  currentTrack: null,
  progress: 0,
  volume: 0.5,
  shuffle: false,
  repeat: "off",
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
          const track = mockData.tracks.find((t) => t.id === trackId);
          if (!track) {
            return createResponse(playbackState, 404, "Track not found");
          }
          playbackState.currentTrack = track;
        }

        // If no track is set yet, return error
        if (!playbackState.currentTrack) {
          return createResponse(
            playbackState,
            400,
            "No track is currently set"
          );
        }

        playbackState.isPlaying = true;
        return createResponse(playbackState);
      }

      // Real API implementation would go here
      return createResponse(playbackState);
    } catch (error) {
      console.error("Error playing track:", error);
      return createResponse(playbackState, 500, "Failed to play track");
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
        const track = mockData.tracks.find((t) => t.id === trackId);
        if (!track) {
          return createResponse(playbackState, 404, "Track not found");
        }

        console.log("Setting track:", track);
        console.log("Track type:", track.songType); 

        // Ensure the track has the songType property
        if (!track.songType) {
          // Default to SONG if not specified
          track.songType = "SONG";
          
          // If it has a songUrl that includes /videos/, it's likely a music video
          if (track.songUrl && track.songUrl.includes('/videos/')) {
            track.songType = "MUSIC_VIDEO";
          }
        }

        console.log("Updated track type:", track.songType);
        playbackState.currentTrack = track;
        playbackState.progress = 0;
        return createResponse(playbackState);
      }

      // Real API implementation would go here
      return createResponse(playbackState);
    } catch (error) {
      console.error("Error setting track:", error);
      return createResponse(playbackState, 500, "Failed to set track");
    }
  },

  // Get track by ID
  getTrack: async (trackId: string): Promise<ApiResponse<Track>> => {
    try {
      if (USE_MOCK_DATA) {
        const track = mockData.tracks.find((t) => t.id === trackId);
        if (!track) {
          return createResponse(null as any, 404, "Track not found");
        }
        return createResponse(track);
      }

      // Real API implementation would go here
      return createResponse(null as any, 500, "Not implemented");
    } catch (error) {
      console.error("Error getting track:", error);
      return createResponse(null as any, 500, "Failed to get track");
    }
  },

  // Reset playback state
  resetPlayback: async (): Promise<ApiResponse<PlaybackState>> => {
    playbackState = { ...initialPlaybackState };
    return createResponse(playbackState);
  },

  searchSongsByTitle: async (
    title: string,
    page: number = 1,
    pageSize: number = 10
  ) => {
    try {
      console.log(
        `Tìm kiếm bài hát với tiêu đề: ${title}, page: ${page}, pageSize: ${pageSize}`
      );

      if (USE_MOCK_DATA) {
        const filtered = mockData.tracks.filter((t) =>
          t.title.toLowerCase().includes(title.toLowerCase())
        );
        return createResponse({
          result: filtered.slice((page - 1) * pageSize, page * pageSize),
          currentPage: page,
          total: filtered.length,
          totalPages: Math.ceil(filtered.length / pageSize),
        });
      }

      // Lấy CSRF token từ cookie
      const getCsrfToken = () => {
        return (
          document.cookie
            .split("; ")
            .find((row) => row.startsWith("csrftoken="))
            ?.split("=")[1] || ""
        );
      };
      const csrfToken = getCsrfToken();

      // Gọi API bằng axios
      const res = await axios.post(
        "http://localhost:8082/songs",
        { title, page, pageSize },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "X-CSRFToken": csrfToken,
          },
          withCredentials: true,
        }
      );

      console.log(
        "Response từ API tìm kiếm:",
        JSON.stringify(res.data, null, 2)
      );

      // Log thông tin về storageImageId
      if (res.data && res.data.result && res.data.result.length > 0) {
        res.data.result.forEach((song: any, index: number) => {
          console.log(
            `Song ${index + 1} - storageId: ${
              song.storageId
            }, storageImageId: ${song.storageImageId}`
          );
        });
      }

      return res.data;
    } catch (error) {
      console.error("Lỗi tìm kiếm bài hát:", error);
      throw error;
    }
  },

  getLikedSongs: async (): Promise<ApiSongType[]> => {
    const favRes = await usersApi.post("/favorites", {
      profileId: (
        await getProfileByAccountID(localStorage.getItem("account_id") ?? "")
      )?.id,
    });
    const favList: { profileID: string; songID: string }[] =
      favRes.data.data.result;
    console.log("favorite list", favList);

    const songRes = await songsApi.get("/songs", {
      params: {
        id: favList.map((fav) => fav.songID),
      },
      paramsSerializer: {
        indexes: false, // This will serialize arrays as repeated query params: ?id[]=1&id[]=2
      },
    });
    const songList = songRes.data.data.result;
    console.log("favorite song list", songList);
    return songList;
  },
};

export default musicApi;
