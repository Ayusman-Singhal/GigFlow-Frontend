import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApiClient } from '../hooks/useApiClient';

const Dashboard = () => {
  const { client, isLoaded } = useApiClient();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [gigs, setGigs] = useState([]);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Determine active tab based on URL
  const activeTab = location.pathname === '/dashboard/bids' ? 'bids' : 'gigs';

  useEffect(() => {
    if (!client) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (activeTab === 'gigs') {
          // Fetch user's posted gigs
          const response = await client.get('/api/gigs/my');
          const data = response?.data;
          const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
          setGigs(list);
        } else {
          // Fetch user's bids
          const response = await client.get('/api/bids/my');
          const data = response?.data;
          const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
          setBids(list);
        }
      } catch (err) {
        const message = err?.response?.data?.message || 'Failed to load data';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [client, activeTab]);

  if (!isLoaded || !client) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-sm font-medium text-zinc-400">Preparing...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-800/60 backdrop-blur-sm border border-zinc-700/50 mb-2">
          <svg className="w-4 h-4 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-sm text-zinc-300">Your Dashboard</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white">My Activity</h1>
        <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
          Manage your posted gigs and track your submitted proposals all in one place.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-center gap-2 bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-2 max-w-md mx-auto">
        <Link
          to="/dashboard"
          className={`flex-1 px-6 py-3 text-sm font-semibold rounded-xl transition-all ${
            activeTab === 'gigs'
              ? 'bg-white text-zinc-950'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
          }`}
        >
          Your Gigs
        </Link>
        <Link
          to="/dashboard/bids"
          className={`flex-1 px-6 py-3 text-sm font-semibold rounded-xl transition-all ${
            activeTab === 'bids'
              ? 'bg-white text-zinc-950'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
          }`}
        >
          Your Bids
        </Link>
      </div>

      {/* Content */}
      {loading && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-8 text-center">
          <div className="inline-flex items-center gap-3 text-zinc-300">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Loading {activeTab === 'gigs' ? 'gigs' : 'bids'}...</span>
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

      {/* Your Gigs Content */}
      {!loading && !error && activeTab === 'gigs' && (
        <div className="space-y-6">
          {gigs.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-12 text-center space-y-4">
              <svg className="w-16 h-16 text-zinc-600 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-white">No gigs posted yet</p>
                <p className="text-sm text-zinc-400">Start by creating your first gig and attract talented freelancers</p>
              </div>
              <Link
                to="/gigs/new"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-zinc-950 rounded-xl font-semibold hover:bg-zinc-100 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Post Your First Gig
              </Link>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-zinc-400">
                  {gigs.length} {gigs.length === 1 ? 'gig' : 'gigs'} posted
                </p>
                <Link
                  to="/gigs/new"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-white text-zinc-950 rounded-lg font-semibold hover:bg-zinc-100 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Gig
                </Link>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {gigs.map((gig) => {
                  const id = gig._id || gig.id;
                  const statusColors = {
                    open: 'bg-emerald-900/30 text-emerald-300 border-emerald-800',
                    assigned: 'bg-amber-900/30 text-amber-300 border-amber-800',
                    closed: 'bg-rose-900/30 text-rose-300 border-rose-800',
                  };
                  
                  return (
                    <div
                      key={id}
                      className="rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-6 shadow-lg hover:border-zinc-700 transition-all cursor-pointer"
                      onClick={() => navigate(`/gigs/${id}`)}
                    >
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <h3 className="text-lg font-semibold text-white flex-1">{gig.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase border ${statusColors[gig.status] || 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
                          {gig.status || 'open'}
                        </span>
                      </div>
                      
                      <p className="text-sm text-zinc-400 line-clamp-2 mb-4">{gig.description}</p>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                        <div className="space-y-1">
                          <div className="text-xs text-zinc-500">Budget</div>
                          <div className="text-lg font-bold text-white">${gig.budget?.toLocaleString()}</div>
                        </div>
                        {gig.bidCount !== undefined && (
                          <div className="text-right space-y-1">
                            <div className="text-xs text-zinc-500">Proposals</div>
                            <div className="text-lg font-bold text-white">{gig.bidCount || 0}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Your Bids Content */}
      {!loading && !error && activeTab === 'bids' && (
        <div className="space-y-6">
          {bids.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-12 text-center space-y-4">
              <svg className="w-16 h-16 text-zinc-600 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-white">No bids submitted yet</p>
                <p className="text-sm text-zinc-400">Browse available gigs and submit your first proposal</p>
              </div>
              <Link
                to="/gigs"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-zinc-950 rounded-xl font-semibold hover:bg-zinc-100 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Browse Gigs
              </Link>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-zinc-400">
                  {bids.length} {bids.length === 1 ? 'proposal' : 'proposals'} submitted
                </p>
              </div>
              <div className="space-y-4">
                {bids.map((bid) => {
                  const gigId = bid.gig?._id || bid.gig?.id || bid.gigId;
                  const gigTitle = bid.gig?.title || 'Untitled Gig';
                  const statusColors = {
                    pending: 'bg-zinc-800 text-zinc-400 border-zinc-700',
                    hired: 'bg-emerald-900/30 text-emerald-300 border-emerald-800',
                    rejected: 'bg-rose-900/30 text-rose-300 border-rose-800',
                  };
                  
                  return (
                    <div
                      key={bid.id || bid._id}
                      className="rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-6 shadow-lg hover:border-zinc-700 transition-all cursor-pointer"
                      onClick={() => gigId && navigate(`/gigs/${gigId}`)}
                    >
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-1">{gigTitle}</h3>
                          <div className="flex items-center gap-2 text-xs text-zinc-500">
                            <span>Budget: ${bid.gig?.budget?.toLocaleString() || 'N/A'}</span>
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <div className="text-xl font-bold text-white">${bid.price?.toLocaleString()}</div>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase border ${statusColors[bid.status] || statusColors.pending}`}>
                            {bid.status || 'pending'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="bg-zinc-800/30 border border-zinc-800 rounded-xl p-4">
                        <p className="text-sm text-zinc-300 line-clamp-3">{bid.message}</p>
                      </div>
                      
                      {bid.status === 'hired' && (
                        <div className="mt-4 p-3 rounded-lg bg-emerald-900/20 border border-emerald-800/50 flex items-center gap-2">
                          <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm font-semibold text-emerald-300">Congratulations! You've been hired for this project</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
