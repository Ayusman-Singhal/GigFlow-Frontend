import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import { useApiClient } from '../hooks/useApiClient';
import { useAuthUser } from '../hooks/useAuthUser';

const statusColors = {
  open: 'bg-emerald-100/10 text-emerald-100 border-emerald-200/30',
  assigned: 'bg-amber-100/10 text-amber-100 border-amber-200/30',
  closed: 'bg-rose-100/10 text-rose-100 border-rose-200/30',
};

const GigDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { client, isLoaded: apiLoaded } = useApiClient();
  const { authUser } = useAuthUser();

  const [gig, setGig] = useState(null);
  const [gigLoading, setGigLoading] = useState(false);
  const [gigError, setGigError] = useState(null);

  const [bids, setBids] = useState([]);
  const [bidsLoading, setBidsLoading] = useState(false);
  const [bidsError, setBidsError] = useState(null);
  const [isOwner, setIsOwner] = useState(false);

  const [message, setMessage] = useState('');
  const [price, setPrice] = useState('');
  const [bidError, setBidError] = useState(null);
  const [bidLoading, setBidLoading] = useState(false);
  const [userBid, setUserBid] = useState(null);
  const [userBidLoading, setUserBidLoading] = useState(false);

  const isAssigned = gig?.status === 'assigned';
  const isClosed = gig?.status === 'closed';
  const canBid = gig?.status === 'open';
  const isHired = userBid?.status === 'hired';

  const loadGig = async () => {
    if (!client || !id) return;
    setGigLoading(true);
    setGigError(null);
    try {
      const response = await client.get(`/api/gigs/${id}`);
      const data = response?.data;
      const detail = data?.data || data;
      setGig(detail);
      // Backend calculates isOwner using MongoDB IDs
      const userIsOwner = detail?.isOwner === true;
      setIsOwner(userIsOwner);
      
      // Only load bids if user is the owner
      if (userIsOwner) {
        loadBids();
      } else {
        // If not owner, load user's own bid
        loadMyBid();
      }
    } catch (err) {
      const messageText = err?.response?.data?.error || err?.response?.data?.message || 'Failed to load gig';
      setGigError(messageText);
    } finally {
      setGigLoading(false);
    }
  };

  const loadBids = async () => {
    if (!client || !id) return;
    setBidsLoading(true);
    setBidsError(null);
    try {
      const response = await client.get(`/api/bids/${id}`);
      const data = response?.data;
      const list = data?.data || data || [];
      setBids(Array.isArray(list) ? list : []);
    } catch (err) {
      const messageText = err?.response?.data?.error || err?.response?.data?.message || 'Failed to load bids';
      setBidsError(messageText);
    } finally {
      setBidsLoading(false);
    }
  };

  const loadMyBid = async () => {
    if (!client || !id || !authUser) return;
    setUserBidLoading(true);
    try {
      const response = await client.get(`/api/bids/my/${id}`);
      const data = response?.data?.data;
      setUserBid(data);
      // Pre-fill the form with existing bid
      if (data) {
        setMessage(data.message || '');
        setPrice(data.price?.toString() || '');
      }
    } catch (err) {
      // 404 means no bid yet, which is fine
      if (err?.response?.status !== 404) {
        console.error('Error loading user bid:', err);
      }
    } finally {
      setUserBidLoading(false);
    }
  };

  useEffect(() => {
    loadGig();
  }, [client, id, authUser]);

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    if (!client || !id) return;

    if (!message.trim()) {
      setBidError('Message is required');
      return;
    }
    if (message.trim().length < 10) {
      setBidError('Message must be at least 10 characters');
      return;
    }
    if (price === '' || Number.isNaN(Number(price))) {
      setBidError('Price is required');
      return;
    }
    if (Number(price) <= 0) {
      setBidError('Price must be positive');
      return;
    }

    setBidLoading(true);
    setBidError(null);
    try {
      const payload = {
        message: message.trim(),
        price: Number(price),
      };

      if (userBid) {
        // Update existing bid
        await client.put(`/api/bids/${userBid.id}`, payload);
      } else {
        // Create new bid
        await client.post('/api/bids', {
          gigId: id,
          ...payload,
        });
      }

      // Reload user's bid to get updated data
      await loadMyBid();
      // Reload gig to update highest bidder
      await loadGig();
    } catch (err) {
      const messageText = err?.response?.data?.error || err?.response?.data?.message || 'Failed to submit bid';
      setBidError(messageText);
    } finally {
      setBidLoading(false);
    }
  };

  const handleSelectBid = async (bidId) => {
    if (!client) return;
    if (!confirm('Are you sure you want to select this freelancer? This will close the gig and reject all other bids.')) {
      return;
    }
    try {
      const response = await client.patch(`/api/bids/${bidId}/hire`);
      const payload = response?.data?.data;
      if (payload?.gig) {
        setGig((prev) => ({ ...(prev || {}), ...payload.gig }));
      }
      // Update bids locally
      setBids((prev) =>
        prev.map((bid) => {
          if (bid.id === bidId || bid._id === bidId) {
            return { ...bid, status: 'hired' };
          }
          if (bid.status === 'pending') {
            return { ...bid, status: 'rejected' };
          }
          return bid;
        })
      );
    } catch (err) {
      const messageText = err?.response?.data?.error || err?.response?.data?.message || 'Failed to hire freelancer';
      setBidsError(messageText);
    }
  };

  const handleCloseGig = async () => {
    if (!client || !id) return;
    if (!confirm('Are you sure you want to close this gig without selecting anyone? All pending bids will be rejected.')) {
      return;
    }
    try {
      const response = await client.patch(`/api/gigs/${id}/close`);
      const updatedGig = response?.data?.data;
      if (updatedGig) {
        setGig((prev) => ({ ...(prev || {}), ...updatedGig }));
      }
      // Update all bids to rejected
      setBids((prev) =>
        prev.map((bid) => ({
          ...bid,
          status: bid.status === 'pending' ? 'rejected' : bid.status,
        }))
      );
    } catch (err) {
      const messageText = err?.response?.data?.error || err?.response?.data?.message || 'Failed to close gig';
      setBidsError(messageText);
    }
  };

  const statusBadgeClass = useMemo(() => {
    const base = 'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase';
    return `${base} ${statusColors[gig?.status] || 'bg-slate-100 text-slate-700 border-slate-200'}`;
  }, [gig?.status]);

  if (!apiLoaded || !client) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-sm font-medium text-slate-600">Preparing client...</p>
      </div>
    );
  }

  if (gigLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-sm font-medium text-slate-600">Loading gig...</p>
      </div>
    );
  }

  if (gigError) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {gigError}
        </div>
        <Button variant="secondary" onClick={() => navigate('/gigs')}>
          Back to gigs
        </Button>
      </div>
    );
  }

  if (!gig) return null;

  return (
    <div className="space-y-6 text-slate-50">
      {/* Gig Details Card */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-8 shadow-lg">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex-1 space-y-4">
            {/* Status and Hired Info */}
            <div className="flex flex-wrap items-center gap-3">
              <span className={statusBadgeClass}>{gig.status || 'open'}</span>
              {isAssigned && gig?.hiredFreelancer && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/30 border border-emerald-800">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-xs font-medium text-emerald-300">
                    Hired: {gig.hiredFreelancer.name || gig.hiredFreelancer.email}
                  </span>
                </div>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">{gig.title}</h1>
            
            {/* Description */}
            <p className="text-base leading-relaxed text-zinc-300 whitespace-pre-line">{gig.description}</p>
            
            {/* Owner Info */}
            {gig.owner && (
              <div className="flex items-center gap-3 pt-2">
                <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                  <span className="text-sm font-semibold text-zinc-300">
                    {(gig.owner.name || gig.owner.email || 'A').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="text-xs text-zinc-500">Posted by</div>
                  <div className="text-sm font-medium text-white">
                    {gig.owner.name || gig.owner.email || 'Anonymous'}
                  </div>
                </div>
              </div>
            )}

            {/* Highest Bidder */}
            {gig.highestBidder && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-900/20 border border-emerald-800/50">
                <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 rounded-full bg-emerald-800 border border-emerald-700 flex items-center justify-center">
                    <span className="text-xs font-semibold text-emerald-200">
                      {(gig.highestBidder.name || 'A').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="text-xs text-emerald-400">Highest Bidder</div>
                    <div className="text-sm font-semibold text-white">
                      {gig.highestBidder.name} - ${gig.highestBidder.price?.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Budget Card */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6 min-w-[200px]">
            <div className="text-center space-y-2">
              <div className="text-xs uppercase tracking-wide text-zinc-400 font-semibold">Project Budget</div>
              <div className="text-3xl font-bold text-white">${gig.budget?.toLocaleString?.() || gig.budget}</div>
              <div className="text-xs text-zinc-500">Fixed Price</div>
            </div>
          </div>
        </div>
      </div>

      {isOwner ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Proposals</h2>
              <div className="text-sm text-zinc-400 mt-1">{bids.length} {bids.length === 1 ? 'proposal' : 'proposals'}</div>
            </div>
            {gig?.status === 'open' && (
              <Button 
                onClick={handleCloseGig}
                className="bg-rose-900/30 text-rose-300 border border-rose-800 hover:bg-rose-900/50 px-4 py-2 rounded-xl"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Close Gig
                </span>
              </Button>
            )}
          </div>

          {bidsLoading && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-8 text-center">
              <div className="inline-flex items-center gap-3 text-zinc-300">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Loading proposals...</span>
              </div>
            </div>
          )}

          {bidsError && (
            <div className="rounded-2xl border border-rose-800 bg-rose-900/30 p-6">
              <div className="flex items-start gap-3 text-rose-200">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{bidsError}</span>
              </div>
            </div>
          )}

          {!bidsLoading && !bidsError && bids.length === 0 && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-12 text-center space-y-3">
              <svg className="w-12 h-12 text-zinc-600 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-sm text-zinc-400">No proposals yet. Freelancers will start bidding soon!</p>
            </div>
          )}

          {!bidsLoading && !bidsError && bids.length > 0 && (
            <div className="space-y-4">
              {bids.map((bid) => {
                const freelancer = bid.freelancer || {};
                const freelancerName = freelancer.name || freelancer.email || 'Freelancer';
                const freelancerInitial = freelancerName.charAt(0).toUpperCase();
                
                return (
                  <div
                    key={bid.id || bid._id}
                    className="rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-6 shadow-lg hover:border-zinc-700 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      {/* Freelancer Info */}
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                          <span className="text-base font-semibold text-zinc-300">
                            {freelancerInitial}
                          </span>
                        </div>
                        <div>
                          <div className="text-base font-semibold text-white">
                            {freelancerName}
                          </div>
                          <div className="text-xs text-zinc-500">{freelancer.email || 'No email'}</div>
                        </div>
                      </div>
                      
                      {/* Bid Price and Status */}
                      <div className="text-right space-y-1">
                        <div className="text-xl font-bold text-white">${bid.price?.toLocaleString?.() || bid.price}</div>
                        <div className={`inline-block px-2 py-1 rounded-full text-xs font-semibold uppercase ${
                          bid.status === 'hired' 
                            ? 'bg-emerald-900/30 text-emerald-300 border border-emerald-800' 
                            : bid.status === 'rejected'
                            ? 'bg-rose-900/30 text-rose-300 border border-rose-800'
                            : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                        }`}>
                          {bid.status}
                        </div>
                      </div>
                    </div>

                    {/* Bid Message */}
                    <div className="bg-zinc-800/30 border border-zinc-800 rounded-xl p-4 mb-4">
                      <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">{bid.message}</p>
                    </div>

                    {/* Select Button */}
                    {bid.status === 'pending' && gig?.status === 'open' && (
                      <Button 
                        onClick={() => handleSelectBid(bid.id || bid._id)}
                        className="w-full bg-white text-zinc-950 hover:bg-zinc-100"
                      >
                        <span className="flex items-center justify-center gap-2">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Select {freelancerName}
                        </span>
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">          {/* Show congratulations if user was hired */}
          {isHired ? (
            <div className="rounded-2xl border border-emerald-800 bg-emerald-900/20 backdrop-blur-sm p-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-900/50 border-2 border-emerald-700 flex items-center justify-center">
                <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-emerald-300">Congratulations! 🎉</h3>
                <p className="text-base text-emerald-200">The project has been assigned to you!</p>
                <p className="text-sm text-zinc-400 max-w-md mx-auto">The client has selected your proposal. You can now start working on this project.</p>
              </div>
              <div className="pt-4">
                <Button 
                  onClick={() => navigate('/dashboard/bids')}
                  className="bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600"
                >
                  View Your Bids
                </Button>
              </div>
            </div>
          ) : (isAssigned || isClosed) ? (
            /* Show closed/assigned message for non-hired users */
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-sm p-12 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                <svg className="w-8 h-8 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">
                  {isClosed ? 'Project Closed' : 'Project Assigned'}
                </h3>
                <p className="text-sm text-zinc-400 max-w-md mx-auto">
                  {isClosed 
                    ? 'This project has been closed by the owner and is no longer accepting proposals.' 
                    : 'This project has been assigned to another freelancer.'}
                </p>
              </div>
              <div className="pt-4">
                <Button 
                  onClick={() => navigate('/gigs')}
                  variant="secondary"
                  className="bg-zinc-800 text-white hover:bg-zinc-700 border-zinc-700"
                >
                  Browse Other Gigs
                </Button>
              </div>
            </div>
          ) : (
            /* Show bid form only when gig is open */
            <>          {/* Header */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">
              {userBid ? 'Update Your Proposal' : 'Submit Your Proposal'}
            </h2>
            <p className="text-zinc-400">
              {userBid 
                ? 'Make changes to your existing proposal below.' 
                : 'Stand out from the competition by crafting a compelling proposal.'
              }
            </p>
          </div>

          {/* Alert for existing bid */}
          {userBid && (
            <div className="rounded-xl border border-emerald-800 bg-emerald-900/20 p-4 flex items-start gap-3">
              <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <div className="text-sm font-semibold text-emerald-300">Proposal Already Submitted</div>
                <div className="text-xs text-emerald-400 mt-1">You can update your proposal anytime before the client hires someone.</div>
              </div>
            </div>
          )}

          {userBidLoading ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-8 text-center">
              <div className="inline-flex items-center gap-3 text-zinc-300">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Loading your proposal...</span>
              </div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Bid Form */}
              <div className="lg:col-span-2">
                <form onSubmit={handleBidSubmit} className="space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-8 shadow-lg">
                  {/* Message Field */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-white flex items-center gap-2" htmlFor="message">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      Cover Letter
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      rows={8}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell the client why you're the best fit for this project...&#10;&#10;• Highlight relevant experience&#10;• Mention similar projects you've completed&#10;• Explain your approach to this work&#10;• Share what makes you unique"
                      disabled={bidLoading || !canBid}
                      required
                      className="border-zinc-700 bg-zinc-800/50 text-white placeholder:text-zinc-500 focus:border-zinc-600 focus:ring-zinc-600"
                    />
                    <p className="text-xs text-zinc-500">Minimum 10 characters required. Be specific and professional.</p>
                  </div>

                  {/* Bid Price Field */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-white flex items-center gap-2" htmlFor="price">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      Your Bid Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-xl font-bold">$</span>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        min="1"
                        step="1"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="500"
                        disabled={bidLoading || !canBid}
                        required
                        className="border-zinc-700 bg-zinc-800/50 text-white placeholder:text-zinc-500 focus:border-zinc-600 focus:ring-zinc-600 text-xl py-4 pl-10 font-semibold"
                      />
                    </div>
                    <div className="flex items-start gap-2 text-xs text-zinc-500">
                      <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Client's budget: ${gig.budget?.toLocaleString()}. Consider bidding competitively.</span>
                    </div>
                  </div>

                  {/* Error Message */}
                  {bidError && (
                    <div className="rounded-xl border border-rose-800 bg-rose-900/30 px-4 py-3 text-sm text-rose-200 flex items-start gap-3">
                      <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{bidError}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      disabled={bidLoading || !canBid}
                      className="w-full bg-white text-zinc-950 hover:bg-zinc-100 py-4 text-base font-semibold"
                    >
                      {bidLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          {userBid ? 'Updating Your Proposal...' : 'Submitting Your Proposal...'}
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {userBid ? 'Update Proposal' : 'Submit Proposal'}
                        </span>
                      )}
                    </Button>
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
                    Bidding Tips
                  </div>
                  
                  <div className="space-y-4 text-sm text-zinc-400">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-bold">1</div>
                      <p><span className="text-white font-medium">Read Carefully:</span> Understand all project requirements before bidding</p>
                    </div>
                    
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-bold">2</div>
                      <p><span className="text-white font-medium">Be Specific:</span> Mention relevant skills and past work</p>
                    </div>
                    
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-bold">3</div>
                      <p><span className="text-white font-medium">Competitive Pricing:</span> Research market rates for similar projects</p>
                    </div>

                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-bold">4</div>
                      <p><span className="text-white font-medium">Professional Tone:</span> Keep your message clear and courteous</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-800">
                    <div className="flex items-start gap-3 text-xs text-zinc-500">
                      <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p>You can update your proposal anytime before the client makes a hiring decision</p>
                    </div>
                  </div>
                </div>

                {/* Project Summary Card */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-6 space-y-4">
                  <div className="text-white font-semibold">Project Summary</div>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Budget</span>
                      <span className="text-white font-semibold">${gig.budget?.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Status</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${statusBadgeClass}`}>
                        {gig.status || 'open'}
                      </span>
                    </div>
                    {gig.highestBidder && (
                      <div className="pt-3 border-t border-zinc-800">
                        <div className="text-xs text-zinc-500 mb-1">Current Best Bid</div>
                        <div className="text-white font-semibold">${gig.highestBidder.price?.toLocaleString()}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default GigDetail;
