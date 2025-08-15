import { ApiResponse } from "../types/api";
import type { ApiSongType } from "../types/api/song";

interface Artist {
  id: string;
  name: string;
  songs: ApiSongType[];
}

export const getArtist = async (id: string): Promise<Artist | null> => {
  try {
    const response = await fetch(`/api/artists/${id}`);
    const data: ApiResponse<Artist> = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching artist:", error);
    return null;
  }
};
