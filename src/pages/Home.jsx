import { Link } from 'react-router-dom';
import { useAuthUser } from '../hooks/useAuthUser';

const Home = () => {
  const { authUser } = useAuthUser();

  return (
    <div className="min-h-screen -mt-20">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=2574&auto=format&fit=crop')`,
            }}
          />
          <div className="absolute inset-0 bg-zinc-950/85"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 py-32 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-800/80 backdrop-blur-sm border border-zinc-700 mb-8">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span className="text-sm text-zinc-300">Designed for flexible work</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Where Talent Meets
            <br />
            <span className="text-white">
              Opportunity
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-zinc-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            GigFlow connects skilled freelancers with exciting projects. Post gigs, place bids, 
            and build your portfolio in a streamlined marketplace designed for growth.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/gigs/new"
              className="px-8 py-4 bg-white text-zinc-950 rounded-full font-semibold text-lg transition-all hover:bg-zinc-100"
            >
              Post a Gig
            </Link>
            <Link
              to="/gigs"
              className="px-8 py-4 bg-transparent border-2 border-zinc-600 text-white rounded-full font-semibold text-lg hover:bg-zinc-800/30 hover:border-zinc-500 transition-all"
            >
              Browse Gigs
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-24 grid grid-cols-2 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center p-6 bg-zinc-900/40 backdrop-blur-sm rounded-2xl border border-zinc-800">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">500+</div>
              <div className="text-sm text-zinc-400">Active Gigs</div>
            </div>
            <div className="text-center p-6 bg-zinc-900/40 backdrop-blur-sm rounded-2xl border border-zinc-800">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">1,200+</div>
              <div className="text-sm text-zinc-400">Freelancers</div>
            </div>
            <div className="text-center p-6 bg-zinc-900/40 backdrop-blur-sm rounded-2xl border border-zinc-800 col-span-2 md:col-span-1">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">98%</div>
              <div className="text-sm text-zinc-400">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-24 px-4 bg-zinc-950">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
              Getting started with GigFlow is simple. Follow these steps to start working or hiring.
            </p>
          </div>

          {/* Steps Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8 hover:border-zinc-700 transition-all">
              <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Create Your Profile</h3>
              <p className="text-zinc-400 leading-relaxed">
                Sign up and set up your profile in minutes. Showcase your skills, experience, and portfolio.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8 hover:border-zinc-700 transition-all">
              <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Browse or Post Gigs</h3>
              <p className="text-zinc-400 leading-relaxed">
                Find exciting projects that match your skills or post your own gig to find the perfect freelancer.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8 hover:border-zinc-700 transition-all">
              <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Collaborate & Earn</h3>
              <p className="text-zinc-400 leading-relaxed">
                Place bids, get hired, and work on projects. Build your reputation and grow your business.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
