// Read-only display: "\u2605 4.8 (12 reviews)". Renders nothing meaningful
// if there's no rating yet (a brand-new fundi with zero reviews).
export default function StarRating({ rating, count, labelReview, labelReviews }) {
  if (!rating) return null;
  return (
    <span className="stars" aria-label={`${rating} out of 5 stars`}>
      <span className="stars-icon" aria-hidden="true">&#9733;</span> {rating}
      {typeof count === 'number' && count > 0 && (
        <span className="stars-count"> ({count} {count === 1 ? labelReview : labelReviews})</span>
      )}
    </span>
  );
}
