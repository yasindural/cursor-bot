export default function Loader({ message = "Yükleniyor..." }) {
  return (
    <div className="min-h-screen bg-[#1F2634] flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#F2C64B] mb-4" />
        <div className="text-white text-lg">{message}</div>
      </div>
    </div>
  );
}

