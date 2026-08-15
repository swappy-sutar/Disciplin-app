import { useState } from 'react';
import {
  Target,
  Sparkles,
  TrendingUp,
  Scale,
  Activity,
  AlertCircle,
  CheckCircle2,
  Info,
  RefreshCw,
  Plus
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  useActiveFitnessGoal,
  useCreateFitnessGoal,
  useBodyMetrics,
  useLogBodyMetric,
  useGenerateGoalProgram,
  useGoalProgress
} from '../../hooks/useFitnessGoal';
import { apiClient } from '../../lib/api-client';
import type { FitnessGoalType, FitnessActivityLevel } from '../../types';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';

const GOAL_OPTIONS: { type: FitnessGoalType; label: string; icon: string; desc: string }[] = [
  { type: 'weight_loss', label: 'Weight Loss', icon: '🔥', desc: 'Caloric deficit focused on shedding fat while preserving lean muscle' },
  { type: 'muscle_build', label: 'Muscle Build', icon: '💪', desc: 'Hypertrophy-focused training split with progressive overload' },
  { type: 'weight_gain', label: 'Weight Gain', icon: '📈', desc: 'Surplus-assisted mass building and strength development' },
  { type: 'recomposition', label: 'Recomposition', icon: '⚡', desc: 'Simultaneous fat loss and muscle tone at maintenance' },
];

const ACTIVITY_LEVELS: { level: FitnessActivityLevel; label: string; desc: string }[] = [
  { level: 'sedentary', label: 'Sedentary', desc: 'Desk job, little to no regular exercise' },
  { level: 'lightly_active', label: 'Lightly Active', desc: '1–3 light training sessions per week' },
  { level: 'moderately_active', label: 'Moderately Active', desc: '3–5 moderate workouts per week' },
  { level: 'very_active', label: 'Very Active', desc: '6–7 intense workouts or physical job' },
];

export const FitnessGoalPanel: React.FC = () => {
  const isMockMode = apiClient.isMockMode();
  const { data: activeGoal } = useActiveFitnessGoal();
  const { createGoal, isCreatingGoal } = useCreateFitnessGoal();
  const { data: metrics = [] } = useBodyMetrics(90);
  const { logMetric, isLoggingMetric } = useLogBodyMetric();
  const { generateProgram, isGeneratingProgram, data: programResult } = useGenerateGoalProgram();
  const { checkProgress, isCheckingProgress, data: progressResult } = useGoalProgress();

  // Goal Form State
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalType, setGoalType] = useState<FitnessGoalType>('weight_loss');
  const [startingWeightKg, setStartingWeightKg] = useState<number | ''>('');
  const [targetWeightKg, setTargetWeightKg] = useState<number | ''>('');
  const [heightCm, setHeightCm] = useState<number | ''>('');
  const [activityLevel, setActivityLevel] = useState<FitnessActivityLevel>('moderately_active');
  const [targetDate, setTargetDate] = useState('');

  // Quick Log State
  const [logDate, setLogDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [logWeightKg, setLogWeightKg] = useState<number | ''>('');
  const [logBodyFat, setLogBodyFat] = useState<number | ''>('');

  // Program Generator State
  const [programDays, setProgramDays] = useState(4);
  const [experienceLevel, setExperienceLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');

  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startingWeightKg || !targetWeightKg) return;

    await createGoal({
      goalType,
      startingWeightKg: Number(startingWeightKg),
      targetWeightKg: Number(targetWeightKg),
      heightCm: heightCm ? Number(heightCm) : undefined,
      activityLevel,
      targetDate: targetDate || undefined,
    });
    setIsEditingGoal(false);
  };

  const handleQuickLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logWeightKg || !logDate) return;

    await logMetric({
      date: logDate,
      weightKg: Number(logWeightKg),
      bodyFatPercent: logBodyFat ? Number(logBodyFat) : undefined,
    });

    setLogWeightKg('');
    setLogBodyFat('');
  };

  const handleGenerateProgram = async () => {
    if (isMockMode) return;
    await generateProgram({
      daysPerWeek: programDays,
      experienceLevel,
    });
  };

  const handleCheckProgress = async () => {
    if (isMockMode) return;
    await checkProgress(30);
  };

  // Populate edit form when active goal is clicked
  const startEdit = () => {
    if (activeGoal) {
      setGoalType(activeGoal.goalType);
      setStartingWeightKg(activeGoal.startingWeightKg);
      setTargetWeightKg(activeGoal.targetWeightKg);
      setHeightCm(activeGoal.heightCm || '');
      setActivityLevel(activeGoal.activityLevel);
      setTargetDate(activeGoal.targetDate ? activeGoal.targetDate.split('T')[0] : '');
    }
    setIsEditingGoal(true);
  };

  // Chart data formatting
  const chartData = metrics.map((m) => ({
    date: m.date.slice(5), // MM-DD
    fullDate: m.date,
    weightKg: m.weightKg,
    bodyFatPercent: m.bodyFatPercent,
  }));

  const hasValidActiveGoal = Boolean(activeGoal && typeof activeGoal === 'object' && activeGoal.goalType);
  const latestWeight = metrics.length > 0 ? metrics[metrics.length - 1].weightKg : (activeGoal?.startingWeightKg || 0);

  return (
    <div className="space-y-8 select-none">
      
      {/* Top Banner: Goal Overview or Set Goal Call-to-Action */}
      {!hasValidActiveGoal && !isEditingGoal && (
        <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/[0.04] to-teal-500/[0.02]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-2">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-wider">
                <Target size={14} /> Set Your Direction
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Supercharge Your Workouts with AI Goals
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium max-w-xl leading-relaxed">
                Define your target physique or weight milestone. Disciplin will generate a personalized weekly split, track your progress mathematically, and adapt guidance to your body metrics.
              </p>
            </div>
            <Button
              onClick={() => setIsEditingGoal(true)}
              className="py-3 px-6 text-sm font-black bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 shrink-0"
              icon={<Plus size={16} />}
            >
              Set Fitness Goal
            </Button>
          </div>
        </Card>
      )}

      {/* Active Goal Summary Card */}
      {hasValidActiveGoal && activeGoal && !isEditingGoal && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <Card className="lg:col-span-3 border-emerald-500/20 bg-white dark:bg-slate-900 shadow-sm relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl font-black shrink-0">
                  {activeGoal.goalType === 'weight_loss' && '🔥'}
                  {activeGoal.goalType === 'muscle_build' && '💪'}
                  {activeGoal.goalType === 'weight_gain' && '📈'}
                  {activeGoal.goalType === 'recomposition' && '⚡'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-900 dark:text-white capitalize">
                      {activeGoal.goalType?.replace('_', ' ') || 'Fitness Goal'}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      Active Goal
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium">
                    Activity: <span className="text-slate-700 dark:text-slate-300 font-bold capitalize">{activeGoal.activityLevel?.replace('_', ' ') || 'Moderate'}</span>
                    {activeGoal.targetDate && ` • Target Date: ${new Date(activeGoal.targetDate).toLocaleDateString()}`}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={startEdit}
                className="text-xs font-bold py-1.5 px-4 self-start sm:self-auto"
              >
                Modify Goal
              </Button>
            </div>

            {/* Metrics Triplet */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800/40">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Starting</span>
                <span className="text-base sm:text-xl font-black text-slate-800 dark:text-slate-200">{activeGoal.startingWeightKg} <span className="text-xs font-bold text-slate-400">kg</span></span>
              </div>
              <div className="p-3 bg-emerald-500/[0.04] dark:bg-emerald-500/[0.08] rounded-2xl border border-emerald-500/20">
                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Target</span>
                <span className="text-base sm:text-xl font-black text-emerald-600 dark:text-emerald-400">{activeGoal.targetWeightKg} <span className="text-xs font-bold text-emerald-500/70">kg</span></span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800/40">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Current</span>
                <span className="text-base sm:text-xl font-black text-slate-800 dark:text-slate-200">
                  {latestWeight || activeGoal.startingWeightKg} <span className="text-xs font-bold text-slate-400">kg</span>
                </span>
              </div>
            </div>
          </Card>

          {/* Quick AI Action Card */}
          <Card className="border-slate-200/80 dark:border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 text-white flex flex-col justify-between p-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-wider">
                <Sparkles size={14} /> AI Copilot
              </div>
              <h4 className="text-sm font-black text-white">Goal Synchronization</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                Keep your workout program tuned with your weight milestones.
              </p>
            </div>
            <div className="pt-4 flex flex-col gap-2">
              <button
                onClick={handleCheckProgress}
                disabled={isCheckingProgress || isMockMode}
                title={isMockMode ? 'AI features disabled in mock mode' : 'Run progress check'}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 disabled:opacity-50 cursor-pointer border-none"
              >
                {isCheckingProgress ? <RefreshCw size={13} className="animate-spin" /> : <Activity size={13} />}
                {isCheckingProgress ? 'Analyzing...' : 'Check My Progress'}
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Goal Form (Modal / In-place edit) */}
      {isEditingGoal && (
        <Card title="Configure Fitness Goal" subtitle="Set your physical benchmark and timeframe">
          <form onSubmit={handleSaveGoal} className="space-y-6">
            
            {/* Goal Type Grid */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Select Goal Type</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {GOAL_OPTIONS.map((g) => {
                  const isSelected = goalType === g.type;
                  return (
                    <button
                      key={g.type}
                      type="button"
                      onClick={() => setGoalType(g.type)}
                      className={`text-left p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/[0.06] text-emerald-700 dark:text-emerald-300 shadow-sm'
                          : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-2xl mb-1.5">{g.icon}</div>
                      <div className="text-xs font-black">{g.label}</div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium leading-normal mt-1">
                        {g.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Weights & Measurements Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Starting Weight (kg) *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="e.g. 78.5"
                  value={startingWeightKg}
                  onChange={(e) => setStartingWeightKg(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Target Weight (kg) *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="e.g. 72.0"
                  value={targetWeightKg}
                  onChange={(e) => setTargetWeightKg(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Height (cm) <span className="text-slate-400 text-[10px]">Optional</span></label>
                <input
                  type="number"
                  placeholder="e.g. 178"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Target Date <span className="text-slate-400 text-[10px]">Optional</span></label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* Activity Level Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Daily Lifestyle & Activity Level</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {ACTIVITY_LEVELS.map((lvl) => {
                  const isSelected = activityLevel === lvl.level;
                  return (
                    <button
                      key={lvl.level}
                      type="button"
                      onClick={() => setActivityLevel(lvl.level)}
                      className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/[0.06] text-emerald-700 dark:text-emerald-300'
                          : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <div className="text-xs font-bold">{lvl.label}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 leading-snug">{lvl.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              {activeGoal && (
                <Button variant="ghost" onClick={() => setIsEditingGoal(false)} type="button">
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                disabled={isCreatingGoal}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-black py-2.5 px-6"
              >
                {isCreatingGoal ? 'Saving...' : 'Save & Activate Goal'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Progress Feedback Display (if available) */}
      {progressResult && (
        <Card className={`border ${progressResult.onTrack ? 'border-emerald-500/30 bg-emerald-500/[0.02]' : 'border-amber-500/30 bg-amber-500/[0.02]'}`}>
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-2xl shrink-0 ${progressResult.onTrack ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
              {progressResult.onTrack === true && <CheckCircle2 size={24} />}
              {progressResult.onTrack === false && <AlertCircle size={24} />}
              {progressResult.onTrack === null && <Info size={24} />}
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                  AI Progress Analysis
                </h4>
                {progressResult.onTrack !== null && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    progressResult.onTrack ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  }`}>
                    {progressResult.onTrack ? 'On Track' : 'Needs Tweak'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                {progressResult.summary}
              </p>
              {progressResult.adjustmentSuggestion && (
                <div className="mt-3 p-3 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 font-semibold flex items-start gap-2">
                  <Sparkles size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span>{progressResult.adjustmentSuggestion}</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Main Grid: Weight Log Quick-entry & Weight Trend Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Quick Entry Widget */}
        <Card title="Log Body Metric" subtitle="Record daily or weekly weigh-ins">
          <form onSubmit={handleQuickLog} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Date</label>
              <input
                type="date"
                required
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Weight (kg) *</label>
              <input
                type="number"
                step="0.1"
                required
                placeholder="e.g. 74.2"
                value={logWeightKg}
                onChange={(e) => setLogWeightKg(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Body Fat % <span className="text-slate-400 text-[10px]">Optional</span></label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 16.5"
                value={logBodyFat}
                onChange={(e) => setLogBodyFat(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoggingMetric}
              className="w-full py-2.5 font-bold text-xs bg-emerald-500 hover:bg-emerald-600 text-white"
              icon={<Scale size={14} />}
            >
              {isLoggingMetric ? 'Recording...' : 'Log Metric'}
            </Button>
          </form>

          {/* Recent logs snippet */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Recent Logs</span>
            {metrics.length === 0 ? (
              <p className="text-xs text-slate-400 font-medium py-2 text-center">No weigh-ins logged yet.</p>
            ) : (
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {metrics.slice(-4).reverse().map((m) => (
                  <div key={m._id || m.date} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">{m.date}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-800 dark:text-white">{m.weightKg} kg</span>
                      {m.bodyFatPercent && <span className="text-[10px] text-slate-400 font-bold">({m.bodyFatPercent}%)</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Right Column: Weight Trend Chart */}
        <Card className="lg:col-span-2" title="Weight Trajectory (90 Days)" subtitle="Visual representation of your weigh-in logs over time">
          {metrics.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <TrendingUp size={20} />
              </div>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400">No chart data yet</p>
              <p className="text-[11px] text-slate-400 max-w-xs font-medium">
                Log your first weight entry on the left to start charting your progression curve.
              </p>
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-main, #E5E7EB)" opacity={0.6} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card-bg, #1e293b)',
                      borderColor: 'var(--border-main, #334155)',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      color: 'var(--text-main, #f8fafc)',
                    }}
                  />
                  {activeGoal && typeof activeGoal.targetWeightKg === 'number' && (
                    <ReferenceLine
                      y={activeGoal.targetWeightKg}
                      stroke="#059669"
                      strokeDasharray="4 4"
                      label={{ value: `Target: ${activeGoal.targetWeightKg}kg`, fill: '#059669', fontSize: 10 }}
                    />
                  )}
                  <Area
                    type="monotone"
                    dataKey="weightKg"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#weightGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* AI Goal-Aware Program Generator Section */}
      <Card
        title="AI Goal-Aware Program Generator"
        subtitle="Generate a tailored weekly muscle split and caloric direction aligned with your current fitness goal"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Training Days Per Week
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[3, 4, 5, 6].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setProgramDays(days)}
                    className={`py-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                      programDays === days
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    {days} Days
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Experience Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['beginner', 'intermediate', 'advanced'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setExperienceLevel(lvl)}
                    className={`py-2 rounded-xl text-xs font-black capitalize border transition-all cursor-pointer ${
                      experienceLevel === lvl
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Uses Gemini 2.5 Flash with your active goal ({activeGoal?.goalType ? activeGoal.goalType.replace('_', ' ') : 'Select a goal first'}) and latest weight trajectory.
            </p>
            <Button
              onClick={handleGenerateProgram}
              disabled={isGeneratingProgram || !hasValidActiveGoal || isMockMode}
              className="py-2.5 px-6 font-black text-xs bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20 disabled:opacity-50"
              icon={isGeneratingProgram ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
            >
              {isGeneratingProgram ? 'Synthesizing Plan...' : 'Generate Goal Program'}
            </Button>
          </div>

          {/* Program Result Display */}
          {programResult && (
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 animate-fade-in">
              
              {/* Guidance & Caloric Direction Banner */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900 dark:text-white">Caloric Strategy:</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                      programResult.calorieDirection === 'deficit'
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        : programResult.calorieDirection === 'surplus'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                    }`}>
                      {programResult.calorieDirection}
                    </span>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    AI Goal Program
                  </span>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  {programResult.generalGuidance}
                </p>

                {/* Medical disclaimer */}
                <div className="p-2.5 rounded-xl bg-amber-500/[0.06] border border-amber-500/20 text-[10px] text-amber-700 dark:text-amber-300 font-semibold flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>General wellness guidance only, not intended as medical or clinical dietary advice.</span>
                </div>
              </div>

              {/* Generated 7-Day WeekMap Grid */}
              <div className="space-y-2">
                <span className="text-xs font-black text-slate-800 dark:text-slate-200 block">
                  Generated Weekly Split
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
                  {Object.entries(programResult.workoutSplit.weekMap).map(([day, focus]) => (
                    <div
                      key={day}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        focus === 'rest'
                          ? 'bg-slate-50 dark:bg-slate-900/30 border-slate-200/60 dark:border-slate-800/40 text-slate-400'
                          : 'bg-emerald-500/[0.04] dark:bg-emerald-500/[0.08] border-emerald-500/20 text-slate-800 dark:text-white'
                      }`}
                    >
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                        {day.slice(0, 3)}
                      </span>
                      <span className="text-xs font-black capitalize block">
                        {focus === 'rest' ? '☕ Rest' : focus}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>
      </Card>

    </div>
  );
};
