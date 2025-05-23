// 📁 src/api/mockApi.ts
import { faker } from "@faker-js/faker";
import { mockData } from "../mock/data";
import { Category } from "../types";
import {
  getArtists,
  getArtistById,
  searchArtists,
  getArtistAlbums,
} from "./artists";
import {
  getAlbums,
  getAlbumById,
  searchAlbums,
  getNewReleases,
  getAlbumsByArtist,
} from "./albums";
import {
  getTracks,
  getTrackById,
  searchTracks,
  getTracksByAlbum,
  getTopTracks,
  getRecommendations,
} from "./tracks";
import { getToken } from "../utils/auth";

// Add delay to simulate network latency (ms)
const API_DELAY = 300;

// Helper function to delay responses to simulate network latency
const delayResponse = <T>(data: T): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, API_DELAY);
  });
};

// Mock API service combining all endpoints
export const mockApi = {
  // Artist endpoints
  artists: {
    getAll: async () => {
      if (!getToken()) throw new Error("No token");
      return getArtists();
    },
    getById: (id: string) => getArtistById(id),
    search: (query: string) => searchArtists(query),
    getAlbums: (artistId: string) => getArtistAlbums(artistId),
  },

  // Album endpoints
  albums: {
    getAll: async () => {
      if (!getToken()) throw new Error("No token");
      return getAlbums();
    },
    getById: (id: string) => getAlbumById(id),
    search: (query: string) => searchAlbums(query),
    getNewReleases: () => getNewReleases(),
    getByArtist: (artistId: string) => getAlbumsByArtist(artistId),
  },

  // Track endpoints
  tracks: {
    getAll: async () => {
      if (!getToken()) throw new Error("No token");
      return getTracks();
    },
    getById: (id: string) => getTrackById(id),
    search: (query: string) => searchTracks(query),
    getByAlbum: (albumId: string) => getTracksByAlbum(albumId),
    getTopTracks: (artistId: string) => getTopTracks(artistId),
    getRecommendations: (seedTrackIds: string[]) =>
      getRecommendations(seedTrackIds),
  },

  // Generic search across all entities
  search: async (query: string) => {
    const [artists, albums, tracks] = await Promise.all([
      searchArtists(query),
      searchAlbums(query),
      searchTracks(query),
    ]);

    return delayResponse({
      data: {
        artists: artists.data,
        albums: albums.data,
        tracks: tracks.data,
        playlists: [],
      },
      status: 200,
    });
  },

  // Home/discovery data
  getHomeData: async () => {
    try {
      const categories: Category[] = [];
      const popularArtists = [...mockData.artists]
        .sort((a, b) => b.monthlyListeners - a.monthlyListeners)
        .slice(0, 10);

      const popularAlbums = [...mockData.albums]
        .sort(() => Math.random() - 0.5)
        .slice(0, 10);

      const trendingSongs = [...mockData.tracks]
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 10);

      return delayResponse({
        data: {
          categories,
          popularArtists,
          popularAlbums,
          trendingSongs,
          popularPlaylists: [],
        },
        status: 200,
      });
    } catch (error) {
      console.error("Error fetching home data:", error);
      return delayResponse({
        data: null,
        status: 500,
        message: "Failed to fetch home data",
      });
    }
  },
};

// Export the complete mock data
export { mockData };
