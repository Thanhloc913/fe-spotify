import axios from 'axios';
import { mockData } from '../mock/data';
import {
  type Artist,
  type Album,
  type Track,
  type Playlist,
  Category,
  type User,
  type SearchResult,
  type ApiResponse
} from '../types';

// Import specific API implementations
import * as artistsApi from './artists';
import * as albumsApi from './albums';
import * as tracksApi from './tracks';
import { mockApi } from './mockApi';

// Create a mock Axios instance
const mockAxios = axios.create();

// Add response interceptor to simulate API delay
mockAxios.interceptors.response.use(response => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(response);
    }, 300); // Add 300ms delay to simulate network
  });
});

// Helper to format response
const createResponse = <T>(data: T, status = 200, message?: string): ApiResponse<T> => {
  return {
    data,
    status,
    message,
  };
};

// Main API configuration
const USE_MOCK_DATA = true; // Set to false to use real API when it's ready

// Mock API service
const api = {
  // Use imported API implementations
  artists: artistsApi,
  albums: albumsApi,
  tracks: tracksApi,
  mock: mockApi,

  // Home
  getHomeData: async () => {
    try {
      const categories = mockData.categories?.slice(0, 5) || [];
      const popularArtists = [...mockData.artists]
        .sort((a, b) => b.monthlyListeners - a.monthlyListeners)
        .slice(0, 10);

      const popularAlbums = [...mockData.albums]
        .sort(() => Math.random() - 0.5)
        .slice(0, 10);

      const trendingSongs = [...mockData.tracks]
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 10);

      const popularPlaylists = mockData.playlists 
        ? [...mockData.playlists]
        .sort((a, b) => b.followers - a.followers)
            .slice(0, 10)
        : [];

      return createResponse({
        categories,
        popularArtists,
        popularAlbums,
        trendingSongs,
        popularPlaylists,
      });
    } catch (error) {
      console.error('Error fetching home data:', error);
      return createResponse(null, 500, 'Failed to fetch home data');
    }
  },

  // Categories
  getCategories: async () => {
    try {
      return createResponse(mockData.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      return createResponse([], 500, 'Failed to fetch categories');
    }
  },

  getCategoryById: async (id: string) => {
    try {
      const category = mockData.categories.find(c => c.id === id);
      if (!category) {
        return createResponse(null, 404, 'Category not found');
      }
      return createResponse(category);
    } catch (error) {
      console.error('Error fetching category:', error);
      return createResponse(null, 500, 'Failed to fetch category');
    }
  },

  // Artists
  getArtists: async () => {
    try {
      return createResponse(mockData.artists);
    } catch (error) {
      console.error('Error fetching artists:', error);
      return createResponse([], 500, 'Failed to fetch artists');
    }
  },

  getArtistById: async (id: string) => {
    try {
      const artist = mockData.artists.find(a => a.id === id);
      if (!artist) {
        return createResponse(null, 404, 'Artist not found');
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
    } catch (error) {
      console.error('Error fetching artist:', error);
      return createResponse(null, 500, 'Failed to fetch artist');
    }
  },

  // Albums
  getAlbums: async () => {
    try {
      return createResponse(mockData.albums);
    } catch (error) {
      console.error('Error fetching albums:', error);
      return createResponse([], 500, 'Failed to fetch albums');
    }
  },

  getAlbumById: async (id: string) => {
    try {
      const album = mockData.albums.find(a => a.id === id);
      if (!album) {
        return createResponse(null, 404, 'Album not found');
      }

      // Get album tracks
      const tracks = album.tracks.map(trackId =>
        mockData.tracks.find(t => t.id === trackId)
      ).filter(Boolean) as Track[];

      // Get album artist
      const artist = mockData.artists.find(a => a.id === album.artistId);

      return createResponse({
        ...album,
        tracks,
        artist,
      });
    } catch (error) {
      console.error('Error fetching album:', error);
      return createResponse(null, 500, 'Failed to fetch album');
    }
  },

  // Tracks
  getTracks: async () => {
    try {
      return createResponse(mockData.tracks);
    } catch (error) {
      console.error('Error fetching tracks:', error);
      return createResponse([], 500, 'Failed to fetch tracks');
    }
  },

  getTrackById: async (id: string) => {
    try {
      const track = mockData.tracks.find(t => t.id === id);
      if (!track) {
        return createResponse(null, 404, 'Track not found');
      }
      return createResponse(track);
    } catch (error) {
      console.error('Error fetching track:', error);
      return createResponse(null, 500, 'Failed to fetch track');
    }
  },

  // Playlists
  getPlaylists: async () => {
    try {
      return createResponse(mockData.playlists);
    } catch (error) {
      console.error('Error fetching playlists:', error);
      return createResponse([], 500, 'Failed to fetch playlists');
    }
  },

  getPlaylistById: async (id: string) => {
    try {
      const playlist = mockData.playlists.find(p => p.id === id);
      if (!playlist) {
        return createResponse(null, 404, 'Playlist not found');
      }

      // Get playlist tracks
      const tracks = playlist.tracks.map(trackId =>
        mockData.tracks.find(t => t.id === trackId)
      ).filter(Boolean) as Track[];

      // Get playlist owner
      const owner = mockData.users.find(u => u.id === playlist.ownerId);

      return createResponse({
        ...playlist,
        tracks,
        owner,
      });
    } catch (error) {
      console.error('Error fetching playlist:', error);
      return createResponse(null, 500, 'Failed to fetch playlist');
    }
  },

  // Search
  search: async (query: string): Promise<ApiResponse<SearchResult>> => {
    try {
      if (!query || query.trim() === '') {
        return createResponse({
          artists: [],
          albums: [],
          tracks: [],
          playlists: [],
        });
      }

      const lowercaseQuery = query.toLowerCase();

      // Search artists
      const artists = mockData.artists.filter(artist =>
        artist.name.toLowerCase().includes(lowercaseQuery)
      );

      // Search albums
      const albums = mockData.albums.filter(album =>
        album.title.toLowerCase().includes(lowercaseQuery) ||
        album.artistName.toLowerCase().includes(lowercaseQuery)
      );

      // Search tracks
      const tracks = mockData.tracks.filter(track =>
        track.title.toLowerCase().includes(lowercaseQuery) ||
        track.artistName.toLowerCase().includes(lowercaseQuery)
      );

      // Search playlists
      const playlists = mockData.playlists.filter(playlist =>
        playlist.name.toLowerCase().includes(lowercaseQuery) ||
        playlist.description.toLowerCase().includes(lowercaseQuery)
      );

      return createResponse({
        artists,
        albums,
        tracks,
        playlists,
      });
    } catch (error) {
      console.error('Error during search:', error);
      return createResponse({
        artists: [],
        albums: [],
        tracks: [],
        playlists: [],
      }, 500, 'Search failed');
    }
  },

  // User related
  getCurrentUser: async (): Promise<ApiResponse<User | null>> => {
    try {
      // For mock, just return the first user
      const user = mockData.users[0];
      return createResponse(user);
    } catch (error) {
      console.error('Error fetching current user:', error);
      return createResponse(null, 500, 'Failed to fetch user');
    }
  },

  getUserPlaylists: async (userId: string) => {
    try {
      const user = mockData.users.find(u => u.id === userId);
      if (!user) {
        return createResponse([], 404, 'User not found');
      }

      const playlists = user.playlists.map(playlistId =>
        mockData.playlists.find(p => p.id === playlistId)
      ).filter(Boolean) as Playlist[];

      return createResponse(playlists);
    } catch (error) {
      console.error('Error fetching user playlists:', error);
      return createResponse([], 500, 'Failed to fetch user playlists');
    }
  },
};

export default api;
