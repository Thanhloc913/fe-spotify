import { createContext, useContext, useState, useEffect } from "react";
import { Artist } from "../types";
import { getProfile } from "../api/profileApi";

interface UserContextType {
  artist: Artist | null;
  setArtist: (artist: Artist | null) => void;
  fetchProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [artist, setArtist] = useState<Artist | null>(null);

  const fetchProfile = async () => {
    try {
      const data = await getProfile();
      if (data.success) setArtist(data.data);
    } catch (err) {
      setArtist(null);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line
  }, []);

  return (
    <UserContext.Provider value={{ artist, setArtist, fetchProfile }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
};
