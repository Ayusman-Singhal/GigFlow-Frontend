import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApiClient } from '../hooks/useApiClient';
import GigCard from '../components/domain/GigCard';

const GigFeed = () => {
  const navigate = useNavigate();
  const { client, isLoaded } = useApiClient();

  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const query = useMemo(() => {
    const params = {};
    if (search.trim()) params.search = search.trim();
    return params;
  }, [search]);

  useEffect(() => {
    if (!client) return;

    let active = true;
    const fetchGigs = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await client.get('/api/gigs', { params: query });
        if (!active) return;
        const data = response?.data;
        const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
        setGigs(list);
      } catch (err) {
        if (!active) return;
        const message = err?.response?.data?.message || 'Failed to load gigs';
        setError(message);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchGigs();

    return () => {
      active = false;
    };
  }, [client, query]);

  if (!isLoaded || !client) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-sm font-medium text-slate-600">Preparing client...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-800/60 backdrop-blur-sm border border-zinc-700/50 mb-2">
          <svg className="w-4 h-4 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span className="text-sm text-zinc-300">Explore Opportunities</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white">Browse Gigs</h1>
        <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
          Discover exciting projects that match your skills and start building your portfolio today.
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-4">
        <div className="flex-1 relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search gigs by title..."
            className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 pl-12 pr-4 py-3 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-zinc-600 focus:ring-2 focus:ring-zinc-600/50"
          />
        </div>
        <Link
          to="/gigs/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-zinc-950 px-6 py-3 text-sm font-semibold shadow-sm transition hover:bg-zinc-100"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Post a Gig
        </Link>
      </div>

      {loading && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-8 text-center">
          <div className="inline-flex items-center gap-3 text-zinc-300">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Loading gigs...</span>
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-rose-800 bg-rose-900/30 p-6 text-center">
          <div className="flex items-center justify-center gap-3 text-rose-200">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      {!loading && !error && gigs.length === 0 && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-12 text-center space-y-4">
          <svg className="w-16 h-16 text-zinc-600 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-white">No gigs found</p>
            <p className="text-sm text-zinc-400">Try adjusting your search or check back later for new opportunities</p>
          </div>
        </div>
      )}

      {!loading && !error && gigs.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-zinc-400">
              {gigs.length} {gigs.length === 1 ? 'gig' : 'gigs'} available
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {gigs.map((gig) => {
              const id = gig._id || gig.id;
              const owner = gig.owner || {};
              const ownerName = owner.name || owner.email || 'Anonymous';
              const ownerInitial = ownerName.charAt(0).toUpperCase();
              
              return (
                <GigCard
                  key={id}
                  title={gig.title}
                  description={gig.description}
                  budget={gig.budget}
                  status={gig.status}
                  createdAt={gig.createdAt}
                  ownerName={ownerName}
                  ownerInitial={ownerInitial}
                  onClick={() => navigate(`/gigs/${id}`)}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default GigFeed;
