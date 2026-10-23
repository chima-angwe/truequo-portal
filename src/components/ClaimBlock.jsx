// Shows what was claimed for a task (employer, address, etc.) so nobody has to guess
// what is being verified. Address claims get an "Open in Google Maps" link.

export function mapsUrl(address) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

export default function ClaimBlock({ task, title = 'Claimed', compact = false }) {
  const rows = (task.claim || []).filter((c) => c.value && c.value.trim());
  if (rows.length === 0) {
    return (
      <div className="text-xs bg-stone-50 text-stone-500 rounded-lg p-2.5 mb-2">
        No claim details were entered for this check.
      </div>
    );
  }
  const addressRow = task.type === 'address' ? rows.find((r) => /address/i.test(r.label)) : null;

  return (
    <div className={`claim-block bg-amber-50 border border-amber-200 rounded-xl ${compact ? 'p-3' : 'p-4'} mb-3`}>
      <div className="claim-title text-xs font-medium text-amber-700 mb-2">{title}</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
        {rows.map((c, i) => (
          <div key={i} className="text-sm">
            <span className="text-stone-500">{c.label}: </span>
            <span className="text-stone-800 font-medium">{c.value}</span>
          </div>
        ))}
      </div>
      {addressRow && (
        <a
          href={mapsUrl(addressRow.value)} target="_blank" rel="noopener noreferrer"
          className="inline-block mt-2.5 text-xs text-gold hover:underline"
        >
          Open in Google Maps ↗
        </a>
      )}
    </div>
  );
}
