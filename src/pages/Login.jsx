import { SignIn } from '@clerk/clerk-react';

const Login = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <SignIn routing="path" path="/login" signUpUrl="/register" />
    </div>
  </div>
);

export default Login;
