import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import { useApiClient } from '../hooks/useApiClient';

const GigCreate = () => {
  const { client, isLoaded } = useApiClient();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!title.trim()) return 'Title is required';
    if (!description.trim()) return 'Description is required';
    if (budget === '' || Number.isNaN(Number(budget))) return 'Budget is required';
    if (Number(budget) <= 0) return 'Budget must be positive';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!client) return;

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        budget: Number(budget),
      };
      const response = await client.post('/api/gigs', payload);
      const data = response?.data;
      const gig = data?.data || data;
      const id = gig?._id || gig?.id;
      if (!id) throw new Error('Missing gig id from response');
      navigate(`/gigs/${id}`);
    } catch (err) {
      const message = err?.response?.data?.message || err.message || 'Failed to create gig';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || !client) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <p className="text-sm font-medium text-slate-600">Preparing client...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-slate-50">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-800/60 backdrop-blur-sm border border-zinc-700/50 mb-2">
          <svg className="w-4 h-4 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-sm text-zinc-300">Post a New Opportunity</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white">Create Your Gig</h1>
        <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
          Describe your project and connect with talented freelancers ready to bring your vision to life.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-8 shadow-lg">
            {/* Title */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-white flex items-center gap-2" htmlFor="title">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                Gig Title
              </label>
              <Input
                id="title"
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Build a Modern Landing Page with React"
                disabled={loading}
                required
                className="border-zinc-700 bg-zinc-800/50 text-white placeholder:text-zinc-500 focus:border-zinc-600 focus:ring-zinc-600 text-lg py-3"
              />
              <p className="text-xs text-zinc-500">Make it clear and specific to attract the right talent</p>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-white flex items-center gap-2" htmlFor="description">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                Project Description
              </label>
              <Textarea
                id="description"
                name="description"
                rows={8}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your project in detail...&#10;&#10;• What needs to be done?&#10;• What are the key requirements?&#10;• What skills are needed?&#10;• Any specific deadlines or milestones?"
                disabled={loading}
                required
                className="border-zinc-700 bg-zinc-800/50 text-white placeholder:text-zinc-500 focus:border-zinc-600 focus:ring-zinc-600"
              />
              <p className="text-xs text-zinc-500">The more details you provide, the better proposals you'll receive</p>
            </div>

            {/* Budget */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-white flex items-center gap-2" htmlFor="budget">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                Budget (USD)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-lg font-semibold">$</span>
                <Input
                  id="budget"
                  name="budget"
                  type="number"
                  min="1"
                  step="1"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="500"
                  disabled={loading}
                  required
                  className="border-zinc-700 bg-zinc-800/50 text-white placeholder:text-zinc-500 focus:border-zinc-600 focus:ring-zinc-600 text-lg py-3 pl-8"
                />
              </div>
              <p className="text-xs text-zinc-500">Set a competitive budget to attract quality freelancers</p>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-800 bg-rose-900/30 px-4 py-3 text-sm text-rose-200 flex items-start gap-3">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div className="pt-4 flex gap-4">
              <Button 
                type="submit" 
                disabled={loading}
                className="flex-1 bg-white text-zinc-950 hover:bg-zinc-100 py-3 text-base font-semibold"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating Your Gig...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Publish Gig
                  </span>
                )}
              </Button>
              <button
                type="button"
                onClick={() => navigate('/gigs')}
                className="px-6 py-3 border-2 border-zinc-700 text-white rounded-lg hover:bg-zinc-800/50 transition-all font-semibold"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Tips Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Tips Card */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-6 space-y-4 sticky top-24">
            <div className="flex items-center gap-2 text-white font-semibold">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Tips for Success
            </div>
            
            <div className="space-y-4 text-sm text-zinc-400">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-bold">1</div>
                <p><span className="text-white font-medium">Be Specific:</span> Clear requirements attract better proposals</p>
              </div>
              
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-bold">2</div>
                <p><span className="text-white font-medium">Set Fair Budget:</span> Competitive rates get quality work</p>
              </div>
              
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-bold">3</div>
                <p><span className="text-white font-medium">Add Context:</span> Share relevant files or links when needed</p>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-bold">4</div>
                <p><span className="text-white font-medium">Be Responsive:</span> Quick replies lead to faster starts</p>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800">
              <div className="flex items-start gap-3 text-xs text-zinc-500">
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>Your gig will be visible to all freelancers immediately after posting</p>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-6 space-y-4">
            <div className="text-white font-semibold">Platform Stats</div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">Avg. Response Time</span>
                <span className="text-white font-semibold">2 hours</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">Success Rate</span>
                <span className="text-white font-semibold">98%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">Active Freelancers</span>
                <span className="text-white font-semibold">1,200+</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GigCreate;
