const formatBudget = (budget) => {
  if (budget === null || budget === undefined) return 'Budget not specified';
  if (typeof budget === 'number') return `$${budget.toLocaleString()}`;
  return String(budget);
};

const formatDate = (value) => {
  if (!value) return 'Unknown date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown date';
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const GigCard = ({ title, description, budget, status, createdAt, ownerName, ownerInitial, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-6 text-left shadow-lg transition hover:border-zinc-700 hover:bg-zinc-900/70 focus:outline-none focus:ring-2 focus:ring-zinc-600 group"
  >
    {/* Header with Status Badge */}
    <div className="flex items-start justify-between gap-3 mb-4">
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-white group-hover:text-zinc-100 transition-colors line-clamp-1">
          {title}
        </h3>
      </div>
      <span className="rounded-full bg-zinc-800 border border-zinc-700 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-zinc-300">
        {status || 'open'}
      </span>
    </div>

    {/* Description */}
    <p className="text-sm text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
      {description || 'No description provided.'}
    </p>

    {/* Footer with Budget, Owner, and Date */}
    <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
      <div className="flex items-center gap-3">
        {/* Owner Avatar */}
        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
          <span className="text-xs font-semibold text-zinc-300">
            {ownerInitial || '?'}
          </span>
        </div>
        <div className="text-xs text-zinc-500">
          {ownerName || 'Anonymous'}
        </div>
      </div>
      
      <div className="text-right space-y-1">
        <div className="text-sm font-semibold text-white">
          {formatBudget(budget)}
        </div>
        <div className="text-xs text-zinc-500">
          {formatDate(createdAt)}
        </div>
      </div>
    </div>
  </button>
);

export default GigCard;
