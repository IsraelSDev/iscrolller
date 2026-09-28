const HEIGHTS = [320, 220, 280, 360, 240, 300, 260, 340, 200, 310, 270, 230];

export default function Loading() {
  return (
    <main className="feed-container" aria-busy="true" aria-label="Loading">
      <div className="skeleton-grid">
        {HEIGHTS.map((h, i) => (
          <div key={i} className="skeleton" style={{ height: h }} />
        ))}
      </div>
    </main>
  );
}
