const BASE_URL = "http://localhost:5000";

class ApiClient {
  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${BASE_URL}${endpoint}`;

    const config: RequestInit = {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData?.message) {
            errorMessage = errorData.message;
          }
        } catch {
          // ignore
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Auth endpoints
  async login(credentials: { username: string; password: string }) {
    return this.request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async logout() {
    return this.request("/api/auth/logout", {
      method: "POST",
    });
  }

  async getCurrentUser() {
    return this.request("/api/auth/me");
  }

  // Bot endpoints
  async getBotStatus() {
    return this.request("/api/status");
  }

  async getOpenPositions() {
    return this.request("/api/open-positions");
  }

  async getPnlSummary() {
    return this.request("/api/pnl/summary");
  }

  async getLogs() {
    return this.request("/api/logs");
  }

  async closePosition(state_key: string) {
    return this.request("/api/position/close", {
      method: "POST",
      body: JSON.stringify({ state_key }),
    });
  }

  async getHealthStatus() {
    return this.request("/api/health");
  }
}

export const apiClient = new ApiClient();
export default apiClient;

