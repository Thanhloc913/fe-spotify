import {
  getUser,
  getUsers,
  getProfile,
  getProfiles,
  getGenre,
  getGenres,
  getRole,
  getRoles,
} from "./faker";
import { TokenManager, ITokenManager } from "./tokenManager";

// Expose to global scope for debugging
declare global {
  interface Window {
    DEBUG: {
      TokenManager?: ITokenManager;
      Faker?: {
        getUser: () => object;
        getUsers: (count: number) => object[];
        getProfile: () => object;
        getProfiles: (count: number) => object[];
        getGenre: () => object;
        getGenres: (count: number) => object[];
        getRole: () => object;
        getRoles: (count: number) => object[];
      };
    };
  }
}

// Self-executing initialization
(function initTokenManager() {
  if (typeof window === "undefined") return;

  if (process.env.NODE_ENV === "development") {
    window.DEBUG = window.DEBUG || {};
    window.DEBUG.TokenManager = new TokenManager();
  }
})();

// Initialize Faker debug tools
(function initFakerDebug() {
  if (typeof window === "undefined") return;

  if (process.env.NODE_ENV === "development") {
    window.DEBUG = window.DEBUG || {};
    window.DEBUG.Faker = {
      getUser,
      getUsers,
      getProfile,
      getProfiles,
      getGenre,
      getGenres,
      getRole,
      getRoles,
    };
  }
})();
