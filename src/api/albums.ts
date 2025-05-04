import axios from 'axios';
import { type Album, type Track, type Artist, type ApiResponse } from '../types';
import { mockData } from '../mock/data';
import { getToken } from '../utils/auth';

// Constants
const API_BASE_URL = 'https://api.spotify.com/v1';
const USE_MOCK_DATA = true; // Toggle this to switch between real API and mock data

// Helper to format response
const createResponse = <T>(data: T, status = 200, message?: string): ApiResponse<T> => {
  return {
    data,
    status,
    message,
  };
};

// Album API functions
export const getAlbums = async (): Promise<ApiResponse<Album[]>> => {
  try {
    if (USE_MOCK_DATA) {
      return createResponse(mockData.albums);
    }

    const response = await axios.get(`${API_BASE_URL}/albums`);
    return createResponse(response.data.albums);
  } catch (error) {
    console.error('Error fetching albums:', error);
    return createResponse(USE_MOCK_DATA ? mockData.albums : [], 
      USE_MOCK_DATA ? 200 : 500, 
      USE_MOCK_DATA ? undefined : 'Failed to fetch albums');
  }
};

export const getAlbumById = async (id: string): Promise<ApiResponse<{ album: Album; tracks: Track[]; artist: Artist; }>> => {
  if (!getToken()) throw new Error('No token');
  try {
    if (USE_MOCK_DATA) {
      const album = mockData.albums.find(a => a.id === id);
      if (!album) {
        return createResponse(null as any, 404, 'Album not found');
      }
      // Get album tracks (Track[])
      const tracks = album.tracks.map(trackId =>
        mockData.tracks.find(t => t.id === trackId)
      ).filter(Boolean) as Track[];
      // Get album artist
      const artist = mockData.artists.find(a => a.id === album.artistId);
      // Trả về object đúng cấu trúc
      return createResponse({
        album,
        tracks,
        artist: artist as Artist,
      });
    }

    // Real API implementation
    const [albumRes, tracksRes] = await Promise.all([
      axios.get(`${API_BASE_URL}/albums/${id}`),
      axios.get(`${API_BASE_URL}/albums/${id}/tracks`)
    ]);

    // Get the artist details
    const artistRes = await axios.get(`${API_BASE_URL}/artists/${albumRes.data.artists[0].id}`);

    return createResponse({
      ...albumRes.data,
      tracks: tracksRes.data.items,
      artist: artistRes.data
    });
  } catch (error) {
    console.error('Error fetching album details:', error);
    return createResponse(null as any, 500, 'Failed to fetch album details');
  }
};

export const searchAlbums = async (query: string): Promise<ApiResponse<Album[]>> => {
  try {
    if (USE_MOCK_DATA) {
      const results = mockData.albums.filter(album => 
        album.title.toLowerCase().includes(query.toLowerCase()) ||
        album.artistName.toLowerCase().includes(query.toLowerCase())
      );
      return createResponse(results);
    }

    const response = await axios.get(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}&type=album`);
    return createResponse(response.data.albums.items);
  } catch (error) {
    console.error('Error searching albums:', error);
    return createResponse([], 500, 'Failed to search albums');
  }
};

export const getNewReleases = async (): Promise<ApiResponse<Album[]>> => {
  try {
    if (USE_MOCK_DATA) {
      // Sort by release date to get newest albums
      const newReleases = [...mockData.albums]
        .sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime())
        .slice(0, 10);
      
      return createResponse(newReleases);
    }

    const response = await axios.get(`${API_BASE_URL}/browse/new-releases`);
    return createResponse(response.data.albums.items);
  } catch (error) {
    console.error('Error fetching new releases:', error);
    return createResponse([], 500, 'Failed to fetch new releases');
  }
};

export const getAlbumsByArtist = async (artistId: string): Promise<ApiResponse<Album[]>> => {
  try {
    if (USE_MOCK_DATA) {
      const albums = mockData.albums.filter(album => album.artistId === artistId);
      return createResponse(albums);
    }

    const response = await axios.get(`${API_BASE_URL}/artists/${artistId}/albums`);
    return createResponse(response.data.items);
  } catch (error) {
    console.error('Error fetching artist albums:', error);
    return createResponse([], 500, 'Failed to fetch artist albums');
  }
}; 