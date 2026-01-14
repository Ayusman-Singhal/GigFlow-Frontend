const base =
  'inline-flex items-center justify-center rounded-xl border text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 shadow-sm';

const variants = {
  primary: 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800 focus-visible:ring-slate-300',
  secondary: 'bg-white text-slate-900 border-slate-200 hover:bg-slate-50 focus-visible:ring-slate-200',
  ghost: 'bg-transparent text-slate-900 border-transparent hover:bg-slate-100 focus-visible:ring-slate-200',
};

const sizes = {
  md: 'px-4 py-2',
  sm: 'px-3 py-1.5 text-xs',
};

const Button = ({ as = 'button', variant = 'primary', size = 'md', className = '', ...props }) => {
  const Component = as;
  return (
    <Component
      className={`${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    />
  );
};

export default Button;
