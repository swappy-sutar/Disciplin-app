import React, { useState } from 'react';
import { useApplications } from '../../hooks/useApplications';
import { useGenerateCoverLetter, useGenerateResumeBullets } from '../../hooks/useAI';
import { useStore } from '../../app/store';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PillBadge } from '../../components/ui/PillBadge';
import { DotGrid } from '../../components/ui/DotGrid';
import { Modal } from '../../components/ui/Modal';
import { PageSkeleton } from '../../components/ui/Skeleton';
import { StatCard } from '../../components/ui/StatCard';
import { format, parseISO } from 'date-fns';
import { useTranslation } from '../../hooks/useTranslation';
import { apiClient } from '../../lib/api-client';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit2, 
  Trash2, 
  Briefcase, 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight,
  ExternalLink,
  Sparkles,
  Wand2,
  Loader2,
  FileText
} from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import type { ApplicationStatus, Application } from '../../types';

export default function Applications() {
  const { activeDate, token } = useStore();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 350);
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Detection logic for backend / AI features availability
  const isBackendOnline = !!token && typeof window !== 'undefined' && window.navigator.onLine && !apiClient.isMockMode();

  // Modals state
  const [isAddOpen, setAddOpen] = useState(false);
  const [isEditOpen, setEditOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    type: 'delete' | 'update';
    id: string;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Form states
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [dateApplied, setDateApplied] = useState(activeDate);
  const [status, setStatus] = useState<ApplicationStatus>('Applied');
  const [link, setLink] = useState('');
  const [notes, setNotes] = useState('');

  // AI Assistant form states
  const [jobDescription, setJobDescription] = useState('');
  const [userProfile, setUserProfile] = useState('');
  const [rawExperience, setRawExperience] = useState('');
  const [aiCoverLetter, setAiCoverLetter] = useState('');
  const [aiResumeBulletsText, setAiResumeBulletsText] = useState('');
  const [showAiAssistant, setShowAiAssistant] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Queries & AI Mutations
  const { applications, isLoading, createApplication, updateApplication, deleteApplication } = useApplications();
  const { generateCoverLetter, isGeneratingCoverLetter } = useGenerateCoverLetter();
  const { generateResumeBullets, isGeneratingBullets } = useGenerateResumeBullets();

  if (isLoading) {
    return <PageSkeleton cards={3} rows={5} />;
  }

  // Filter application items using debounced search term
  const filteredApps = applications.filter((app) => {
    const matchesSearch = app.company.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || 
                          app.role.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                          (app.notes || '').toLowerCase().includes(debouncedSearchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredApps.length / itemsPerPage);
  const paginatedApps = filteredApps.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Stats
  const todayApps = applications.filter(a => a.dateApplied === activeDate);
  const weekStart = new Date(activeDate);
  const dayOffset = weekStart.getDay() || 7; // get current week Monday
  weekStart.setDate(weekStart.getDate() - dayOffset + 1);
  const weekStartStr = weekStart.toISOString().split('T')[0];
  const weeklyCount = applications.filter(a => a.dateApplied >= weekStartStr).length;

  // Yesterday's apps comparison
  const yesterday = new Date(activeDate);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  const yesterdayApps = applications.filter(a => a.dateApplied === yesterdayStr);
  const todayDiff = todayApps.length - yesterdayApps.length;
  
  let todayTrendText = 'Same as yesterday';
  let todayTrendDirection: 'up' | 'down' | 'none' = 'none';
  if (todayDiff > 0) {
    todayTrendText = `+${todayDiff} vs yesterday`;
    todayTrendDirection = 'up';
  } else if (todayDiff < 0) {
    todayTrendText = `${todayDiff} vs yesterday`;
    todayTrendDirection = 'down';
  }

  // Active tracks total
  const activeAppsCount = applications.filter(a => ['Applied', 'OA', 'Interview'].includes(a.status)).length;
  const activeTrendText = `${activeAppsCount} active tracks total`;

  const targetCount = 20;

  const statusVariantMap: Record<ApplicationStatus, 'blue' | 'orange' | 'green' | 'pink' | 'gray'> = {
    Applied: 'gray',
    OA: 'orange',
    Interview: 'blue',
    Offer: 'green',
    Rejected: 'pink',
  };

  const resetForm = () => {
    setCompany('');
    setRole('');
    setLink('');
    setNotes('');
    setJobDescription('');
    setUserProfile('');
    setRawExperience('');
    setAiCoverLetter('');
    setAiResumeBulletsText('');
    setShowAiAssistant(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !role.trim()) return;

    const bulletsArray = aiResumeBulletsText
      .split('\n')
      .map(b => b.replace(/^[-*•\s]+/, '').trim())
      .filter(b => b.length > 0);

    await createApplication({
      company,
      role,
      dateApplied,
      status,
      link: link || undefined,
      notes: notes || undefined,
      aiCoverLetter: aiCoverLetter || undefined,
      aiResumeBullets: bulletsArray.length > 0 ? bulletsArray : undefined,
    });

    resetForm();
    setAddOpen(false);
  };

  const handleEditClick = (app: Application) => {
    setSelectedApp(app);
    setCompany(app.company);
    setRole(app.role);
    setDateApplied(app.dateApplied);
    setStatus(app.status);
    setLink(app.link || '');
    setNotes(app.notes || '');
    setAiCoverLetter(app.aiCoverLetter || '');
    setAiResumeBulletsText(app.aiResumeBullets ? app.aiResumeBullets.map(b => `• ${b}`).join('\n') : '');
    if (app.aiCoverLetter || (app.aiResumeBullets && app.aiResumeBullets.length > 0)) {
      setShowAiAssistant(true);
    } else {
      setShowAiAssistant(false);
    }
    setEditOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    if (!company.trim() || !role.trim()) return;

    const bulletsArray = aiResumeBulletsText
      .split('\n')
      .map(b => b.replace(/^[-*•\s]+/, '').trim())
      .filter(b => b.length > 0);

    await updateApplication({
      id: selectedApp._id,
      body: {
        company,
        role,
        dateApplied,
        status,
        link: link || null,
        notes: notes || null,
        aiCoverLetter: aiCoverLetter || null,
        aiResumeBullets: bulletsArray.length > 0 ? bulletsArray : null,
      }
    });

    resetForm();
    setEditOpen(false);
    setSelectedApp(null);
  };

  const handleGenerateCoverLetter = async () => {
    if (!jobDescription.trim()) return;
    const res = await generateCoverLetter({
      jobDescription,
      userProfile: userProfile || notes || undefined,
      company: company || undefined,
      role: role || undefined,
    });
    if (res?.coverLetter) {
      setAiCoverLetter(res.coverLetter);
    }
  };

  const handleGenerateResumeBullets = async () => {
    if (!jobDescription.trim()) return;
    const expNotes = rawExperience || notes || 'Experience in software engineering, frontend development, and clean code principles.';
    const res = await generateResumeBullets({
      jobDescription,
      rawExperience: expNotes,
      company: company || undefined,
      role: role || undefined,
    });
    if (res?.bullets && Array.isArray(res.bullets)) {
      setAiResumeBulletsText(res.bullets.map(b => `• ${b}`).join('\n'));
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 select-none">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight leading-none">
            {t.applicationsTitle}
          </h1>
          <p className="text-sm font-medium text-gray-400 mt-2 select-none">
            Manage your recruitment stages, follow-up dates, and active offers.
          </p>
        </div>
        <Button 
          icon={<Plus size={16} />} 
          onClick={() => {
            resetForm();
            setDateApplied(activeDate);
            setAddOpen(true);
          }}
          className="md:self-center select-none"
        >
          {t.logApplication}
        </Button>
      </div>

      {/* Main Counter Indicator Widget */}
      <Card className="relative overflow-hidden p-6">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 rounded-t-2xl" />
        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-blue-500/5 dark:bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
              {t.dailyGoal}
            </span>
            <div className="flex items-baseline gap-1 select-none">
              <span className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white leading-none tracking-tight">
                {todayApps.length} / {targetCount}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 select-none ml-1.5">
                {t.submittedToday}
              </span>
            </div>
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
              {t.logAppsDescription}
            </p>
          </div>
          
          <div className="flex-1 md:max-w-md bg-slate-50/60 dark:bg-slate-900/60 border border-slate-150/50 dark:border-slate-800/80 rounded-2xl p-4 flex flex-col justify-center shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2.5 select-none">
              {t.progressVisualization}
            </span>
            <DotGrid value={todayApps.length} target={targetCount} />
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 select-none">
        <StatCard
          label={t.todayLogged}
          value={`${todayApps.length} ${t.jobAppsLabel}`}
          icon={<Briefcase size={18} />}
          accentColor="blue"
          iconBgColor="bg-blue-50/80 text-blue-500 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/30"
          trendText={todayTrendText}
          trendDirection={todayTrendDirection}
        />

        <StatCard
          label={t.weeklySubmitted}
          value={`${weeklyCount} ${t.jobAppsLabel}`}
          icon={<CheckCircle size={18} />}
          accentColor="green"
          iconBgColor="bg-emerald-50/80 text-emerald-500 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/30"
          trendText="+34 vs last week"
          trendDirection="up"
        />

        <StatCard
          label={t.activeInterviews}
          value={`${applications.filter(a => a.status === 'Interview').length} ${t.scheduledInterviews}`}
          icon={<Edit2 size={18} />}
          accentColor="violet"
          iconBgColor="bg-purple-50/80 text-purple-500 dark:bg-purple-950/30 dark:text-purple-400 border border-purple-100/50 dark:border-purple-900/30"
          trendText={activeTrendText}
          trendDirection="none"
          className="col-span-2 lg:col-span-1"
        />
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 select-none">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder={t.searchApps}
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-primary-blue shadow-sm font-medium"
          />
        </div>

        <div className="relative min-w-[160px]">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
            <Filter size={14} />
          </span>
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-primary-blue shadow-sm font-semibold text-gray-700 cursor-pointer appearance-none animate-scale-up"
          >
            <option value="All">All Statuses</option>
            <option value="Applied">Applied</option>
            <option value="OA">OA</option>
            <option value="Interview">Interview</option>
            <option value="Offer">Offer</option>
            <option value="Rejected">Rejected</option>
          </select>
          <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 pointer-events-none">
            <ChevronRight size={14} className="transform rotate-90" />
          </span>
        </div>
      </div>

      {/* Applications Table Card */}
      <Card title="Applications Log">
        <div className="overflow-x-auto select-none">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="pb-3 text-left font-semibold">Company</th>
                <th className="pb-3 text-left font-semibold">Role Title</th>
                <th className="pb-3 text-left font-semibold">Date Logged</th>
                <th className="pb-3 text-center font-semibold">Status Stage</th>
                <th className="pb-3 text-left font-semibold">Notes / Details</th>
                <th className="pb-3 text-center font-semibold">AI Drafts</th>
                <th className="pb-3 text-center font-semibold">Links</th>
                <th className="pb-3 text-right font-semibold pr-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedApps.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400 text-sm">
                    No applications recorded matching this status. Add one above!
                  </td>
                </tr>
              ) : (
                paginatedApps.map((app) => (
                  <tr key={app._id} className="text-xs text-gray-700 hover:bg-gray-50/30 transition-colors">
                    <td className="py-3.5 font-bold select-none">{app.company}</td>
                    <td className="py-3.5 font-medium text-gray-500 select-none">{app.role}</td>
                    <td className="py-3.5 text-gray-400 font-semibold select-none">
                      {format(parseISO(app.dateApplied), 'MMM d, yyyy')}
                    </td>
                    <td className="py-3.5 text-center select-none">
                      <PillBadge variant={statusVariantMap[app.status]}>
                        {app.status}
                      </PillBadge>
                    </td>
                    <td className="py-3.5 max-w-[180px] truncate text-gray-500 font-medium select-none" title={app.notes || ''}>
                      {app.notes || '—'}
                    </td>
                    <td className="py-3.5 text-center select-none">
                      {app.aiCoverLetter || (app.aiResumeBullets && app.aiResumeBullets.length > 0) ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
                          <Sparkles size={10} /> AI Ready
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="py-3.5 text-center select-none">
                      {app.link ? (
                        <a 
                          href={app.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex p-1.5 rounded-lg text-primary-blue hover:bg-blue-50 transition-colors cursor-pointer"
                          aria-label="View application link"
                        >
                          <ExternalLink size={14} />
                        </a>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="py-3.5 text-right pr-2 select-none">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleEditClick(app)}
                          className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-all cursor-pointer"
                          aria-label="Edit application"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => setConfirmModal({
                            type: 'delete',
                            id: app._id,
                            title: 'Confirm Deletion',
                            message: `Are you sure you want to delete the job application to "${app.company}" for the role of "${app.role}"? This action cannot be undone.`,
                            onConfirm: () => deleteApplication(app._id)
                          })}
                          className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all cursor-pointer"
                          aria-label="Delete application"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100 select-none">
            <span className="text-xs text-gray-400 font-medium">
              Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredApps.length)} of {filteredApps.length} applications
            </span>
            
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-gray-100 hover:bg-gray-50 text-gray-500 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={15} />
              </button>
              <span className="text-xs font-semibold px-2 text-gray-700">{currentPage} / {totalPages}</span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-gray-100 hover:bg-gray-50 text-gray-500 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Add Application Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setAddOpen(false)} title="Log Job Application">
        <form onSubmit={handleCreate} className="space-y-4 font-medium select-none max-h-[80vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Company Name</label>
              <input 
                type="text" 
                placeholder="Google"
                value={company}
                onChange={e => setCompany(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-blue font-medium"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Role Title</label>
              <input 
                type="text" 
                placeholder="Frontend Engineer"
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-blue font-medium"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Date Applied</label>
              <input 
                type="date" 
                value={dateApplied}
                onChange={e => setDateApplied(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-blue font-medium"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Status Stage</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as ApplicationStatus)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-primary-blue font-medium cursor-pointer"
              >
                <option value="Applied">Applied</option>
                <option value="OA">OA</option>
                <option value="Interview">Interview</option>
                <option value="Offer">Offer</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Posting link URL (Optional)</label>
            <input 
              type="url" 
              placeholder="https://careers.google.com/jobs/..."
              value={link}
              onChange={e => setLink(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-blue font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Notes (Optional)</label>
            <textarea
              placeholder="Referral from John Doe, recruiter follow-up scheduled"
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-blue font-medium"
            />
          </div>

          {/* AI Assistant Section */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-gradient-to-br from-slate-50 to-indigo-50/40 dark:from-slate-900/90 dark:to-slate-900 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 dark:bg-indigo-400/20 dark:text-indigo-300">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    AI Assistant
                  </h4>
                  <p className="text-[11px] font-medium text-slate-400">
                    Generate tailored cover letter & resume bullets
                  </p>
                </div>
              </div>
              
              <div className="relative group">
                <button
                  type="button"
                  disabled={!isBackendOnline}
                  onClick={() => setShowAiAssistant(!showAiAssistant)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white shadow-sm transition-all cursor-pointer disabled:cursor-not-allowed"
                  title={!isBackendOnline ? 'Connect to backend to use AI features' : undefined}
                >
                  <Sparkles size={13} />
                  {showAiAssistant ? 'Hide AI' : 'Generate with AI'}
                </button>

                {!isBackendOnline && (
                  <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block w-52 bg-slate-900 text-white text-[11px] font-semibold rounded-lg p-2 shadow-xl z-50 pointer-events-none text-center">
                    Connect to backend to use AI features
                  </div>
                )}
              </div>
            </div>

            {showAiAssistant && (
              <div className="space-y-3 pt-3 border-t border-slate-200/60 dark:border-slate-800">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Job Description (Required for AI)
                    </label>
                    <span className={`text-[10px] font-semibold ${jobDescription.length >= 1450 ? 'text-amber-500 font-bold' : 'text-slate-400'}`}>
                      {jobDescription.length} / 1500
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    maxLength={1500}
                    placeholder="Paste job description requirements..."
                    value={jobDescription}
                    onChange={e => setJobDescription(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-indigo-500 font-medium bg-white dark:bg-slate-950"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      User Profile / Resume Notes
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Background details..."
                      value={userProfile}
                      onChange={e => setUserProfile(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-indigo-500 font-medium bg-white dark:bg-slate-950"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Raw Experience Notes
                      </label>
                      <span className={`text-[10px] font-semibold ${rawExperience.length >= 750 ? 'text-amber-500 font-bold' : 'text-slate-400'}`}>
                        {rawExperience.length} / 800
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      maxLength={800}
                      placeholder="Key achievements..."
                      value={rawExperience}
                      onChange={e => setRawExperience(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-indigo-500 font-medium bg-white dark:bg-slate-950"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    disabled={!isBackendOnline || isGeneratingCoverLetter || !jobDescription.trim()}
                    onClick={handleGenerateCoverLetter}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isGeneratingCoverLetter ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                    {isGeneratingCoverLetter ? 'Generating...' : 'Cover Letter'}
                  </button>

                  <button
                    type="button"
                    disabled={!isBackendOnline || isGeneratingBullets || !jobDescription.trim()}
                    onClick={handleGenerateResumeBullets}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-violet-200 dark:border-violet-900 bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 text-xs font-bold hover:bg-violet-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isGeneratingBullets ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                    {isGeneratingBullets ? 'Generating...' : 'Resume Bullets'}
                  </button>
                </div>

                {aiCoverLetter && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      Generated Cover Letter Draft (Editable)
                    </label>
                    <textarea
                      rows={5}
                      value={aiCoverLetter}
                      onChange={e => setAiCoverLetter(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800 text-xs font-medium bg-white dark:bg-slate-950 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                )}

                {aiResumeBulletsText && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      Tailored Resume Bullets (Editable)
                    </label>
                    <textarea
                      rows={4}
                      value={aiResumeBulletsText}
                      onChange={e => setAiResumeBulletsText(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-violet-200 dark:border-violet-800 text-xs font-medium bg-white dark:bg-slate-950 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <Button type="submit" fullWidth className="py-2.5 font-semibold mt-2">Log Job Posting</Button>
        </form>
      </Modal>

      {/* Edit Application Modal */}
      <Modal isOpen={isEditOpen} onClose={() => { setEditOpen(false); setSelectedApp(null); }} title="Edit Application Details">
        <form onSubmit={handleUpdate} className="space-y-4 font-medium select-none max-h-[80vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Company Name</label>
              <input 
                type="text" 
                placeholder="Google"
                value={company}
                onChange={e => setCompany(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-blue font-medium"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Role Title</label>
              <input 
                type="text" 
                placeholder="Frontend Engineer"
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-blue font-medium"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Date Applied</label>
              <input 
                type="date" 
                value={dateApplied}
                onChange={e => setDateApplied(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-blue font-medium"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Status Stage</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as ApplicationStatus)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-primary-blue font-medium cursor-pointer"
              >
                <option value="Applied">Applied</option>
                <option value="OA">OA</option>
                <option value="Interview">Interview</option>
                <option value="Offer">Offer</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Posting link URL (Optional)</label>
            <input 
              type="url" 
              placeholder="https://careers.google.com/jobs/..."
              value={link}
              onChange={e => setLink(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-blue font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Notes (Optional)</label>
            <textarea
              placeholder="Referral from John Doe, recruiter follow-up scheduled"
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-blue font-medium"
            />
          </div>

          {/* AI Assistant Section */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-gradient-to-br from-slate-50 to-indigo-50/40 dark:from-slate-900/90 dark:to-slate-900 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 dark:bg-indigo-400/20 dark:text-indigo-300">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    AI Assistant
                  </h4>
                  <p className="text-[11px] font-medium text-slate-400">
                    Generate tailored cover letter & resume bullets
                  </p>
                </div>
              </div>
              
              <div className="relative group">
                <button
                  type="button"
                  disabled={!isBackendOnline}
                  onClick={() => setShowAiAssistant(!showAiAssistant)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white shadow-sm transition-all cursor-pointer disabled:cursor-not-allowed"
                  title={!isBackendOnline ? 'Connect to backend to use AI features' : undefined}
                >
                  <Sparkles size={13} />
                  {showAiAssistant ? 'Hide AI' : 'Generate with AI'}
                </button>

                {!isBackendOnline && (
                  <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block w-52 bg-slate-900 text-white text-[11px] font-semibold rounded-lg p-2 shadow-xl z-50 pointer-events-none text-center">
                    Connect to backend to use AI features
                  </div>
                )}
              </div>
            </div>

            {showAiAssistant && (
              <div className="space-y-3 pt-3 border-t border-slate-200/60 dark:border-slate-800">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Job Description (Required for AI)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Paste job description requirements..."
                    value={jobDescription}
                    onChange={e => setJobDescription(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-indigo-500 font-medium bg-white dark:bg-slate-950"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      User Profile / Resume Notes
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Background details..."
                      value={userProfile}
                      onChange={e => setUserProfile(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-indigo-500 font-medium bg-white dark:bg-slate-950"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      Raw Experience Notes
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Key achievements..."
                      value={rawExperience}
                      onChange={e => setRawExperience(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-indigo-500 font-medium bg-white dark:bg-slate-950"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    disabled={!isBackendOnline || isGeneratingCoverLetter || !jobDescription.trim()}
                    onClick={handleGenerateCoverLetter}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isGeneratingCoverLetter ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                    {isGeneratingCoverLetter ? 'Generating...' : 'Cover Letter'}
                  </button>

                  <button
                    type="button"
                    disabled={!isBackendOnline || isGeneratingBullets || !jobDescription.trim()}
                    onClick={handleGenerateResumeBullets}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-violet-200 dark:border-violet-900 bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 text-xs font-bold hover:bg-violet-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isGeneratingBullets ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                    {isGeneratingBullets ? 'Generating...' : 'Resume Bullets'}
                  </button>
                </div>

                {aiCoverLetter && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      Cover Letter Draft (Editable)
                    </label>
                    <textarea
                      rows={5}
                      value={aiCoverLetter}
                      onChange={e => setAiCoverLetter(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800 text-xs font-medium bg-white dark:bg-slate-950 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                )}

                {aiResumeBulletsText && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      Tailored Resume Bullets (Editable)
                    </label>
                    <textarea
                      rows={4}
                      value={aiResumeBulletsText}
                      onChange={e => setAiResumeBulletsText(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-violet-200 dark:border-violet-800 text-xs font-medium bg-white dark:bg-slate-950 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <Button type="submit" fullWidth className="py-2.5 font-semibold mt-2">Save Changes</Button>
        </form>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        isOpen={!!confirmModal}
        onClose={() => setConfirmModal(null)}
        title={confirmModal?.title || 'Confirm Action'}
      >
        <div className="space-y-5 py-1">
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">
            {confirmModal?.message}
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button 
              variant="outline" 
              onClick={() => setConfirmModal(null)}
              className="font-bold border-slate-200 dark:border-slate-800 dark:hover:bg-slate-900 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Button>
            <Button
              className={`font-bold text-white transition-all hover:scale-105 active:scale-95 duration-150 ${
                confirmModal?.type === 'delete' 
                  ? 'bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-500/10' 
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-500/10'
              }`}
              onClick={() => {
                if (confirmModal) {
                  confirmModal.onConfirm();
                  setConfirmModal(null);
                }
              }}
            >
              {confirmModal?.type === 'delete' ? 'Delete' : 'Confirm'}
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
