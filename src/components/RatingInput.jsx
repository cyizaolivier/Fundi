// Interactive 1-5 star picker used on the "rate this fundi" review form.
export default function RatingInput({ value, onChange }) {
  return (
    <div className="rating-input" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          type="button"
          key={n}
          role="radio"
          aria-checked={value === n}
          className={n <= value ? 'on' : undefined}
          onClick={() => onChange(n)}
        >
          &#9733;
        </button>
      ))}
    </div>
  );
}
