export default function Header({ user, onLogout, botStatus }) {
  const handleLogout = async () => {
    try {
      await onLogout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="w-full h-16 flex items-center justify-between px-6 bg-[#1F2634] border-b border-[#2C3446]">
      <h1 className="text-xl font-semibold text-white">Futures Bot Dashboard</h1>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-sm">
          <span
            className={`inline-block w-2 h-2 rounded-full ${
              botStatus?.health === "running" ? "bg-green-400" : "bg-yellow-400"
            }`}
          />
          <span className="text-[#8A93A6]">
            {botStatus?.health === "running" ? "Bağlı" : "Bağlantı kontrol ediliyor..."}
          </span>
        </div>
        <span className="text-sm text-[#8A93A6]">
          Hoş geldin, {user?.username || "Kullanıcı"}
        </span>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
        >
          Çıkış Yap
        </button>
      </div>
    </header>
  );
}

