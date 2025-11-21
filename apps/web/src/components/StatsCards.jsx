export default function StatsCards({ dashboardData }) {
  const { status, pnl } = dashboardData || {};

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return "0.00";
    return Math.abs(value).toFixed(2);
  };

  const formatPercentage = (value) => {
    if (value === null || value === undefined) return "0.00";
    return Math.abs(value).toFixed(2);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Bot Status Card */}
      <div className="bg-[#212938] border border-[#2C3446] rounded-lg p-4">
        <h3 className="text-sm font-medium text-[#8A93A6] mb-2">Bot Durumu</h3>
        <div className="text-lg font-semibold text-white">
          <span
            className={`inline-block w-3 h-3 rounded-full mr-2 ${
              status?.running ? "bg-green-500" : "bg-red-500"
            }`}
          />
          {status?.running ? "Aktif" : "Durdu"}
        </div>
        <p className="text-xs text-[#8A93A6] mt-1">v{status?.version || "1.0.0"}</p>
      </div>

      {/* Daily PnL Card */}
      <div className="bg-[#212938] border border-[#2C3446] rounded-lg p-4">
        <h3 className="text-sm font-medium text-[#8A93A6] mb-2">Günlük Realized PnL</h3>
        <div
          className={`text-lg font-semibold ${
            (pnl?.daily || 0) >= 0 ? "text-green-400" : "text-red-400"
          }`}
        >
          {(pnl?.daily || 0) >= 0 ? "+" : "-"}${formatCurrency(pnl?.daily)}
        </div>
      </div>

      {/* Total PnL Card */}
      <div className="bg-[#212938] border border-[#2C3446] rounded-lg p-4">
        <h3 className="text-sm font-medium text-[#8A93A6] mb-2">Toplam Realized PnL</h3>
        <div
          className={`text-lg font-semibold ${
            (pnl?.total || 0) >= 0 ? "text-green-400" : "text-red-400"
          }`}
        >
          {(pnl?.total || 0) >= 0 ? "+" : "-"}${formatCurrency(pnl?.total)}
        </div>
      </div>

      {/* ROI Card */}
      <div className="bg-[#212938] border border-[#2C3446] rounded-lg p-4">
        <h3 className="text-sm font-medium text-[#8A93A6] mb-2">Genel ROI</h3>
        <div
          className={`text-lg font-semibold ${
            (pnl?.roi || 0) >= 0 ? "text-green-400" : "text-red-400"
          }`}
        >
          {(pnl?.roi || 0) >= 0 ? "+" : ""}
          {formatPercentage(pnl?.roi)}%
        </div>
      </div>
    </div>
  );
}

