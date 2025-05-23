import axios from "axios";
import {
  type Track,
  type Artist,
  type Album,
  type ApiResponse,
} from "../types";
import { mockData } from "../mock/data";
import { getToken } from "../utils/auth";

// Constants
const API_BASE_URL = "https://api.spotify.com/v1";
const USE_MOCK_DATA = true; // Toggle this to switch between real API and mock data

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

// Track API functions
export const getTracks = async (): Promise<ApiResponse<Track[]>> => {
  try {
    if (USE_MOCK_DATA) {
      return createResponse(mockData.tracks);
    }

    // In a real API, we'd need to use more specific endpoints as there's no generic /tracks endpoint
    // This is just a placeholder for the real API implementation
    const response = await axios.get(`${API_BASE_URL}/tracks`);
    return createResponse(response.data.tracks);
  } catch (error) {
    console.error("Error fetching tracks:", error);
    return createResponse(
      USE_MOCK_DATA ? mockData.tracks : [],
      USE_MOCK_DATA ? 200 : 500,
      USE_MOCK_DATA ? undefined : "Failed to fetch tracks"
    );
  }
};

export const getTrackById = async (
  id: string
): Promise<
  ApiResponse<
    Track & {
      album: Album;
      artist: Artist;
    }
  >
> => {
  if (!getToken()) throw new Error("No token");
  try {
    if (USE_MOCK_DATA) {
      const track = mockData.tracks.find((t) => t.id === id);

      if (!track) {
        return createResponse(null as any, 404, "Track not found");
      }

      // Get track album
      const album = mockData.albums.find((a) => a.id === track.albumId);

      // Get track artist
      const artist = mockData.artists.find((a) => a.id === track.artistId);

      return createResponse({
        ...track,
        album: album as Album,
        artist: artist as Artist,
      });
    }

    // Real API implementation
    const trackRes = await axios.get(`${API_BASE_URL}/tracks/${id}`);

    // Get album and artist details
    const [albumRes, artistRes] = await Promise.all([
      axios.get(`${API_BASE_URL}/albums/${trackRes.data.album.id}`),
      axios.get(`${API_BASE_URL}/artists/${trackRes.data.artists[0].id}`),
    ]);

    return createResponse({
      ...trackRes.data,
      album: albumRes.data,
      artist: artistRes.data,
    });
  } catch (error) {
    console.error("Error fetching track details:", error);
    return createResponse(null as any, 500, "Failed to fetch track details");
  }
};

export const searchTracks = async (
  query: string
): Promise<ApiResponse<Track[]>> => {
  try {
    if (USE_MOCK_DATA) {
      const results = mockData.tracks.filter(
        (track) =>
          track.title.toLowerCase().includes(query.toLowerCase()) ||
          track.artistName.toLowerCase().includes(query.toLowerCase()) ||
          track.albumName.toLowerCase().includes(query.toLowerCase())
      );
      return createResponse(results);
    }

    const response = await axios.get(
      `${API_BASE_URL}/search?q=${encodeURIComponent(query)}&type=track`
    );
    return createResponse(response.data.tracks.items);
  } catch (error) {
    console.error("Error searching tracks:", error);
    return createResponse([], 500, "Failed to search tracks");
  }
};

export const getTracksByAlbum = async (
  albumId: string
): Promise<ApiResponse<Track[]>> => {
  if (!getToken()) throw new Error("No token");
  try {
    if (USE_MOCK_DATA) {
      const album = mockData.albums.find((a) => a.id === albumId);
      if (!album) {
        return createResponse([], 404, "Album not found");
      }

      const tracks = album.tracks
        .map((trackId) => mockData.tracks.find((t) => t.id === trackId))
        .filter(Boolean) as Track[];

      return createResponse(tracks);
    }

    const response = await axios.get(
      `${API_BASE_URL}/albums/${albumId}/tracks`
    );
    return createResponse(response.data.items);
  } catch (error) {
    console.error("Error fetching album tracks:", error);
    return createResponse([], 500, "Failed to fetch album tracks");
  }
};

export const getTopTracks = async (
  artistId: string
): Promise<ApiResponse<Track[]>> => {
  if (!getToken()) throw new Error("No token");
  try {
    if (USE_MOCK_DATA) {
      const artist = mockData.artists.find((a) => a.id === artistId);
      if (!artist) {
        return createResponse([], 404, "Artist not found");
      }

      const topTracks = artist.topTracks
        .map((trackId) => mockData.tracks.find((t) => t.id === trackId))
        .filter(Boolean) as Track[];

      return createResponse(topTracks);
    }

    const response = await axios.get(
      `${API_BASE_URL}/artists/${artistId}/top-tracks?market=US`
    );
    return createResponse(response.data.tracks);
  } catch (error) {
    console.error("Error fetching artist top tracks:", error);
    return createResponse([], 500, "Failed to fetch artist top tracks");
  }
};

export const getRecommendations = async (
  seedTrackIds: string[]
): Promise<ApiResponse<Track[]>> => {
  try {
    if (USE_MOCK_DATA) {
      // Simple recommendation algorithm: get tracks from the same artists
      const seedTracks = seedTrackIds
        .map((id) => mockData.tracks.find((t) => t.id === id))
        .filter(Boolean) as Track[];
      const artistIds = [...new Set(seedTracks.map((track) => track.artistId))];

      const recommendations = mockData.tracks
        .filter(
          (track) =>
            artistIds.includes(track.artistId) &&
            !seedTrackIds.includes(track.id)
        )
        .slice(0, 10);

      return createResponse(recommendations);
    }

    const seedTracks = seedTrackIds.join(",");
    const response = await axios.get(
      `${API_BASE_URL}/recommendations?seed_tracks=${seedTracks}&limit=10`
    );
    return createResponse(response.data.tracks);
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return createResponse([], 500, "Failed to fetch recommendations");
  }
};
