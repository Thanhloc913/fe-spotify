type TokenValue = string | null;

interface ITokenManager {
  setToken: (token?: string) => void;
  getToken: () => TokenValue;
  removeToken: () => void;
  hasToken: () => boolean;
}

class TokenManager implements ITokenManager {
  private static DEFAULT_TOKEN = "token_user1";
  private tokenKey = "access_token";

  setToken(token: string = TokenManager.DEFAULT_TOKEN): void {
    localStorage.setItem(this.tokenKey, token);
    this.debugLog(`Token set: ${token}`);
  }

  getToken(): TokenValue {
    const token = localStorage.getItem(this.tokenKey);
    this.debugLog(`Current token: ${token}`);
    return token;
  }

  removeToken(): void {
    localStorage.removeItem(this.tokenKey);
    this.debugLog("Token removed");
  }

  hasToken(): boolean {
    return localStorage.getItem(this.tokenKey) !== null;
  }

  private debugLog(message: string): void {
    if (process.env.NODE_ENV === "development") {
      console.debug(`[TokenManager] ${message}`);
    }
  }
}

export { TokenManager, type ITokenManager };
