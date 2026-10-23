export function BrandMark({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 300 200" role="img" aria-label="TrueQuo">
      <circle cx="130" cy="115" r="76" fill="none" stroke="#506BFF" strokeWidth="19" strokeLinecap="round" strokeDasharray="350 127" transform="rotate(26 130 115)" />
      <circle cx="161" cy="108" r="27" fill="#00BE70" />
      <path d="m202 140 41 41" fill="none" stroke="#00BE70" strokeWidth="20" strokeLinecap="round" />
    </svg>
  );
}

export default function BrandWordmark({ className = '' }) {
  return (
    <span className={`brand-wordmark ${className}`}>
      <BrandMark className="brand-wordmark-mark" />
      <span><span className="brand-blue">T</span>rue<span className="brand-green">Q</span>uo</span>
    </span>
  );
}
