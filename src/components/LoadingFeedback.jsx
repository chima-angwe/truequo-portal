export function Spinner({ label = 'Loading', size = 'sm', className = '' }) {
  const dimensions = size === 'lg' ? 'h-6 w-6 border-[3px]' : size === 'md' ? 'h-4 w-4 border-2' : 'h-3.5 w-3.5 border-2';
  return (
    <span className={`inline-flex items-center gap-2 ${className}`} role="status" aria-live="polite">
      <span className={`loading-spinner ${dimensions}`} aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}

function SkeletonLine({ width = 'w-full', height = 'h-3' }) {
  return <span aria-hidden="true" className={`loading-skeleton block rounded-md ${width} ${height}`} />;
}

export function PageSkeleton({ variant = 'detail', title = 'Loading page' }) {
  return (
    <div className="loading-page" role="status" aria-label={title} aria-busy="true">
      <span className="sr-only">{title}</span>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div className="w-full max-w-md space-y-3">
          <SkeletonLine width="w-24" height="h-2.5" />
          <SkeletonLine width="w-2/3" height="h-7" />
          <SkeletonLine width="w-full" height="h-3" />
        </div>
        {variant === 'dashboard' && <SkeletonLine width="w-32" height="h-10" />}
      </div>

      {variant === 'dashboard' && (
        <>
          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => <div key={i} className="loading-card space-y-3"><SkeletonLine width="w-24" height="h-2.5" /><SkeletonLine width="w-16" height="h-8" /><SkeletonLine width="w-28" height="h-2.5" /></div>)}
          </div>
          <div className="loading-card mb-6 space-y-4"><SkeletonLine width="w-36" /><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{Array.from({ length: 4 }, (_, i) => <SkeletonLine key={i} height="h-10" />)}</div></div>
          <TableSkeleton rows={4} columns={4} />
        </>
      )}

      {variant === 'list' && (
        <>
          <div className="mb-4 flex flex-wrap gap-2">{Array.from({ length: 5 }, (_, i) => <SkeletonLine key={i} width="w-20" height="h-8" />)}</div>
          <TableSkeleton rows={6} columns={5} />
        </>
      )}

      {variant === 'cards' && <div className="space-y-3">{Array.from({ length: 4 }, (_, i) => <div key={i} className="loading-card space-y-3"><SkeletonLine width="w-1/3" height="h-4" /><SkeletonLine width="w-2/3" /><SkeletonLine width="w-1/2" /></div>)}</div>}

      {variant === 'detail' && <div className="space-y-4"><div className="loading-card space-y-4"><SkeletonLine width="w-1/3" height="h-5" /><SkeletonLine width="w-full" /><SkeletonLine width="w-4/5" /></div><div className="loading-card space-y-3"><SkeletonLine width="w-1/4" /><SkeletonLine width="w-full" height="h-24" /></div></div>}

      {variant === 'form' && <div className="loading-card space-y-5">{Array.from({ length: 5 }, (_, i) => <div key={i} className="space-y-2"><SkeletonLine width="w-24" height="h-2.5" /><SkeletonLine height="h-10" /></div>)}</div>}
    </div>
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className="loading-table" aria-hidden="true">
      <div className="grid gap-4 border-b border-stone-100 px-4 py-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {Array.from({ length: columns }, (_, i) => <SkeletonLine key={i} width="w-2/3" height="h-2.5" />)}
      </div>
      {Array.from({ length: rows }, (_, row) => (
        <div key={row} className="grid gap-4 border-b border-stone-50 px-4 py-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {Array.from({ length: columns }, (_, column) => <SkeletonLine key={column} width={column === 0 ? 'w-3/4' : 'w-full'} height="h-3" />)}
        </div>
      ))}
    </div>
  );
}
