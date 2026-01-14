import { SignUp } from '@clerk/clerk-react';

const Register = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <SignUp routing="path" path="/register" signInUrl="/login" />
    </div>
  </div>
);

export default Register;
