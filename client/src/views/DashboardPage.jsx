import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCollections } from "../features/collection/collectionSlice";
import { fetchRecentReviews } from "../features/review/reviewSlice";
import MediaCard from "../components/MediaCard";

export default function DashboardPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { items: collections } = useSelector((s) => s.collection);
  const { reviews } = useSelector((s) => s.review);
  const [selectedReview, setSelectedReview] = useState(null);

  useEffect(() => {
    dispatch(fetchCollections());
    dispatch(fetchRecentReviews());
  }, [dispatch]);

  const ongoing = collections.filter((c) => c.status === "ongoing");
  const recentlyAdded = [...collections]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);

  const stats = {
    anime: collections.filter((c) => c.mediaType === "anime").length,
    manga: collections.filter((c) => c.mediaType === "manga").length,
    game: collections.filter((c) => c.mediaType === "game").length,
    reviews: reviews.length,
  };

  return (
    <div className="p-6 max-w-6xl mx-auto text-white">
      {/* Greeting */}
      <section className="mb-8">
        <h1 className="text-3xl font-bold">
          Halo, {user?.username || "Questivator"} 👋
        </h1>
        <p className="text-gray-400 mt-1">
          Ini ringkasan aktivitasmu hari ini.
        </p>
      </section>

      {/* Stats Row */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Anime", count: stats.anime, icon: "🎌" },
          { label: "Manga", count: stats.manga, icon: "📖" },
          { label: "Game", count: stats.game, icon: "🎮" },
          { label: "Reviews", count: stats.reviews, icon: "✍️" },
        ].map(({ label, count, icon }) => (
          <div
            key={label}
            className="bg-gray-800 rounded-xl p-4 flex items-center gap-3"
          >
            <span className="text-2xl">{icon}</span>
            <div>
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-gray-400 text-sm">{label}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Continue — Ongoing */}
      {ongoing.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Continue — Ongoing</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {ongoing.slice(0, 6).map((item) => (
              <MediaCard
                key={item.id}
                title={item.title}
                coverUrl={item.coverUrl}
                mediaType={item.mediaType}
                status={item.status}
                score={item.score}
                isFavorite={item.isFavorite}
              />
            ))}
          </div>
        </section>
      )}

      {/* Recently Added */}
      {recentlyAdded.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Recently Added</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {recentlyAdded.map((item) => (
              <MediaCard
                key={item.id}
                title={item.title}
                coverUrl={item.coverUrl}
                mediaType={item.mediaType}
                status={item.status}
                score={item.score}
                isFavorite={item.isFavorite}
              />
            ))}
          </div>
        </section>
      )}

      {/* Recent Reviews Carousel */}
      {reviews.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Recent Reviews</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {reviews.map((review) => (
              <div
                key={review.id}
                onClick={() => setSelectedReview(review)}
                className="min-w-[220px] bg-gray-800 rounded-xl p-4 cursor-pointer hover:bg-gray-700 transition"
              >
                <p className="font-semibold truncate">
                  {review.collection?.title || "Unknown"}
                </p>
                <p className="text-yellow-400 text-sm mt-1">
                  ⭐ {review.score}/10
                </p>
                <p className="text-gray-400 text-xs mt-2 line-clamp-3">
                  {review.content}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA Discover */}
      <section className="bg-indigo-700 rounded-2xl p-6 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">Got nothing to watch?</h3>
          <p className="text-indigo-200 mt-1 text-sm">
            Find new stuff to add to your collection!
          </p>
        </div>
        <a
          href="/search"
          className="bg-white text-indigo-700 font-semibold px-5 py-2 rounded-xl hover:bg-indigo-50 transition"
        >
          Find now
        </a>
      </section>

      {/* Review Modal */}
      {selectedReview && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setSelectedReview(null)}
        >
          <div
            className="bg-gray-900 rounded-2xl p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-1">
              {selectedReview.collection?.title}
            </h3>
            <p className="text-yellow-400 mb-3">⭐ {selectedReview.score}/10</p>
            <p className="text-gray-300 text-sm">{selectedReview.content}</p>
            <button
              onClick={() => setSelectedReview(null)}
              className="mt-4 text-gray-500 hover:text-white text-sm"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
