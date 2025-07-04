// musicService.ts
import axios from "axios";
import { MockApi } from "../lib/mocks/playerApi";
import { mockData } from "../mock/data";
import { ApiResponse, Track } from "../types";
import {
  ApiAlbumSongType,
  ApiAlbumType,
  ApiCreateAlbumRequest,
  ApiCreateAlbumSongRequest,
  ApiCreateAlbumSongsRequest,
  ApiCreateGenreRequest,
  ApiDeleteAlbumSongRequest,
  ApiDeleteAlbumsRequest,
  ApiDeleteGenresRequest,
  ApiDeleteSongsRequest,
  ApiEditAlbumRequest,
  ApiEditGenreRequest,
  ApiFavoriteSongType,
  ApiGenreType,
  ApiGetAlbumRequest,
  ApiGetGenreRequest,
  ApiGetSongsByAlbumIdRequest,
  ApiPaginatedResult,
  ApiResponse as ApiResponseV2,
  ApiSongCreateRequest,
  ApiSongType,
  ApiSongUpdateRequest,
} from "../types/api";
import { PlayerState } from "../types/index";
import { getToken } from "../utils/auth";
import { apiRequest } from "./authApi";
import { getCsrfToken } from "./storageApi";

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
          if (track.songUrl && track.songUrl.includes("/videos/")) {
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
  getTrack: async (trackId: string): Promise<ApiResponse<Track | null>> => {
    try {
      if (USE_MOCK_DATA) {
        const track = mockData.tracks.find((t) => t.id === trackId);
        if (!track) {
          return createResponse(null, 404, "Track not found");
        }
        return createResponse(track);
      }

      // Real API implementation would go here
      return createResponse(null, 500, "Not implemented");
    } catch (error) {
      console.error("Error getting track:", error);
      return createResponse(null, 500, "Failed to get track");
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
  ): Promise<ApiResponse<ApiPaginatedResult<ApiSongType>>> => {
    try {
      if (USE_MOCK_DATA) {
        const filtered = mockData.tracks.filter((t) =>
          t.title.toLowerCase().includes(title.toLowerCase())
        );
        // @ts-expect-error: mockData.tracks có thể không đúng type với ApiPaginatedResult<ApiSongType>
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

      if (res.data && res.data.result && res.data.result.length > 0) {
        res.data.result.forEach((song: unknown, index: number) => {
          if (
            typeof song === "object" &&
            song !== null &&
            "storageId" in song &&
            "storageImageId" in song
          ) {
            const s = song as { storageId?: string; storageImageId?: string };
            console.log(
              `Song ${index + 1} - storageId: ${s.storageId}, storageImageId: ${
                s.storageImageId
              }`
            );
          }
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
      profileId: localStorage.getItem("profile_id"),
    });
    const favList: ApiFavoriteSongType[] = favRes.data.data.result;

    const songList = await getSongsByIds(favList.map((fav) => fav.songID));
    return songList;
  },

  createFavorite: async (profileId: string, songId: string) => {
    const res = await usersApi.post("/favorite/create", { profileId, songId });
    return res.data;
  },

  deleteFavorite: async (profileId: string, songId: string) => {
    const res = await usersApi.post("/favorite/delete", { profileId, songId });
    return res.data;
  },
};

async function getSongsByIds(ids: string[]): Promise<ApiSongType[]> {
  return (
    await songsApi.get("/songs", {
      params: {
        ids: ids,
      },
      paramsSerializer: {
        indexes: false, // This will serialize arrays as repeated query params: ?id[]=1&id[]=2
      },
    })
  ).data.data;
}

export default musicApi;

// API function to create a new song
export const createSong = async (songData: {
  title: string;
  description: string;
  fileId: string; // ID của file nhạc đã upload thành công
  imageId?: string; // ID của ảnh bìa (nếu có)
  albumId?: string; // ID album (nếu có)
  artistId: string;
}) => {
  console.log("Đang tạo bài hát mới...");
  const headers = {
    "Content-Type": "application/json",
    "X-CSRFToken": getCsrfToken(),
    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  };

  try {
    const response = await fetch("http://localhost:8082/song/create", {
      method: "POST",
      headers,
      body: JSON.stringify(songData),
      credentials: "include",
    });
    const data = await response.json();
    return { status: response.status, data };
  } catch (error: unknown) {
    console.error("Lỗi khi tạo bài hát:", error);
    return { status: 500, data: { error: (error as Error).message } };
  }
};

export const createSongV2 = async (
  songData: ApiSongCreateRequest
): Promise<ApiResponseV2<ApiSongType>> => {
  const headers = {
    "Content-Type": "application/json",
    "X-CSRFToken": getCsrfToken(),
    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  };

  try {
    const response = await fetch("http://localhost:8082/song/create", {
      method: "POST",
      headers,
      body: JSON.stringify(songData),
      credentials: "include",
    });
    return await response.json();
  } catch (error: unknown) {
    console.error("Lỗi khi tạo bài hát:", error);
    throw error;
  }
};

export async function updateSong(
  body: ApiSongUpdateRequest
): Promise<ApiSongType> {
  return apiRequest<ApiSongType, ApiSongUpdateRequest>(
    "http://localhost:8082/song/update",
    "POST",
    body
  );
}

export async function deleteSongs(ids: string[]): Promise<ApiSongType> {
  return apiRequest<ApiSongType, ApiDeleteSongsRequest>(
    "http://localhost:8082/song/delete",
    "POST",
    { ids }
  );
}

export async function getGenres(
  body: ApiGetGenreRequest = { page: 1, pageSize: 100 }
): Promise<ApiPaginatedResult<ApiGenreType>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-CSRFToken": (await getCsrfToken()) || "",
    Authorization: `Bearer ${getAuthToken() || ""}`,
  };

  try {
    const response = await fetch("http://localhost:8082/genres", {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify(body),
    });
    if (response.status === 404) {
      return {
        result: [],
        currentPage: 1,
        total: 0,
        totalPages: 0,
      };
    }
    const result: ApiResponse<ApiPaginatedResult<ApiGenreType>> =
      await response.json();
    console.log("Response:", result);
    return result.data;
  } catch (error) {
    console.error("Error:", error);
    return Promise.reject(error);
  }
}

export async function createGenre(
  body: ApiCreateGenreRequest
): Promise<ApiGenreType> {
  return apiRequest<ApiGenreType, ApiCreateGenreRequest>(
    "http://localhost:8082/genre/create",
    "POST",
    body
  );
}

export async function editGenre(
  body: ApiEditGenreRequest
): Promise<ApiGenreType> {
  return apiRequest<ApiGenreType, ApiEditGenreRequest>(
    "http://localhost:8082/genre/update",
    "POST",
    body
  );
}

export async function deleteGenres(ids: string[]): Promise<unknown> {
  const body: ApiDeleteGenresRequest = { ids };
  return apiRequest<unknown, ApiDeleteGenresRequest>(
    "http://localhost:8082/genre/delete",
    "POST",
    body
  );
}

export async function getAlbums(
  body: ApiGetAlbumRequest = { page: 1, pageSize: 100 }
): Promise<ApiPaginatedResult<ApiAlbumType>> {
  return apiRequest<ApiPaginatedResult<ApiAlbumType>, ApiGetAlbumRequest>(
    "http://localhost:8082/albums",
    "POST",
    body
  );
}

export async function createAlbum(
  body: ApiCreateAlbumRequest
): Promise<ApiAlbumType> {
  return apiRequest<ApiAlbumType, ApiCreateAlbumRequest>(
    "http://localhost:8082/album/create",
    "POST",
    body
  );
}

export async function editAlbum(
  body: ApiEditAlbumRequest
): Promise<ApiAlbumType> {
  return apiRequest<ApiAlbumType, ApiEditAlbumRequest>(
    "http://localhost:8082/album/update",
    "POST",
    body
  );
}

export async function deleteAlbums(ids: string[]): Promise<unknown> {
  const body: ApiDeleteAlbumsRequest = { ids };
  return apiRequest<unknown, ApiDeleteAlbumsRequest>(
    "http://localhost:8082/album/delete",
    "POST",
    body
  );
}

export async function getSongsByAlbumId(
  body: ApiGetSongsByAlbumIdRequest = { albumId: "", page: 1, pageSize: 100 }
): Promise<ApiPaginatedResult<ApiSongType>> {
  return apiRequest<
    ApiPaginatedResult<ApiSongType>,
    ApiGetSongsByAlbumIdRequest
  >("http://localhost:8082/songs", "POST", body);
}

export async function createAlbumSongs(
  body: ApiCreateAlbumSongsRequest
): Promise<ApiAlbumSongType[]> {
  return apiRequest<ApiAlbumSongType[], ApiCreateAlbumSongsRequest>(
    "http://localhost:8082/album-song/create",
    "POST",
    body
  );
}

export async function deleteAlbumSong(
  body: ApiCreateAlbumSongRequest
): Promise<ApiAlbumSongType> {
  return apiRequest<ApiAlbumSongType, ApiCreateAlbumSongRequest>(
    "http://localhost:8082/album-song/delete",
    "POST",
    body
  );
}

export async function deleteAlbumSongMany(
  body: ApiDeleteAlbumSongRequest[]
): Promise<PromiseSettledResult<ApiAlbumSongType>[]> {
  return Promise.allSettled(
    body.map((req) =>
      apiRequest<ApiAlbumSongType, ApiDeleteAlbumSongRequest>(
        "http://localhost:8082/album-song/delete",
        "POST",
        req
      )
    )
  );
}

export async function deleteAlbumSongs(
  body: ApiCreateAlbumSongsRequest
): Promise<ApiAlbumSongType[]> {
  return apiRequest<ApiAlbumSongType[], ApiCreateAlbumSongsRequest>(
    "http://localhost:8082/album-song/delete",
    "POST",
    body
  );
}

// Helper function to get authorization token from localStorage
export function getAuthToken() {
  return localStorage.getItem("access_token");
}

// Lấy tất cả bài hát của artist theo artistId
export async function getSongsByArtistId(
  artistId: string
): Promise<ApiSongType[]> {
  const headers = {
    "Content-Type": "application/json",
    "X-CSRFToken": getCsrfToken() || "",
    Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
  };
  try {
    const response = await fetch("http://localhost:8082/songs", {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify({ artistId }),
    });
    const data = await response.json();
    console.log("API getSongsByArtistId response:", data);
    return data.data?.result || data.result || data.songs || [];
  } catch (error) {
    console.error("Lỗi khi lấy danh sách bài hát của artist:", error);
    return [];
  }
}

// Xóa 1 bài hát khỏi album
export async function removeSongFromAlbum(
  albumID: string,
  songID: string
): Promise<boolean> {
  const headers = {
    "Content-Type": "application/json",
    "X-CSRFToken": getCsrfToken() || "",
    Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
  };
  try {
    const response = await fetch("http://localhost:8082/album-song/delete", {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify({ albumID, songID }),
    });
    const data = await response.json();
    return response.status === 200 && data.success;
  } catch (error) {
    console.error("Lỗi khi xóa bài hát khỏi album:", error);
    return false;
  }
}

// Gọi API cập nhật danh sách bài hát cho album
export async function createOrUpdateAlbumSongs(
  albumID: string,
  songIDs: string[]
): Promise<{ success: boolean; error?: string }> {
  const headers = {
    "Content-Type": "application/json",
    "X-CSRFToken": getCsrfToken() || "",
    Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
  };
  try {
    const res = await fetch("http://localhost:8082/album-song/create", {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify({ albumID, songIDs }),
    });
    const data = await res.json();
    if (res.status === 200) {
      return { success: true };
    } else {
      return { success: false, error: data?.error || "Không rõ nguyên nhân" };
    }
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}
