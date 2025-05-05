import { TokenManager, ITokenManager } from "./tokenManager";

// Expose to global scope for debugging
declare global {
  interface Window {
    DEBUG: {
      TokenManager?: ITokenManager;
    };
  }
}

// Self-executing initialization
(function initTokenManager() {
  if (typeof window === "undefined") return;

  if (process.env.NODE_ENV === "development") {
    window.DEBUG = window.DEBUG || {};
    window.DEBUG.TokenManager = new TokenManager();
    console.debug(
      "[TokenManager] Debug tools available at window.DEBUG.TokenManager"
    );
  }
})();
