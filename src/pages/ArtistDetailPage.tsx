"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { fetchArtistById, fetchRelatedArtists } from "../api/artistApi"
import ArtistDetail from "../components/detail/ArtistsDetail"
import type { Artist } from "../types"

const ArtistDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [artist, setArtist] = useState<Artist | null>(null)
  const [relatedArtists, setRelatedArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch nghệ sĩ và nghệ sĩ liên quan khi component mount hoặc id thay đổi
  useEffect(() => {
    const loadArtist = async () => {
      if (!id) return

      try {
        setLoading(true)
        const artistData = await fetchArtistById(id)

        if (artistData) {
          setArtist(artistData)
          // Fetch nghệ sĩ liên quan
          const related = await fetchRelatedArtists(id)
          setRelatedArtists(related)
        } else {
          setError("Không tìm thấy nghệ sĩ")
        }
      } catch (err) {
        setError("Có lỗi xảy ra khi tải thông tin nghệ sĩ")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadArtist()
  }, [id])

  // Xử lý khi click vào nghệ sĩ liên quan
  const handleRelatedArtistClick = async (artistId: string) => {
    try {
      setLoading(true)
      const artistData = await fetchArtistById(artistId)

      if (artistData) {
        setArtist(artistData)
        // Fetch nghệ sĩ liên quan mới
        const related = await fetchRelatedArtists(artistId)
        setRelatedArtists(related)

        // Cập nhật URL mà không reload trang
        window.history.pushState({}, "", `/artist/${artistId}`)
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi tải thông tin nghệ sĩ")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Xử lý khi click vào nút quay lại
  const handleBackClick = () => {
    // Quay lại trang trước đó
    window.history.back()
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="text-white">Đang tải...</div>
      </div>
    )
  }

  if (error || !artist) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="text-red-500">{error || "Không tìm thấy nghệ sĩ"}</div>
      </div>
    )
  }

  return (
    <ArtistDetail
      artist={artist}
      relatedArtists={relatedArtists}
      onRelatedArtistClick={handleRelatedArtistClick}
      onBackClick={handleBackClick}
    />
  )
}

export default ArtistDetailPage
