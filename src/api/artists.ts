import axios from 'axios';
import { type Artist, type Album, type Track, type ApiResponse } from '../types';
import { mockData } from '../mock/data';
import { getToken } from '../utils/auth';
import { getImageUrl } from './storageApi';

// Constants
const API_BASE_URL = 'http://localhost:8081'; // URL đến backend API thực tế
const USE_MOCK_DATA = false; // Toggle this to switch between real API and mock data

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

export const getArtistById = async (id: string): Promise<ApiResponse<{ artist: Artist; albums: Album[]; singles: Album[]; topTracks: Track[]; relatedArtists: Artist[] }>> => {
  if (!getToken()) throw new Error('No token');
  try {
    if (USE_MOCK_DATA) {
      // Kiểm tra xem id có phải là accountID không
      let artist = mockData.artists.find(a => a.id === id);
      
      // Nếu không tìm thấy theo id, thử tìm theo accountID
      if (!artist) {
        artist = mockData.artists.find(a => a.accountID === id);
      }
      
      if (!artist) {
        console.log(`Không tìm thấy nghệ sĩ với ID: ${id}`);
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
        artist,
        albums,
        singles,
        topTracks,
        relatedArtists,
      });
    }

    // Gọi API thực tế - POST đến /profile với accountID
    console.log(`Gọi API thực với ID: ${id}`);
    
    // Lấy CSRF token từ cookie
    const getCsrfToken = () => {
      return document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1] || '';
    };
    const csrfToken = getCsrfToken();

    // Gọi API profile để lấy thông tin nghệ sĩ
    const profileResponse = await axios.post(
      `${API_BASE_URL}/profiles`,
      { accountID: id },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
          'X-CSRFToken': csrfToken,
        },
        withCredentials: true,
      }
    );
    
    console.log('Profile API response:', profileResponse.data);
    
    if (profileResponse.data.success) {
      const profileData = profileResponse.data.data;
      
      // Tạo đối tượng artist từ dữ liệu profile API
      const artist: Artist = {
        id: profileData.id,
        name: profileData.fullName,
        avatarUrl: profileData.avatarUrl,
        bio: profileData.bio || '',
        genres: ['V-Pop'], // Có thể điều chỉnh hoặc lấy từ API nếu có
        monthlyListeners: 0, // Có thể điều chỉnh hoặc lấy từ API nếu có
        albums: [],
        singles: [],
        topTracks: [],
        related: [],
        accountID: profileData.accountID,
        fullName: profileData.fullName,
        dateOfBirth: profileData.dateOfBirth,
        phoneNumber: profileData.phoneNumber,
        createdAt: profileData.createdAt,
        updatedAt: profileData.updatedAt,
        deletedAt: profileData.deletedAt,
        isActive: profileData.isActive
      };
      
      // Gọi API để lấy bài hát phổ biến của nghệ sĩ
      let topTracks: Track[] = [];
      try {
        const songsResponse = await axios.post(
          'http://localhost:8082/songs',
          { 
            artistId: id,
            page: 1,
            pageSize: 10
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${getToken()}`,
              'X-CSRFToken': csrfToken,
            },
            withCredentials: true,
          }
        );
        
        console.log('Songs API response:', songsResponse.data);
        
        if (songsResponse.data.success && songsResponse.data.data && songsResponse.data.data.result) {
          // Chuyển đổi dữ liệu bài hát từ API sang định dạng Track
          topTracks = songsResponse.data.data.result.map((song: any) => ({
            id: song.id,
            title: song.title || '',
            artistId: song.artistId || id,
            artistName: profileData.fullName,
            albumId: song.albumId || '',
            albumName: song.albumName || '',
            durationMs: song.duration ? song.duration * 1000 : 0,
            explicit: false,
            previewUrl: '',
            popularity: 100,
            coverUrl: song.coverUrl || '',
            storageId: song.storageId || '',
            storageImageId: song.storageImageId || '',
          }));
          
          console.log('Converted tracks:', topTracks);
          
          // Lấy ảnh cho các bài hát nếu không có coverUrl
          const tracksPromises = topTracks.map(async (track) => {
            if (!track.coverUrl && (track.storageImageId || track.storageId)) {
              try {
                // Ưu tiên lấy từ storageImageId trước
                const imageId = track.storageImageId || 
                               (track as any).storageImageId ||
                               (track as any).storageImageID;
                
                let imageUrl = null;
                
                if (imageId) {
                  console.log(`Đang lấy ảnh cho bài hát "${track.title}" từ storageImageId: ${imageId}`);
                  imageUrl = await getImageUrl(imageId);
                }
                
                // Nếu không có storageImageId hoặc không lấy được, thử dùng storageId
                if (!imageUrl && track.storageId) {
                  console.log(`Đang lấy ảnh cho bài hát "${track.title}" từ storageId: ${track.storageId}`);
                  imageUrl = await getImageUrl(track.storageId);
                }
                
                if (imageUrl) {
                  console.log(`Đã lấy được URL ảnh cho bài hát "${track.title}": ${imageUrl}`);
                  return { ...track, coverUrl: imageUrl };
                }
              } catch (error) {
                console.error(`Lỗi khi lấy ảnh cho bài hát "${track.title}":`, error);
              }
            }
            return track;
          });
          
          // Đợi tất cả các promise hoàn thành
          topTracks = await Promise.all(tracksPromises);
        }
      } catch (error) {
        console.error('Error fetching artist tracks:', error);
      }
      
      // Giả lập albums và singles (có thể thay bằng API call thực tế sau)
      return createResponse({
        artist,
        albums: [],
        singles: [],
        topTracks,
        relatedArtists: []
      });
    } else {
      console.error('Profile API không trả về dữ liệu thành công:', profileResponse.data);
      return createResponse(null as any, 404, 'Artist not found');
    }
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