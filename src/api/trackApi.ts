// 📁 src/api/trackApi.ts
import { faker } from '@faker-js/faker';
import type { Track, Album } from '../types';
import { randomNumber } from '../lib/mocks/utils';

export const generateTracks = (albums: Album[]): Track[] => {
  if (!albums.length) return [];

  const tracks: Track[] = [];

  const fixedTracks = [
    {
      title: 'Hành Trình Mặt Trăng',
      previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    },
    {
      title: 'Nhớ Em Dưới Cơn Mưa',
      previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    },
    {
      title: 'Chạm Vào Giấc Mơ',
      previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    },
  ];

  for (const album of albums) {
    const albumTracks: Track[] = fixedTracks.map((fixed, i) => {
      const track: Track = {
        id: faker.string.uuid(),
        title: fixed.title,
        artistId: album.artistId,
        artistName: album.artistName,
        albumId: album.id,
        albumName: album.title,
        coverUrl: album.coverUrl,
        previewUrl: fixed.previewUrl,
        durationMs: 372000,
        explicit: faker.datatype.boolean(0.2),
        popularity: randomNumber(0, 100),
        trackNumber: i + 1,
        isPlayable: faker.datatype.boolean(0.9),
      };
      return track;
    });

    album.tracks = albumTracks.map(track => track.id);
    tracks.push(...albumTracks);
  }

  return tracks;
};
