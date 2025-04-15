import type { Artist } from "../../types/index"

// Dữ liệu nghệ sĩ Việt Nam
export const vietnameseArtists: Artist[] = [
  {
    id: "HoaMinzy",
    name: "Hòa Minzy",
    imageUrl:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/placeholder-ob7miW3mUreePYfXdVwkpFWHthzoR5.svg?height=300&width=300",
    bio: "Hòa Minzy (tên thật: Nguyễn Thị Hòa) là một ca sĩ, diễn viên người Việt Nam. Cô nổi tiếng sau khi đoạt giải quán quân cuộc thi Học viện Ngôi sao năm 2014. Hòa Minzy được biết đến với giọng hát nội lực và khả năng trình diễn sân khấu ấn tượng.",
    genres: ["V-Pop", "Ballad", "Pop"],
    monthlyListeners: 2500000,
    albums: ["album-hoaminzy-01", "album-hoaminzy-02"],
    singles: ["single-hoaminzy-01", "single-hoaminzy-02", "single-hoaminzy-03"],
    topTracks: [
      "Bắc Bling",
      "Bật Tình Yêu Lên",
      "Không Thể Cùng Nhau Suốt Kiếp",
      "Kén Cá Chọn Canh",
      "Rời Bỏ",
    ],
    related: ["artist-sontungmtp-01", "artist-hieuth2-01", "artist-mytan-01", "artist-ducphuc-01"],
  },
  {
    id: "HieuThu2",
    name: "Hiếu Thứ 2",
    imageUrl:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/placeholder-ob7miW3mUreePYfXdVwkpFWHthzoR5.svg?height=300&width=300",
    bio: "Hiếu Thứ 2 (tên thật: Nguyễn Minh Hiếu) là một rapper, nhạc sĩ người Việt Nam. Anh được biết đến rộng rãi sau khi tham gia chương trình Rap Việt mùa 2. Hiếu Thứ 2 nổi bật với phong cách âm nhạc độc đáo, kết hợp giữa rap và R&B.",
    genres: ["Hip-hop", "R&B", "Rap Việt"],
    monthlyListeners: 1800000,
    albums: ["album-hieuth2-01"],
    singles: ["single-hieuth2-01", "single-hieuth2-02", "single-hieuth2-03", "single-hieuth2-04"],
    topTracks: ["track-hieuth2-01", "track-hieuth2-02", "track-hieuth2-03", "track-hieuth2-04", "track-hieuth2-05"],
    related: ["artist-hoaminzy-01", "artist-sontungmtp-01", "artist-denluong-01", "artist-binz-01"],
  },
  {
    id: "SonTungMTP",
    name: "Sơn Tùng M-TP",
    imageUrl:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/placeholder-ob7miW3mUreePYfXdVwkpFWHthzoR5.svg?height=300&width=300",
    bio: "Sơn Tùng M-TP (tên thật: Nguyễn Thanh Tùng) là một ca sĩ, nhạc sĩ, nhà sản xuất âm nhạc người Việt Nam. Anh được mệnh danh là 'Hoàng tử V-Pop' với nhiều bản hit đình đám và phong cách âm nhạc hiện đại, kết hợp nhiều yếu tố quốc tế. Sơn Tùng cũng là người sáng lập công ty giải trí M-TP Entertainment.",
    genres: ["V-Pop", "Electronic", "R&B", "Hip-hop"],
    monthlyListeners: 5000000,
    albums: ["album-sontungmtp-01", "album-sontungmtp-02", "album-sontungmtp-03"],
    singles: [
      "single-sontungmtp-01",
      "single-sontungmtp-02",
      "single-sontungmtp-03",
      "single-sontungmtp-04",
      "single-sontungmtp-05",
    ],
    topTracks: [
      "track-sontungmtp-01",
      "track-sontungmtp-02",
      "track-sontungmtp-03",
      "track-sontungmtp-04",
      "track-sontungmtp-05",
    ],
    related: ["artist-hoaminzy-01", "artist-hieuth2-01", "artist-jack-01", "artist-binz-01"],
  },
]

// Hàm lấy tất cả nghệ sĩ
export const getAllArtists = (): Artist[] => {
  return vietnameseArtists
}

// Hàm lấy nghệ sĩ theo ID
export const getArtistById = (id: string): Artist | undefined => {
  return vietnameseArtists.find((artist) => artist.id === id)
}

// Hàm tìm kiếm nghệ sĩ theo tên
export const searchArtistsByName = (query: string): Artist[] => {
  const lowercaseQuery = query.toLowerCase()
  return vietnameseArtists.filter((artist) => artist.name.toLowerCase().includes(lowercaseQuery))
}

// Hàm lấy nghệ sĩ liên quan
export const getRelatedArtists = (artistId: string): Artist[] => {
  const artist = getArtistById(artistId)
  if (!artist) return []

  return artist.related
    .map((relatedId) => getArtistById(relatedId))
    .filter((artist): artist is Artist => artist !== undefined)
}

// Export mặc định
export default vietnameseArtists
