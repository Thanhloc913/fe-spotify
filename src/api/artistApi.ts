import { getAllArtists, getArtistById, searchArtistsByName, getRelatedArtists } from "../lib/mocks/artists"
import type { Artist } from "../types"

// API để lấy tất cả nghệ sĩ
export const fetchAllArtists = async (): Promise<Artist[]> => {
  // Giả lập delay của API call
  await new Promise((resolve) => setTimeout(resolve, 500))
  return getAllArtists()
}

// API để lấy nghệ sĩ theo ID
export const fetchArtistById = async (id: string): Promise<Artist | null> => {
  // Giả lập delay của API call
  await new Promise((resolve) => setTimeout(resolve, 500))
  const artist = getArtistById(id)
  return artist || null
}

// API để tìm kiếm nghệ sĩ theo tên
export const searchArtists = async (query: string): Promise<Artist[]> => {
  // Giả lập delay của API call
  await new Promise((resolve) => setTimeout(resolve, 300))
  return searchArtistsByName(query)
}

// API để lấy nghệ sĩ liên quan
export const fetchRelatedArtists = async (artistId: string): Promise<Artist[]> => {
  // Giả lập delay của API call
  await new Promise((resolve) => setTimeout(resolve, 500))
  return getRelatedArtists(artistId)
}
