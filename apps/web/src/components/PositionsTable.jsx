export default function PositionsTable({ positions, onClosePosition, loading = false }) {
  const handleCloseClick = async (state_key) => {
    if (loading) return;

    try {
      await onClosePosition(state_key);
    } catch (error) {
      console.error("Position close failed:", error);
    }
  };

  const hasPositions = Array.isArray(positions) && positions.length > 0;

  return (
    <div className="bg-[#212938] border border-[#2C3446] rounded-lg overflow-x-auto">
      <div className="px-6 py-4 border-b border-[#2C3446]">
        <h3 className="text-lg font-semibold text-white">Açık Pozisyonlar</h3>
      </div>

      <table className="min-w-full text-sm">
        <thead className="bg-[#212938] text-[#8A93A6]">
          <tr>
            <th className="px-6 py-3 text-left font-medium">Sembol</th>
            <th className="px-6 py-3 text-left font-medium">Yön</th>
            <th className="px-6 py-3 text-left font-medium">Giriş</th>
            <th className="px-6 py-3 text-left font-medium">Adet</th>
            <th className="px-6 py-3 text-left font-medium">SL Fiyat</th>
            <th className="px-6 py-3 text-left font-medium">SL ROE</th>
            <th className="px-6 py-3 text-left font-medium">Peak ROE</th>
            <th className="px-6 py-3 text-left font-medium">Peak PnL</th>
            <th className="px-6 py-3 text-left font-medium">İşlem</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#2F374A]">
          {!hasPositions ? (
            <tr>
              <td colSpan={9} className="px-6 py-8 text-center text-[#8A93A6]">
                Açık pozisyon bulunamadı
              </td>
            </tr>
          ) : (
            positions.map((position, index) => (
              <tr
                key={position.state_key || position.symbol || index}
                className={index % 2 === 1 ? "bg-[#1C2330]" : ""}
              >
                <td className="px-6 py-3 font-medium text-white">{position.symbol}</td>
                <td className="px-6 py-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      position.position_side === "LONG"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {position.position_side}
                  </span>
                </td>
                <td className="px-6 py-3 text-white">
                  {position.entry !== undefined && position.entry !== null
                    ? `$${Number(position.entry).toFixed(4)}`
                    : "-"}
                </td>
                <td className="px-6 py-3 text-white">{position.qty}</td>
                <td className="px-6 py-3 text-white">{position.sl ? `$${position.sl}` : "-"}</td>
                <td className="px-6 py-3 text-red-400">{position.sl_roe ?? 0}%</td>
                <td className="px-6 py-3 text-green-400">{position.peak_roe ?? 0}%</td>
                <td className="px-6 py-3 text-green-400">${position.peak_pnl ?? 0}</td>
                <td className="px-6 py-3">
                  <button
                    onClick={() => handleCloseClick(position.state_key)}
                    disabled={loading}
                    className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Kapat
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

