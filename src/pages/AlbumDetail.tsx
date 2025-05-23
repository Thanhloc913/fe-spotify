import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Album, Track } from "../types";
import { getAlbumById } from "../api/albums";
import { Link } from "react-router-dom";
import { usePlayerStore } from "../store/playerStore";
import { FaPlayCircle, FaCheckCircle, FaEllipsisH } from "react-icons/fa";
import Modal from "@mui/material/Modal";
import Checkbox from "@mui/material/Checkbox";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import {
  getSongsByArtistId,
  removeSongFromAlbum,
  createOrUpdateAlbumSongs,
} from "../api/musicApi";

const formatDuration = (ms: number) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

// Hàm định dạng ngày phát hành đẹp hơn
const formatReleaseDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    // Nếu ngày không hợp lệ
    if (isNaN(date.getTime())) return dateString;

    // Format: DD tháng MM, YYYY
    return `${date.getDate()} tháng ${
      date.getMonth() + 1
    }, ${date.getFullYear()}`;
  } catch {
    return dateString;
  }
};

const AlbumDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [album, setAlbum] = useState<Album | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { playTrack, setCurrentTrack } = usePlayerStore();
  // State cho modal chọn bài hát
  const [openSongModal, setOpenSongModal] = useState(false);
  const [allArtistSongs, setAllArtistSongs] = useState<Track[]>([]);
  const [selectedSongIds, setSelectedSongIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionTrackId, setActionTrackId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlbumData = async () => {
      try {
        if (!id) return;
        const albumResponse = await getAlbumById(id);
        if (albumResponse.data) {
          const { album, tracks } = albumResponse.data;
          setAlbum(album);
          setTracks(tracks);
        } else {
          setAlbum(null);
          setTracks([]);
        }
      } catch (err) {
        setError("Failed to fetch album data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlbumData();
  }, [id]);

  // Khi mở modal, gọi API lấy toàn bộ bài hát của artist
  useEffect(() => {
    const fetchAllArtistSongs = async () => {
      if (openSongModal && album?.artistId) {
        try {
          const songs = await getSongsByArtistId(album.artistId);
          // Map ApiSongType -> Track (bổ sung các trường còn thiếu)
          const mappedSongs = songs.map((s) => ({
            ...s,
            durationMs: typeof s.duration === "number" ? s.duration * 1000 : 0,
            albumId: album.id,
            albumName: album.title,
            artistName: album.artistName,
            coverUrl: album.coverUrl,
            explicit: false,
            popularity: 0,
          }));
          setAllArtistSongs(mappedSongs);
          // Set các bài đã thuộc album được check sẵn
          const currentTrackIds = tracks.map((t) => t.id);
          setSelectedSongIds(currentTrackIds);
        } catch {
          setAllArtistSongs([]);
          setSelectedSongIds([]);
        }
      }
    };
    fetchAllArtistSongs();
  }, [
    openSongModal,
    album?.artistId,
    album?.artistName,
    album?.coverUrl,
    album?.id,
    album?.title,
    tracks,
  ]);

  const handlePlayAlbum = () => {
    if (tracks.length > 0) {
      const firstTrack = {
        ...tracks[0],
        // Đảm bảo player có đủ thông tin cần thiết
        backgroundUrl:
          tracks[0].backgroundUrl || tracks[0].coverUrl || album?.coverUrl,
        coverUrl:
          tracks[0].backgroundUrl || tracks[0].coverUrl || album?.coverUrl,
      };
      setCurrentTrack(firstTrack);
      playTrack();
    }
  };

  const handlePlayTrack = (track: Track) => {
    const enhancedTrack = {
      ...track,
      // Thêm thông tin để player có thể hiển thị đúng
      backgroundUrl: track.backgroundUrl || track.coverUrl || album?.coverUrl,
      coverUrl: track.backgroundUrl || track.coverUrl || album?.coverUrl,
    };

    setCurrentTrack(enhancedTrack);
    playTrack();
  };

  // Xử lý chọn bài hát
  const handleToggleSong = (songId: string) => {
    setSelectedSongIds((prev) =>
      prev.includes(songId)
        ? prev.filter((id) => id !== songId)
        : [...prev, songId]
    );
  };

  // Gọi API cập nhật album-song
  const handleSubmitSongsToAlbum = async () => {
    if (!album) return;
    setIsSubmitting(true);
    const result = await createOrUpdateAlbumSongs(album.id, selectedSongIds);
    if (result.success) {
      alert("Cập nhật danh sách bài hát thành công!");
      setOpenSongModal(false);
      // Có thể reload lại album/tracks nếu muốn
    } else {
      alert("Lỗi: " + (result.error || "Không rõ nguyên nhân"));
    }
    setIsSubmitting(false);
  };

  // Xử lý xóa bài hát khỏi album
  const handleRemoveSongFromAlbum = async (songId: string) => {
    if (!album) return;
    if (!window.confirm("Bạn có chắc muốn xóa bài hát này khỏi album?")) return;
    const ok = await removeSongFromAlbum(album.id, songId);
    if (ok) {
      setTracks((prev) => prev.filter((t) => t.id !== songId));
      setAllArtistSongs((prev) =>
        prev.map((t) => (t.id === songId ? { ...t } : t))
      );
      setSelectedSongIds((prev) => prev.filter((id) => id !== songId));
      alert("Đã xóa bài hát khỏi album!");
    } else {
      alert("Xóa thất bại!");
    }
    setActionTrackId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-spotify-green"></div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }
  if (!album) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-white">Album not found</div>
      </div>
    );
  }

  // Tính tổng thời lượng album
  const totalDurationMs = tracks.reduce(
    (sum, t) => sum + (t.durationMs || 0),
    0
  );
  const totalDuration = formatDuration(totalDurationMs);

  return (
    <div className="bg-gradient-to-b from-green-400/80 to-[#181818] min-h-screen pb-32">
      {/* Header album */}
      <div className="flex items-end gap-8 px-8 pt-8 pb-6">
        <img
          src={album.coverUrl}
          alt={album.title}
          className="w-56 h-56 object-cover shadow-2xl rounded-lg border border-black/10"
        />
        <div className="flex flex-col gap-2">
          <span className="uppercase text-xs font-bold text-white/80">
            Album
          </span>
          <h1 className="text-6xl font-extrabold text-white leading-tight drop-shadow-lg">
            {album.title}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-white/70 text-sm">
              • {formatReleaseDate(album.releaseDate)} • {album.totalTracks} bài
              hát, khoảng {totalDuration}
            </span>
          </div>
        </div>
      </div>
      {/* Action buttons */}
      <div className="flex items-center gap-4 px-8 mt-4 mb-2">
        <button
          onClick={handlePlayAlbum}
          className="bg-spotify-green hover:bg-green-400 text-black rounded-full p-0.5 shadow-lg transition-transform scale-110"
        >
          <FaPlayCircle className="w-16 h-16" />
        </button>
        <button className="bg-white/10 hover:bg-white/20 text-spotify-green rounded-full p-3">
          <FaCheckCircle className="w-7 h-7" />
        </button>
        <button
          className="bg-white/10 hover:bg-white/20 text-white rounded-full p-3"
          onClick={() => setOpenSongModal(true)}
        >
          <FaEllipsisH className="w-7 h-7" />
        </button>
      </div>
      {/* Song list table */}
      <div className="bg-black/30 rounded-lg mx-8 mt-6 p-4">
        <table className="w-full text-left">
          <thead>
            <tr className="text-white/70 text-sm border-b border-white/10">
              <th className="py-2 px-2 font-normal">#</th>
              <th className="py-2 px-2 font-normal">Tiêu đề</th>
              <th className="py-2 px-2 font-normal">Album</th>
              <th className="py-2 px-2 font-normal text-right">Duration</th>
              <th className="py-2 px-2 font-normal text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {tracks.map((track, idx) => (
              <tr
                key={track.id}
                className="hover:bg-white/5 group transition cursor-pointer"
                onClick={() => {
                  handlePlayTrack(track);
                }}
              >
                <td className="py-2 px-2 text-white/70 w-8">{idx + 1}</td>
                <td className="py-2 px-2 flex items-center gap-3">
                  <img
                    src={
                      track.backgroundUrl || track.coverUrl || album.coverUrl
                    }
                    alt={track.title}
                    className="w-10 h-10 rounded shadow"
                  />
                  <div>
                    <div className="text-white font-medium cursor-default">
                      {track.title}
                    </div>
                    <div className="text-white/60 text-xs">
                      <Link
                        to={`/artist/${track.artistId || album.artistId}`}
                        className="hover:underline text-white/80"
                      >
                        {track.artistName || album.artistName}
                      </Link>
                    </div>
                  </div>
                </td>
                <td className="py-2 px-2 text-white/60">{album.title}</td>
                <td className="py-2 px-2 text-white/60 text-right">
                  {formatDuration(track.durationMs || 0)}
                </td>
                <td
                  className="py-2 px-2 text-white/60 text-right relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="p-2 hover:bg-gray-700 rounded-full"
                    onClick={() =>
                      setActionTrackId(
                        actionTrackId === track.id ? null : track.id
                      )
                    }
                  >
                    <FaEllipsisH />
                  </button>
                  {actionTrackId === track.id && (
                    <div className="absolute right-0 top-10 bg-gray-900 border border-gray-700 rounded shadow-lg z-50 min-w-[120px]">
                      <button
                        className="block w-full text-left px-4 py-2 hover:bg-gray-700 text-red-400"
                        onClick={() => handleRemoveSongFromAlbum(track.id)}
                      >
                        Xóa khỏi album
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Modal chọn bài hát cho album */}
      <Modal open={openSongModal} onClose={() => setOpenSongModal(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            minWidth: 400,
            maxHeight: "80vh",
            overflowY: "auto",
            borderRadius: 2,
          }}
        >
          <h2 className="text-xl font-bold mb-4">Chọn bài hát cho album</h2>
          <div className="mb-4 max-h-64 overflow-y-auto">
            {allArtistSongs.length === 0 && <div>Không có bài hát nào.</div>}
            {allArtistSongs.map((song) => (
              <div key={song.id} className="flex items-center gap-2 mb-2">
                <Checkbox
                  checked={selectedSongIds.includes(song.id)}
                  onChange={() => handleToggleSong(song.id)}
                  color="primary"
                />
                <span>{song.title}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              onClick={() => setOpenSongModal(false)}
              disabled={isSubmitting}
            >
              Huỷ
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmitSongsToAlbum}
              disabled={isSubmitting || selectedSongIds.length === 0}
            >
              {isSubmitting ? "Đang cập nhật..." : "Cập nhật album"}
            </Button>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default AlbumDetail;
