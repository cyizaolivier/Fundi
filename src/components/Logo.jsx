// The uploaded "FUNdi" wordmark (olive green, cream "UN", house-and-wrench
// icon worked into the "d") replaces the old hand-drawn two-stroke mark.
// It already contains the brand name as part of the artwork, so callers no
// longer need to render a separate text label next to it.
export default function Logo({ className = 'logo-mark' }) {
  return (
    <img
      src="brand/fundi-logo.png"
      alt="Fundi"
      className={className}
    />
  );
}
