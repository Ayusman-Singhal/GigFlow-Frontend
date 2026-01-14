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

const GigCard = ({ title, description, budget, status, createdAt, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-300"
  >
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="text-lg font-semibold text-slate-900">{title}</div>
        <p className="mt-1 text-sm text-slate-600 line-clamp-2">{description || 'No description provided.'}</p>
      </div>
      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-700">
        {status || 'open'}
      </span>
    </div>
    <div className="mt-4 flex items-center justify-between text-sm text-slate-700">
      <span className="font-medium">{formatBudget(budget)}</span>
      <span className="text-slate-500">Posted {formatDate(createdAt)}</span>
    </div>
  </button>
);

export default GigCard;
