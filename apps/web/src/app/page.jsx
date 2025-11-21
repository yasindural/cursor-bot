import React, { useEffect, useState } from "react";
import apiClient from "@/utils/apiClient";
import Header from "@/components/Header";
import StatsCards from "@/components/StatsCards";
import PositionsTable from "@/components/PositionsTable";
import Loader from "@/components/Loader";

function LoginPage({ onLogin, loading }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await onLogin({ username, password });
    } catch (err) {
      setError(err.message || "Giriş başarısız");
    }
  };

  const handleDemoClick = () => {
    setUsername("admin");
    setPassword("YeniSifre123");
  };

  return (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-[#111827] border border-[#1F2937] rounded-2xl p-8 shadow-xl">
        <h1 className="text-2xl font-semibold text-white mb-2">Futures Bot Dashboard</h1>
        <p className="text-sm text-[#9CA3AF] mb-6">
          Lütfen panele giriş yapmak için kullanıcı bilgilerinizi girin.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/40 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[#E5E7EB] mb-1.5">
              Kullanıcı Adı
            </label>
            <input
              type="text"
              className="w-full bg-[#020617] border border-[#1F2937] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#F2C64B] focus:border-transparent"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#E5E7EB] mb-1.5">
              Şifre
            </label>
            <input
              type="password"
              className="w-full bg-[#020617] border border-[#1F2937] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#F2C64B] focus:border-transparent"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#F2C64B] text-black font-medium py-2 px-4 rounded-lg hover:bg-[#F2C64B]/90 focus:outline-none focus:ring-2 focus:ring-[#F2C64B] focus:ring-offset-2 focus:ring-offset-[#111827] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            onClick={handleDemoClick}
            className="text-[#9CA3AF] text-xs hover:text-[#F2C64B] transition-colors cursor-pointer"
          >
            Demo: admin / YeniSifre123 (Tıklayın)
          </button>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ user, dashboardData, positions, onLogout, onClosePosition, loading }) {
  return (
    <div className="min-h-screen bg-[#1F2634] text-white font-inter">
      <Header user={user} onLogout={onLogout} />

      <main className="p-6 space-y-6">
        <StatsCards dashboardData={dashboardData} />
        <PositionsTable
          positions={positions}
          onClosePosition={onClosePosition}
          loading={loading}
        />
      </main>
    </div>
  );
}

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [positions, setPositions] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const loadDashboard = async () => {
    try {
      const [statusRes, pnlRes, positionsRes] = await Promise.all([
        apiClient.getBotStatus().catch(() => null),
        apiClient.getPnlSummary().catch(() => null),
        apiClient.getOpenPositions().catch(() => null),
      ]);

      setDashboardData({
        status: statusRes
          ? {
              running: true,
              version: statusRes.bot_version,
            }
          : { running: false, version: "N/A" },
        pnl: pnlRes
          ? {
              daily: pnlRes.daily_realized_pnl,
              total: pnlRes.total_realized_pnl,
              roi: pnlRes.overall_roi,
            }
          : { daily: 0, total: 0, roi: 0 },
      });

      const list = positionsRes?.positions || [];
      setPositions(list);
    } catch (error) {
      console.error("Dashboard load error:", error);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await apiClient.getCurrentUser();
        if (res?.status === "ok") {
          setUser(res.user);
          await loadDashboard();
        }
      } catch {
        // login yoksa sessiz geç
      } finally {
        setInitialLoading(false);
      }
    };

    checkSession();
  }, []);

  const handleLogin = async ({ username, password }) => {
    setActionLoading(true);
    try {
      const res = await apiClient.login({ username, password });
      if (res?.status === "ok") {
        setUser(res.user);
        await loadDashboard();
      } else {
        throw new Error(res?.message || "Geçersiz yanıt");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = async () => {
    setActionLoading(true);
    try {
      await apiClient.logout();
      setUser(null);
      setDashboardData(null);
      setPositions([]);
    } finally {
      setActionLoading(false);
    }
  };

  const handleClosePosition = async (state_key) => {
    setActionLoading(true);
    try {
      await apiClient.closePosition(state_key);
      await loadDashboard();
    } finally {
      setActionLoading(false);
    }
  };

  if (initialLoading) {
    return <Loader message="Oturum kontrol ediliyor..." />;
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} loading={actionLoading} />;
  }

  return (
    <Dashboard
      user={user}
      dashboardData={dashboardData}
      positions={positions}
      onLogout={handleLogout}
      onClosePosition={handleClosePosition}
      loading={actionLoading}
    />
  );
}

