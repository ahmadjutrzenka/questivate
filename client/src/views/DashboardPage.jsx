import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router";
import { fetchCollections } from "../features/collection/collectionSlice";
import { fetchRecentReviews } from "../features/review/reviewSlice";
import MediaCard from "../components/MediaCard";
import ReviewCarousel from "../components/ReviewCarousel.jsx";
import fabIcon from "../assets/loonaColors.svg";

function getTopGenres(items, n = 3) {
  const count = {};
  items.forEach((c) => {
    (c.genres || []).forEach((g) => {
      count[g] = (count[g] || 0) + 1;
    });
  });
  const total = items.length || 1;
  return Object.entries(count)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([genre, cnt]) => ({ genre, pct: Math.round((cnt / total) * 100) }));
}

function getAvgRatings(items) {
  const avg = (arr) => {
    const scored = arr.filter((c) => c.score != null);
    if (!scored.length) return null;
    return (scored.reduce((s, c) => s + c.score, 0) / scored.length).toFixed(1);
  };
  return {
    overall: avg(items),
    anime: avg(items.filter((c) => c.mediaType === "anime")),
    manga: avg(items.filter((c) => c.mediaType === "manga")),
    game: avg(items.filter((c) => c.mediaType === "game")),
  };
}

function GenreBar({ genre, pct }) {
  return (
    <div className="dash-genre-row">
      <div className="dash-genre-label">
        <span className="dash-genre-name">{genre}</span>
        <span className="dash-genre-pct">{pct}%</span>
      </div>
      <div className="dash-genre-track">
        <div className="dash-genre-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function RatingBar({ label, value, color }) {
  if (value == null) return null;
  const pct = (value / 10) * 100;
  return (
    <div className="dash-rating-row">
      <div className="dash-rating-header">
        <span className="dash-rating-label">{label}</span>
        <span className="dash-rating-value">{value}</span>
      </div>
      <div className="dash-rating-track">
        <div
          className="dash-rating-fill"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { items } = useSelector((s) => s.collection);
  const { reviews } = useSelector((s) => s.review);
  const [fabOpen, setFabOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchCollections());
    dispatch(fetchRecentReviews());
  }, [dispatch]);

  const ongoing = items.filter((c) => c.status === "ongoing");
  const recent = [...items]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);

  const stats = {
    anime: items.filter((c) => c.mediaType === "anime").length,
    manga: items.filter((c) => c.mediaType === "manga").length,
    game: items.filter((c) => c.mediaType === "game").length,
    reviews: items.filter((c) => c.Review != null).length,
  };

  const topGenres = getTopGenres(items);
  const avgRatings = getAvgRatings(items);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const initials = user?.username?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="dashboard">
      {/* ── New Hero ── */}
      <section className="dash-hero">
        {/* Left */}
        <div className="dash-hero-left">
          <div className="dash-hero-title">
            <p className="greeting">
              {greeting}, {user?.username}
            </p>
            <h1>Have you passed the vibe check yet?</h1>
          </div>

          <div className="dash-hero-body">
            {/* Avatar */}
            <div className="dash-avatar-wrap">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="dash-avatar"
                />
              ) : (
                <div className="dash-avatar-placeholder">{initials}</div>
              )}
            </div>

            {/* DNA + stats */}
            <div className="dash-hero-mid">
              <div className="dash-stats-row">
                <div className="dash-stat">
                  <span className="dash-stat-num">{stats.anime}</span>
                  <span className="dash-stat-label anime-label">Anime</span>
                </div>
                <div className="dash-stat">
                  <span className="dash-stat-num">{stats.manga}</span>
                  <span className="dash-stat-label manga-label">Manga</span>
                </div>
                <div className="dash-stat">
                  <span className="dash-stat-num">{stats.game}</span>
                  <span className="dash-stat-label game-label">Game</span>
                </div>
                <div className="dash-stat">
                  <span className="dash-stat-num">{stats.reviews}</span>
                  <span className="dash-stat-label reviews-label">Reviews</span>
                </div>
              </div>
              {user?.TasteDNA ? (
                <p className="dna-excerpt">"{user.TasteDNA.content}"</p>
              ) : (
                <p className="dna-excerpt-empty">
                  No Taste DNA yet. You can generate it by editing your profile.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right — metric cards */}
        <div className="dash-hero-right">
          {/* Top Genres */}
          <div className="dash-metric-card">
            <h3 className="dash-metric-title">Top Genre Insights</h3>
            {topGenres.length === 0 ? (
              <p className="dash-metric-empty">
                Add titles to see genre insights
              </p>
            ) : (
              topGenres.map((g) => <GenreBar key={g.genre} {...g} />)
            )}
          </div>

          {/* Average Ratings */}
          <div className="dash-metric-card">
            <h3 className="dash-metric-title">Average Ratings</h3>
            {avgRatings.overall == null ? (
              <p className="dash-metric-empty">No ratings yet</p>
            ) : (
              <>
                <RatingBar
                  label="Overall"
                  value={avgRatings.overall}
                  color="#ef4444"
                />
                <RatingBar
                  label="Anime"
                  value={avgRatings.anime}
                  color="var(--anime)"
                />
                <RatingBar
                  label="Manga"
                  value={avgRatings.manga}
                  color="var(--manga)"
                />
                <RatingBar
                  label="Game"
                  value={avgRatings.game}
                  color="var(--game)"
                />
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Continue ── */}
      {ongoing.length > 0 && (
        <section className="section">
          <div className="section-header">
            <h2>Continue</h2>
          </div>
          <div className="card-grid">
            {ongoing.slice(0, 4).map((c) => (
              <MediaCard
                key={c.id}
                id={c.id}
                title={c.title}
                coverUrl={c.coverUrl}
                mediaType={c.mediaType}
                status={c.status}
                score={c.score}
                isFavorite={c.isFavorite}
                externalId={c.externalId}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Discover CTA ── */}
      <section className="discover-ctas desktop-only">
        <Link to="/vibe-check" className="cta-card">
          <h3>Vibe Check</h3>
          <p>Pick titles, AI finds what to watch, read, or play next.</p>
        </Link>
        <Link to="/collections?mode=title-match" className="cta-card">
          <h3>Title Match</h3>
          <p>Choose one title, find its counterparts across all three media.</p>
        </Link>
      </section>

      <div className={`fab-wrapper ${fabOpen ? "active" : ""}`}>
        <div className="fab-items">
          <Link
            to="/vibe-check"
            className="fab-item"
            onClick={() => setFabOpen(false)}
          >
            Vibe Check
          </Link>
          <Link
            to="/collections?mode=title-match"
            className="fab-item"
            onClick={() => setFabOpen(false)}
          >
            Title Match
          </Link>
        </div>
        <button className="fab-main-btn" onClick={() => setFabOpen(!fabOpen)}>
          <img src={fabIcon} alt="Menu" className="fab-icon" />{" "}
        </button>
      </div>

      {/* ── Recently added ── */}
      <section className="section">
        <div className="section-header">
          <h2>Recently added</h2>
          <Link to="/collections">See all</Link>
        </div>
        <div className="card-grid">
          {recent.map((c) => (
            <MediaCard
              key={c.id}
              id={c.id}
              title={c.title}
              coverUrl={c.coverUrl}
              mediaType={c.mediaType}
              status={c.status}
              score={c.score}
              isFavorite={c.isFavorite}
              externalId={c.externalId}
            />
          ))}
        </div>
      </section>

      {/* ── Recent reviews ── */}
      <section className="section" style={{ overflow: "visible" }}>
        <h2>Recent reviews</h2>
        <ReviewCarousel reviews={reviews} />
      </section>
    </div>
  );
}
