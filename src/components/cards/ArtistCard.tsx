"use client"

import type React from "react"
import type { Artist } from "../../types/index"

interface ArtistCardProps {
  artist: Artist
  onClick: (id: string) => void
}

const ArtistCard: React.FC<ArtistCardProps> = ({ artist, onClick }) => {
  return (
    <div
      className="artist-card"
      onClick={() => onClick(artist.id)}
      style={{
        width: "200px",
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        cursor: "pointer",
        transition: "transform 0.3s ease",
        margin: "10px",
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = "translateY(-5px)"
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = "translateY(0)"
      }}
    >
      <div style={{ position: "relative", paddingBottom: "100%" }}>
        <img
          src={artist.imageUrl || "/placeholder.svg"}
          alt={artist.name}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>
      <div style={{ padding: "12px" }}>
        <h3 style={{ margin: "0 0 5px 0", fontSize: "16px", fontWeight: "bold" }}>{artist.name}</h3>
        <p style={{ margin: "0", fontSize: "14px", color: "#666" }}>
          {artist.monthlyListeners.toLocaleString()} người nghe hàng tháng
        </p>
      </div>
    </div>
  )
}

export default ArtistCard
