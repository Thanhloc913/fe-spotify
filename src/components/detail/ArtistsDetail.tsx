"use client";

import type React from "react";
import type { Artist } from "../../types/index";

interface ArtistDetailProps {
  artist: Artist;
  relatedArtists: Artist[];
  onRelatedArtistClick: (id: string) => void;
  onBackClick: () => void;
}

const ArtistDetail: React.FC<ArtistDetailProps> = ({
  artist,
  relatedArtists,
  onRelatedArtistClick,
  onBackClick,
}) => {
  return (
    <div className="artist-detail p-6 text-white">
      <button
        onClick={onBackClick}
        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white border-none rounded cursor-pointer mb-6 transition-colors"
      >
        ← Quay lại
      </button>

      <div className="flex flex-col md:flex-row gap-6 mb-10">
        <img
          src={artist.avatarUrl || "/placeholder.svg"}
          alt={artist.name}
          className="w-full md:w-48 h-48 object-cover rounded-lg"
        />
        <div>
          <h1 className="text-3xl font-bold mb-2">{artist.name}</h1>
          <p className="mb-3 text-gray-400">
            {artist.monthlyListeners.toLocaleString()} người nghe hàng tháng
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {artist.genres.map((genre, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-800 rounded-full text-sm"
              >
                {genre}
              </span>
            ))}
          </div>
          <p className="leading-relaxed text-gray-300">{artist.bio}</p>
        </div>
      </div>

      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-4">Bài hát nổi bật</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {artist.topTracks.map((track, index) => (
            <div
              key={index}
              className="flex items-center p-3 bg-gray-800 rounded hover:bg-gray-700 transition-colors"
            >
              <div className="w-8 text-center text-gray-400 mr-3">
                {index + 1}
              </div>
              <div>
                <div className="font-medium">
                  Track {track.split("-").pop()}
                </div>
                <div className="text-sm text-gray-400">{artist.name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {relatedArtists.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Nghệ sĩ liên quan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedArtists.map((relatedArtist) => (
              <div
                key={relatedArtist.id}
                onClick={() => onRelatedArtistClick(relatedArtist.id)}
                className="flex items-center gap-3 p-3 bg-gray-800 rounded hover:bg-gray-700 cursor-pointer transition-colors"
              >
                <img
                  src={relatedArtist.avatarUrl || "/placeholder.svg"}
                  alt={relatedArtist.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-medium">{relatedArtist.name}</div>
                  <div className="text-sm text-gray-400">
                    {relatedArtist.monthlyListeners.toLocaleString()} người nghe
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtistDetail;
