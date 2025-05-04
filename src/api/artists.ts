import axios from 'axios';
import { type Artist, type Album, type Track, type ApiResponse } from '../types';
import { mockData } from '../mock/data';

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

// Artist API functions
export const getArtists = async (): Promise<ApiResponse<Artist[]>> => {
  try {
    if (USE_MOCK_DATA) {
      return createResponse(mockData.artists);
    }

    const response = await axios.get(`${API_BASE_URL}/artists`);
    return createResponse(response.data.artists);
  } catch (error) {
    console.error('Error fetching artists:', error);
    return createResponse(USE_MOCK_DATA ? mockData.artists : [], 
      USE_MOCK_DATA ? 200 : 500, 
      USE_MOCK_DATA ? undefined : 'Failed to fetch artists');
  }
};

export const getArtistById = async (id: string): Promise<ApiResponse<Artist & { 
  albums: Album[], 
  singles: Album[], 
  topTracks: Track[], 
  relatedArtists: Artist[] 
}>> => {
  try {
    if (USE_MOCK_DATA) {
      const artist = mockData.artists.find(a => a.id === id);
      
      if (!artist) {
        return createResponse(null as any, 404, 'Artist not found');
      }

      // Get artist albums
      const albums = artist.albums.map(albumId =>
        mockData.albums.find(a => a.id === albumId)
      ).filter(Boolean) as Album[];

      // Get artist singles
      const singles = artist.singles.map(singleId =>
        mockData.albums.find(a => a.id === singleId)
      ).filter(Boolean) as Album[];

      // Get artist top tracks
      const topTracks = artist.topTracks.map(trackId =>
        mockData.tracks.find(t => t.id === trackId)
      ).filter(Boolean) as Track[];

      // Get related artists
      const relatedArtists = artist.related.map(artistId =>
        mockData.artists.find(a => a.id === artistId)
      ).filter(Boolean) as Artist[];

      return createResponse({
        ...artist,
        albums,
        singles,
        topTracks,
        relatedArtists,
      });
    }

    // Real API implementation
    const [artistRes, albumsRes, singlesRes, topTracksRes, relatedRes] = await Promise.all([
      axios.get(`${API_BASE_URL}/artists/${id}`),
      axios.get(`${API_BASE_URL}/artists/${id}/albums?include_groups=album`),
      axios.get(`${API_BASE_URL}/artists/${id}/albums?include_groups=single`),
      axios.get(`${API_BASE_URL}/artists/${id}/top-tracks?market=US`),
      axios.get(`${API_BASE_URL}/artists/${id}/related-artists`)
    ]);

    return createResponse({
      ...artistRes.data,
      albums: albumsRes.data.items,
      singles: singlesRes.data.items,
      topTracks: topTracksRes.data.tracks,
      relatedArtists: relatedRes.data.artists
    });
  } catch (error) {
    console.error('Error fetching artist details:', error);
    return createResponse(null as any, 500, 'Failed to fetch artist details');
  }
};

export const searchArtists = async (query: string): Promise<ApiResponse<Artist[]>> => {
  try {
    if (USE_MOCK_DATA) {
      const results = mockData.artists.filter(artist => 
        artist.name.toLowerCase().includes(query.toLowerCase())
      );
      return createResponse(results);
    }

    const response = await axios.get(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}&type=artist`);
    return createResponse(response.data.artists.items);
  } catch (error) {
    console.error('Error searching artists:', error);
    return createResponse([], 500, 'Failed to search artists');
  }
};

export const getArtistAlbums = async (artistId: string): Promise<ApiResponse<Album[]>> => {
  try {
    if (USE_MOCK_DATA) {
      const artist = mockData.artists.find(a => a.id === artistId);
      if (!artist) {
        return createResponse([], 404, 'Artist not found');
      }
      
      const albums = artist.albums.map(albumId =>
        mockData.albums.find(a => a.id === albumId)
      ).filter(Boolean) as Album[];
      
      return createResponse(albums);
    }

    const response = await axios.get(`${API_BASE_URL}/artists/${artistId}/albums`);
    return createResponse(response.data.items);
  } catch (error) {
    console.error('Error fetching artist albums:', error);
    return createResponse([], 500, 'Failed to fetch artist albums');
  }
}; 