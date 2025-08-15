"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { getArtists, getArtistById } from "../api/artists";
import ArtistCard from "../components/cards/ArtistCard";
import ArtistDetail from "../components/detail/ArtistsDetail";
import type { Artist } from "../types";

const ArtistPage: React.FC = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [relatedArtists, setRelatedArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tất cả nghệ sĩ khi component mount
  useEffect(() => {
    const loadArtists = async () => {
      try {
        setLoading(true);
        const data = await getArtists();
        setArtists(data.data);
        setError(null);
      } catch (err) {
        setError("Có lỗi xảy ra khi tải dữ liệu nghệ sĩ");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadArtists();
  }, []);

  // Xử lý khi click vào nghệ sĩ
  const handleArtistClick = async (id: string) => {
    try {
      setLoading(true);
      const artistRes = await getArtistById(id);
      if (artistRes && artistRes.data) {
        setSelectedArtist(artistRes.data.artist);
        // Fetch nghệ sĩ liên quan
        setRelatedArtists(artistRes.data.relatedArtists || []);
      }
      setError(null);
    } catch (err) {
      setError("Có lỗi xảy ra khi tải thông tin nghệ sĩ");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý khi click vào nút quay lại
  const handleBackClick = () => {
    setSelectedArtist(null);
    setRelatedArtists([]);
  };

  if (loading && artists.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <div>Đang tải...</div>
      </div>
    );
  }

  if (error && artists.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          color: "red",
        }}
      >
        <div>{error}</div>
      </div>
    );
  }

  return (
    <div
      className="artist-page"
      style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}
    >
      {selectedArtist ? (
        <ArtistDetail
          artist={selectedArtist}
          relatedArtists={relatedArtists}
          onRelatedArtistClick={handleArtistClick}
          onBackClick={handleBackClick}
        />
      ) : (
        <>
          <h1 style={{ fontSize: "28px", marginBottom: "20px" }}>
            Nghệ sĩ Việt Nam
          </h1>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "20px",
              justifyContent: "center",
            }}
          >
            {artists.map((artist) => (
              <ArtistCard
                key={artist.id}
                artist={artist}
                onClick={handleArtistClick}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ArtistPage;
