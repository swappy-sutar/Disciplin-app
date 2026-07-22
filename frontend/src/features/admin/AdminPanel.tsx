import { useState, useEffect } from 'react';
import { 
  Users, 
  Star, 
  CheckSquare, 
  Briefcase, 
  Search, 
  ShieldCheck, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { apiClient } from '../../lib/api-client';

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'users' | 'reviews'>('users');
  
  // Stats state
  const [stats, setStats] = useState<any>({
    totalUsers: 0,
    totalHabits: 0,
    totalReviews: 0,
    pendingReviews: 0,
    totalApplications: 0,
    totalGoals: 0,
  });

  // Users state
  const [users, setUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  // Reviews state
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);

  // Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Fetch Dashboard Stats
  const fetchStats = async () => {
    try {
      const res = await apiClient.admin.stats();
      setStats(res.data || res);
    } catch (err: any) {
      console.error('Failed to fetch admin stats:', err);
    }
  };

  // Fetch Users
  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const res = await apiClient.admin.users(userSearch);
      setUsers(Array.isArray(res) ? res : (res as any).data || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch users');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Fetch Reviews
  const fetchReviews = async () => {
    setIsLoadingReviews(true);
    try {
      const res = await apiClient.admin.reviews();
      setReviews(Array.isArray(res) ? res : (res as any).data || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch reviews');
    } finally {
      setIsLoadingReviews(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchReviews();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [userSearch]);

  // Handlers for User Management
  const handleToggleUserRole = async (userId: string, currentRole: string) => {
    const nextRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await apiClient.admin.updateUserRole(userId, nextRole);
      toast.success(`User role updated to ${nextRole.toUpperCase()}`);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: nextRole } : u));
    } catch (err: any) {
      toast.error(err.message || 'Failed to update user role');
    }
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete User Account',
      message: `Are you sure you want to permanently delete user "${userName}"? All their habits, goals, and data will be erased.`,
      onConfirm: async () => {
        try {
          await apiClient.admin.deleteUser(userId);
          toast.success(`User "${userName}" deleted successfully.`);
          setUsers(prev => prev.filter(u => u._id !== userId));
          fetchStats();
        } catch (err: any) {
          toast.error(err.message || 'Failed to delete user');
        } finally {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  // Handlers for Review Management
  const handleToggleReviewApproval = async (reviewId: string, currentApproved: boolean) => {
    try {
      await apiClient.admin.toggleReviewApproval(reviewId, !currentApproved);
      toast.success(`Review ${!currentApproved ? 'approved' : 'unapproved'}`);
      setReviews(prev => prev.map(r => r._id === reviewId ? { ...r, isApproved: !currentApproved } : r));
      fetchStats();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update review approval');
    }
  };

  const handleDeleteReview = (reviewId: string, reviewerName: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Review',
      message: `Are you sure you want to delete the review by "${reviewerName}"?`,
      onConfirm: async () => {
        try {
          await apiClient.admin.deleteReview(reviewId);
          toast.success(`Review deleted successfully.`);
          setReviews(prev => prev.filter(r => r._id !== reviewId));
          fetchStats();
        } catch (err: any) {
          toast.error(err.message || 'Failed to delete review');
        } finally {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const filteredReviews = reviews.filter(r => {
    if (reviewFilter === 'pending') return !r.isApproved;
    if (reviewFilter === 'approved') return r.isApproved;
    return true;
  });

  return (
    <div className="space-y-6 select-none max-w-[1400px] mx-auto pb-12">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <ShieldCheck size={20} />
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
              Admin Control Center
            </h1>
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-2">
            System overview, registered user accounts & review moderation
          </p>
        </div>

        <button
          onClick={() => {
            fetchStats();
            fetchUsers();
            fetchReviews();
            toast.success('Data refreshed');
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-xs font-bold text-gray-700 dark:text-slate-200 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-850 cursor-pointer transition-all shrink-0"
        >
          <RefreshCw size={14} className="text-primary-blue" />
          Refresh Data
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-white dark:bg-slate-900/90 rounded-2xl p-4 border border-purple-500/20 dark:border-purple-500/15 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-600 dark:text-purple-400">Total Users</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <Users size={18} />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight mt-2">
            {stats.totalUsers || 0}
          </p>
          <span className="text-[10px] font-semibold text-gray-400 dark:text-slate-500 mt-0.5 block">Registered platform accounts</span>
        </div>

        {/* Total Reviews */}
        <div className="bg-white dark:bg-slate-900/90 rounded-2xl p-4 border border-pink-500/20 dark:border-pink-500/15 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-pink-600 dark:text-pink-400">Customer Reviews</span>
            <div className="p-2 rounded-xl bg-pink-500/10 text-pink-500">
              <Star size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {stats.totalReviews || 0}
            </span>
            {stats.pendingReviews > 0 && (
              <span className="text-[10px] font-extrabold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 animate-pulse">
                {stats.pendingReviews} Pending
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold text-gray-400 dark:text-slate-500 mt-0.5 block">Submitted testimonials</span>
        </div>

        {/* Active Habits */}
        <div className="bg-white dark:bg-slate-900/90 rounded-2xl p-4 border border-emerald-500/20 dark:border-emerald-500/15 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Habits Logged</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <CheckSquare size={18} />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight mt-2">
            {stats.totalHabits || 0}
          </p>
          <span className="text-[10px] font-semibold text-gray-400 dark:text-slate-500 mt-0.5 block">Total active user habits</span>
        </div>

        {/* Applications Tracked */}
        <div className="bg-white dark:bg-slate-900/90 rounded-2xl p-4 border border-blue-500/20 dark:border-blue-500/15 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400">Job Applications</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <Briefcase size={18} />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight mt-2">
            {stats.totalApplications || 0}
          </p>
          <span className="text-[10px] font-semibold text-gray-400 dark:text-slate-500 mt-0.5 block">Career applications logged</span>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === 'users'
              ? 'bg-primary-blue text-white shadow-md shadow-blue-500/20'
              : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-850'
          }`}
        >
          <Users size={15} />
          Registered Users ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer relative ${
            activeTab === 'reviews'
              ? 'bg-pink-600 text-white shadow-md shadow-pink-500/20'
              : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-850'
          }`}
        >
          <Star size={15} />
          Review Moderation ({reviews.length})
          {stats.pendingReviews > 0 && (
            <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping absolute top-1.5 right-1.5" />
          )}
        </button>
      </div>

      {/* TAB 1: USERS MANAGEMENT */}
      {activeTab === 'users' && (
        <Card title="User Accounts Directory">
          {/* Search bar */}
          <div className="mb-4 relative">
            <Search size={16} className="absolute left-3.5 top-3 text-gray-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search user by name or email address..."
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-bold text-gray-800 dark:text-slate-200 focus:outline-none focus:border-primary-blue"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-800 text-[10px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-slate-500 pb-3">
                  <th className="py-3 px-2">User Details</th>
                  <th className="py-3 px-2">Email Verification</th>
                  <th className="py-3 px-2">Role</th>
                  <th className="py-3 px-2">Joined Date</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60">
                {isLoadingUsers ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-gray-400">Loading users...</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-gray-400">No users found matching your query.</td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id} className="text-xs text-gray-700 dark:text-slate-300 hover:bg-gray-50/50 dark:hover:bg-slate-850/40 transition-colors">
                      <td className="py-3.5 px-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white leading-tight">{user.name}</p>
                            <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-2">
                        {user.isVerified ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            <CheckCircle2 size={12} /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                            <XCircle size={12} /> Pending
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-2">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${
                          user.role === 'admin'
                            ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30'
                            : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-700'
                        }`}>
                          {user.role}
                        </span>
                      </td>

                      <td className="py-3.5 px-2 text-[11px] font-semibold text-gray-500 dark:text-slate-400">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </td>

                      <td className="py-3.5 px-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleUserRole(user._id, user.role)}
                            className="text-[11px] font-extrabold px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-gray-700 dark:text-slate-200 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer border border-gray-200 dark:border-slate-700"
                            title="Toggle Admin/User Role"
                          >
                            {user.role === 'admin' ? 'Demote to User' : 'Make Admin'}
                          </button>

                          <button
                            onClick={() => handleDeleteUser(user._id, user.name)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                            title="Delete User"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 2: REVIEWS MODERATION */}
      {activeTab === 'reviews' && (
        <Card title="Social Proof & Review Submissions">
          {/* Filter Pills */}
          <div className="flex items-center gap-2 mb-4">
            {(['all', 'pending', 'approved'] as const).map(filter => (
              <button
                key={filter}
                onClick={() => setReviewFilter(filter)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                  reviewFilter === filter
                    ? 'bg-pink-600 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-750'
                }`}
              >
                {filter} Reviews
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isLoadingReviews ? (
              <div className="col-span-2 py-8 text-center text-xs text-gray-400">Loading review submissions...</div>
            ) : filteredReviews.length === 0 ? (
              <div className="col-span-2 py-8 text-center text-xs text-gray-400">No reviews found under this filter.</div>
            ) : (
              filteredReviews.map((review) => (
                <div 
                  key={review._id}
                  className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-gray-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 relative overflow-hidden"
                >
                  {/* Top Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={review.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.name)}&background=0D9488&color=fff`}
                        alt={review.name}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-slate-800 shrink-0"
                      />
                      <div>
                        <h4 className="text-xs font-black text-gray-900 dark:text-white leading-tight">{review.name}</h4>
                        <span className="text-[11px] font-semibold text-gray-400 dark:text-slate-500 mt-0.5 block">{review.role}</span>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                      review.isApproved
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                    }`}>
                      {review.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </div>

                  {/* Rating Stars & Comment */}
                  <div className="space-y-2">
                    <div className="flex gap-1 text-amber-400">
                      {Array.from({ length: review.rating || 5 }).map((_, i) => (
                        <Star key={i} size={14} fill="currentColor" />
                      ))}
                    </div>
                    <p className="text-xs font-medium text-gray-700 dark:text-slate-300 italic leading-relaxed">
                      "{review.comment}"
                    </p>
                  </div>

                  {/* Action Controls */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-slate-850 text-xs">
                    <span className="text-[10px] font-semibold text-gray-400 dark:text-slate-500">
                      {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleReviewApproval(review._id, review.isApproved)}
                        className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                          review.isApproved
                            ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40 hover:bg-amber-100'
                            : 'bg-emerald-500 text-white shadow-sm hover:bg-emerald-600'
                        }`}
                      >
                        {review.isApproved ? 'Unapprove' : 'Approve Review'}
                      </button>

                      <button
                        onClick={() => handleDeleteReview(review._id, review.name)}
                        className="p-1.5 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer border border-transparent hover:border-rose-200 dark:hover:border-rose-900/40"
                        title="Delete Review"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* Global Confirmation Modal */}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        title={confirmModal.title}
      >
        <div className="space-y-4 pt-1 select-none">
          <p className="text-xs font-semibold text-gray-700 dark:text-slate-300 leading-relaxed">
            {confirmModal.message}
          </p>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
              onClick={confirmModal.onConfirm}
            >
              Confirm Action
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
