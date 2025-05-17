import axios from 'axios';
import { type Album, type Track, type Artist, type ApiResponse } from '../types';
import { mockData } from '../mock/data';
import { getToken } from '../utils/auth';
import { getImageUrl } from './storageApi';

// Constants
const API_BASE_URL = 'http://localhost:8082';
const USE_MOCK_DATA = false; // Toggle this to switch between real API and mock data

// Helper to format response
const createResponse = <T>(data: T, status = 200, message?: string): ApiResponse<T> => {
  return {
    data,
    status,
    message,
  };
};

// Helper to get CSRF token
const getCsrfToken = () => {
  return document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1] || '';
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
      // Mock data logic
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

    // Real API implementation - get album details
    console.log(`Fetching album by ID: ${id}`);
    
    // Gọi API để lấy thông tin album
    const albumResponse = await axios.get(`${API_BASE_URL}/album/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
        'X-CSRFToken': getCsrfToken(),
      },
      withCredentials: true,
    });
    
    console.log('Album response:', albumResponse.data);
    
    if (!albumResponse.data.success) {
      console.error('Album not found or error in API:', albumResponse.data);
      return createResponse(null as any, 404, 'Album not found');
    }
    
    const albumData = albumResponse.data.data;
    
    // Tạo đối tượng album từ dữ liệu API
    const album: Album = {
      id: albumData.id,
      title: albumData.name,
      artistId: albumData.artistId,
      artistName: '', // Sẽ được cập nhật từ API artist
      releaseDate: albumData.createdAt || new Date().toISOString(),
      totalTracks: 0, // Sẽ được cập nhật từ số lượng tracks
      type: 'album',
      coverUrl: '',
      tracks: [], // Thêm thuộc tính bắt buộc
      durationMs: 0  // Thêm thuộc tính bắt buộc
    };
    
    // Lấy ảnh album nếu có storageImageId
    if (albumData.storageImageId) {
      try {
        const imageUrl = await getImageUrl(albumData.storageImageId);
        if (imageUrl) {
          album.coverUrl = imageUrl;
          console.log(`Album cover URL: ${imageUrl}`);
        }
      } catch (error) {
        console.error('Error fetching album cover:', error);
      }
    }
    
    // Gọi API để lấy danh sách bài hát trong album
    const tracksResponse = await axios.post(`${API_BASE_URL}/songs`, {
      albumId: id,
      page: 1,
      pageSize: 50
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
        'X-CSRFToken': getCsrfToken(),
      },
      withCredentials: true,
    });
    
    console.log('Tracks response:', tracksResponse.data);
    
    let tracks: Track[] = [];
    
    // Xử lý dữ liệu tracks
    if (tracksResponse.data.success && tracksResponse.data.data && tracksResponse.data.data.result) {
      const tracksData = tracksResponse.data.data.result;
      
      // Cập nhật totalTracks
      album.totalTracks = tracksData.length;
      
      // Chuyển đổi dữ liệu bài hát
      tracks = await Promise.all(tracksData.map(async (track: any) => {
        const trackObj: Track = {
          id: track.id,
          title: track.title || '',
          artistId: track.artistId || albumData.artistId,
          artistName: track.artistName || '',
          albumId: id,
          albumName: album.title,
          durationMs: track.duration ? track.duration * 1000 : 0,
          explicit: false,
          previewUrl: '',
          popularity: 100,
          coverUrl: track.coverUrl || album.coverUrl || '',
          storageId: track.storageId || '',
          storageImageId: track.storageImageId || '',
          trackNumber: track.trackNumber || 1,
          isPlayable: true,
          videoUrl: null
        };
        
        // Lấy ảnh cho track nếu không có sẵn coverUrl
        if (!trackObj.coverUrl && track.storageImageId) {
          try {
            const imageUrl = await getImageUrl(track.storageImageId);
            if (imageUrl) {
              trackObj.coverUrl = imageUrl;
            }
          } catch (error) {
            console.error(`Error fetching track cover for ${track.title}:`, error);
          }
        }
        
        return trackObj;
      }));
    }
    
    // Gọi API để lấy thông tin nghệ sĩ
    let artist: Artist | null = null;
    
    if (albumData.artistId) {
      try {
        const artistResponse = await axios.post(
          `http://localhost:8081/profiles`,
          {
            accountID: albumData.artistId
          }, 
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${getToken()}`,
              'X-CSRFToken': getCsrfToken(),
            },
            withCredentials: true,
          }
        );
        
        console.log('Artist response:', artistResponse.data);
        
        if (artistResponse.data.success && artistResponse.data.data) {
          const artistData = artistResponse.data.data;
          
          artist = {
            id: artistData.id,
            name: artistData.fullName,
            bio: artistData.bio || '',
            avatarUrl: artistData.avatarUrl || '',
            genres: ['V-Pop'], // Mặc định
            monthlyListeners: 0,
            albums: [],
            singles: [],
            topTracks: [],
            related: [],
            accountID: artistData.accountID,
            fullName: artistData.fullName,
            dateOfBirth: artistData.dateOfBirth,
            phoneNumber: artistData.phoneNumber,
            createdAt: artistData.createdAt,
            updatedAt: artistData.updatedAt,
            deletedAt: artistData.deletedAt,
            isActive: artistData.isActive
          };
          
          // Cập nhật tên nghệ sĩ cho album và các track
          album.artistName = artistData.fullName;
          tracks.forEach(track => {
            if (!track.artistName) {
              track.artistName = artistData.fullName;
            }
          });
        }
      } catch (error) {
        console.error('Error fetching artist data:', error);
      }
    }
    
    return createResponse({
      album,
      tracks,
      artist: artist as Artist,
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