const Textarea = ({ className = '', ...props }) => (
  <textarea
    className={`w-full rounded-xl border border-slate-200/60 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 ${className}`}
    {...props}
  />
);

export default Textarea;
