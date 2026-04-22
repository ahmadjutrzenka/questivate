export default function MediaCard({
  title,
  coverUrl,
  mediaType,
  status,
  score,
  isFavorite,
  onEdit,
  onRemove,
}) {
  const statusColor = {
    ongoing: "bg-yellow-500",
    completed: "bg-green-500",
    planned: "bg-blue-500",
    dropped: "bg-red-500",
  };

  return (
    <div className="relative rounded-xl overflow-hidden shadow-md bg-gray-800 hover:scale-105 transition-transform">
      {isFavorite && (
        <span className="absolute top-2 right-2 text-yellow-400 text-lg">
          ★
        </span>
      )}
      <img
        src={coverUrl || "https://placehold.co/150x220?text=No+Cover"}
        alt={title}
        className="w-full h-48 object-cover"
      />
      <div className="p-3">
        <p className="text-white font-semibold text-sm truncate">{title}</p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-gray-400 text-xs capitalize">{mediaType}</span>
          {score && <span className="text-yellow-400 text-xs">⭐ {score}</span>}
        </div>
        {status && (
          <span
            className={`mt-2 inline-block text-xs text-white px-2 py-0.5 rounded-full capitalize ${statusColor[status] || "bg-gray-600"}`}
          >
            {status}
          </span>
        )}
        <div className="flex gap-2 mt-3">
          {onEdit && (
            <button
              onClick={onEdit}
              className="flex-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white py-1 rounded"
            >
              Edit
            </button>
          )}
          {onRemove && (
            <button
              onClick={onRemove}
              className="flex-1 text-xs bg-red-600 hover:bg-red-700 text-white py-1 rounded"
            >
              Hapus
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
