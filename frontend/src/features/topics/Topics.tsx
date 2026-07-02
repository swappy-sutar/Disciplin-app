import React, { useState } from 'react';
import { useTopics } from '../../hooks/useTopics';
import { notifySuccessCelebration } from '../../utils/celebration';
import { useStore } from '../../app/store';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { RadialProgress } from '../../components/ui/RadialProgress';
import { StatCard } from '../../components/ui/StatCard';
import { Modal } from '../../components/ui/Modal';
import { PillBadge } from '../../components/ui/PillBadge';
import { DonutChart } from '../../components/charts/DonutChart';
import { 
  Search, 
  Filter, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  CheckCircle,
  Sparkles,
  Trash2
} from 'lucide-react';

export default function Topics() {
  const { addNotification } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // Modal state
  const [isAddOpen, setAddOpen] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicCategory, setNewTopicCategory] = useState('');
  const [newTopicSubtopics, setNewTopicSubtopics] = useState('');
  const [confirmModal, setConfirmModal] = useState<{
    type: 'delete' | 'update';
    id: string;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);
  
  // Accordion state (mapped by topic ID: boolean)
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});

  // Queries
  const { topics, isLoading, createTopic, updateTopic, deleteTopic } = useTopics();

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500 animate-pulse select-none">Loading topics curriculum...</div>;
  }

  // Toggle Accordion helper
  const toggleAccordion = (id: string) => {
    setExpandedTopics(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Toggle Subtopic
  const handleToggleSubtopic = async (topicId: string, subTopicIndex: number, checked: boolean) => {
    const topic = topics.find(t => t._id === topicId);
    if (!topic) return;

    const updatedSubtopics = topic.subTopics.map((sub, idx) => 
      idx === subTopicIndex ? { ...sub, isDone: checked } : sub
    );

    await updateTopic({
      id: topicId,
      body: { subTopics: updatedSubtopics }
    });

    if (checked) {
      const isTopicNowComplete = updatedSubtopics.every(sub => sub.isDone);
      if (isTopicNowComplete) {
        notifySuccessCelebration(`You have mastered the topic: "${topic.title}"!`);
        addNotification('Topic Mastered! 📚', `You completed all subtopics for: "${topic.title}"`, 'topic');
      }
    }
  };

  // Categories list for filter dropdown
  const categories = ['All', ...Array.from(new Set(topics.map(t => t.category)))];

  // Filtering topics based on search & category select
  const filteredTopics = topics.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Calculate global stats
  const totalTopicsCount = topics.length;
  const completedTopicsCount = topics.filter(t => t.progressPercent === 100).length;
  
  // Calculate average overall progress percent
  const overallProgressPercent = totalTopicsCount > 0 
    ? Math.round(topics.reduce((acc, t) => acc + t.progressPercent, 0) / totalTopicsCount)
    : 0;

  // Donut chart category distributions calculation
  const categoryCounts = topics.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const donutColors: Record<string, string> = {
    DSA: '#3B82F6', // blue
    'System Design': '#8B5CF6', // purple
    Frontend: '#10B981', // green
    Backend: '#F59E0B', // orange
  };
  const fallbackColors = ['#EC4899', '#EF4444', '#6B7280', '#111827'];

  const donutData = Object.entries(categoryCounts).map(([name, value], idx) => {
    const color = donutColors[name] || fallbackColors[idx % fallbackColors.length];
    return { name, value, color };
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim() || !newTopicCategory.trim()) return;

    const subTopics = newTopicSubtopics
      .split('\n')
      .filter(line => line.trim())
      .map(line => ({ title: line.trim() }));

    await createTopic({
      title: newTopicTitle,
      category: newTopicCategory,
      subTopics,
    });

    setNewTopicTitle('');
    setNewTopicCategory('');
    setNewTopicSubtopics('');
    setAddOpen(false);
  };

  return (
    <div className="space-y-6 md:space-y-8 select-none">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight leading-none">
            Topics to Complete
          </h1>
          <p className="text-sm font-medium text-gray-400 mt-2 select-none">
            Track your learning progress and master your curriculum systematically.
          </p>
        </div>
        
        {/* Buttons */}
        <Button 
          icon={<Plus size={16} />} 
          onClick={() => setAddOpen(true)}
          className="md:self-center select-none"
        >
          Add Topic
        </Button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 select-none">
        <StatCard 
          label="Total Topics" 
          value={totalTopicsCount} 
          icon={<BookOpen size={20} />} 
          iconBgColor="bg-blue-50 text-primary-blue"
        />
        
        <StatCard 
          label="Completed" 
          value={`${completedTopicsCount} Topics`} 
          icon={<CheckCircle size={20} />} 
          iconBgColor="bg-emerald-50 text-emerald-500 animate-pulse"
          trendText="+4 this week"
          trendDirection="up"
        />

        <Card className="p-5 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Overall Progress</span>
            <span className="text-[28px] font-bold text-gray-900 mt-1 select-none leading-none tracking-tight">
              {overallProgressPercent}%
            </span>
          </div>
          <RadialProgress percentage={overallProgressPercent} size={64} strokeWidth={6} />
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 select-none">
        
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search topics by name or category..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-primary-blue shadow-sm font-medium"
          />
        </div>

        {/* Category filter */}
        <div className="relative min-w-[160px]">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
            <Filter size={14} />
          </span>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-primary-blue shadow-sm font-semibold text-gray-700 cursor-pointer appearance-none"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
            ))}
          </select>
          <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 pointer-events-none">
            <ChevronDown size={14} />
          </span>
        </div>

      </div>

      {/* Main Grid area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start select-none">
        
        {/* Cards Grid list (2 columns) */}
        <div className="lg:col-span-2">
          {filteredTopics.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100/50 text-center text-gray-400 text-sm select-none">
              No learning topics match your search criteria. Add some or clear filters!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredTopics.map((topic) => {
                const isExpanded = !!expandedTopics[topic._id];
                const isCompleted = topic.progressPercent === 100;
                
                return (
                  <Card 
                    key={topic._id} 
                    className="p-5 relative overflow-hidden flex flex-col justify-between"
                  >
                    {/* Circle top check indicator for 100% completion */}
                    {isCompleted && (
                      <div className="absolute top-3.5 right-11 p-0.5 rounded-full bg-emerald-50 text-emerald-500 border border-emerald-100 animate-pulse">
                        <CheckCircle size={16} fill="currentColor" className="text-white" />
                      </div>
                    )}

                    <div className="space-y-4">
                      {/* Badge and options */}
                      <div className="flex justify-between items-start">
                        <PillBadge variant="blue" className="scale-95 origin-left uppercase text-[9px] font-bold select-none">
                          {topic.category}
                        </PillBadge>
                        <button
                          onClick={() => setConfirmModal({
                            type: 'delete',
                            id: topic._id,
                            title: 'Confirm Deletion',
                            message: `Are you sure you want to delete the study topic "${topic.title}"? This action cannot be undone.`,
                            onConfirm: () => deleteTopic(topic._id)
                          })}
                          className="text-gray-300 hover:text-red-500 transition-colors p-1"
                          aria-label={`Delete ${topic.title}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {/* Title */}
                      <h4 className="text-sm font-bold text-gray-800 leading-snug select-none min-h-[40px]">
                        {topic.title}
                      </h4>

                      {/* Progress Bar */}
                      <div>
                        <div className="flex justify-between items-baseline mb-1 select-none">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Progress</span>
                          <span className={`text-xs font-semibold ${isCompleted ? 'text-emerald-500' : 'text-gray-500'}`}>
                            {topic.progressPercent}%
                          </span>
                        </div>
                        <ProgressBar value={topic.progressPercent} color={isCompleted ? 'green' : 'pink'} />
                      </div>
                    </div>

                    {/* Sub-checklist dropdown accordion */}
                    {topic.subTopics.length > 0 && (
                      <div className="mt-4 pt-3.5 border-t border-gray-50">
                        <button
                          onClick={() => toggleAccordion(topic._id)}
                          className="w-full flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider hover:text-gray-600 cursor-pointer"
                        >
                          <span>Sub-topics Checklist ({topic.subTopics.filter(s => s.isDone).length}/{topic.subTopics.length})</span>
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>

                        {isExpanded && (
                          <div className="mt-3.5 space-y-2.5 animate-scale-up">
                            {topic.subTopics.map((sub, sIdx) => (
                              <div key={sIdx} className="flex items-center gap-2.5 justify-between">
                                <span className={`text-xs select-none leading-snug
                                  ${sub.isDone ? 'text-gray-400 line-through' : 'text-gray-700'}
                                `}>
                                  {sub.title}
                                </span>
                                <Checkbox 
                                  checked={sub.isDone} 
                                  size={16}
                                  onChange={(checked) => setConfirmModal({
                                    type: 'update',
                                    id: `${topic._id}-${sIdx}`,
                                    title: checked ? 'Complete Subtopic' : 'Undo Subtopic Completion',
                                    message: `Are you sure you want to mark "${sub.title}" as ${checked ? 'completed' : 'incomplete'}?`,
                                    onConfirm: () => handleToggleSubtopic(topic._id, sIdx, checked)
                                  })}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar panels (1 column) */}
        <div className="space-y-6">
          
          {/* Category Breakdown Donut */}
          <Card title="Category Breakdown">
            {donutData.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">No categories mapped yet.</p>
            ) : (
              <div className="flex flex-col gap-4 select-none">
                <div className="h-44">
                  <DonutChart data={donutData} height={170} centerLabel="Topics" centerValue={totalTopicsCount} />
                </div>
                
                {/* Custom list legends */}
                <div className="space-y-2 pt-2 border-t border-gray-50">
                  {donutData.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs font-medium text-gray-600">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-bold text-gray-800">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* CTA Box Level Up */}
          <div 
            className="rounded-2xl p-6 text-white select-none relative overflow-hidden shadow-sm space-y-4"
            style={{ background: 'linear-gradient(135deg, #10B981 0%, #3B82F6 100%)' }}
          >
            <div className="p-3 rounded-full bg-white/10 text-white w-fit animate-bounce">
              <Sparkles size={20} />
            </div>
            <div className="space-y-1">
              <h5 className="text-sm font-bold tracking-tight">Level Up Your Skills</h5>
              <p className="text-xs text-white/85 leading-normal">
                Complete 5 more topics this week to hit your learning milestone target.
              </p>
            </div>
            <button className="bg-white hover:bg-gray-50 text-emerald-600 text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-sm w-full">
              See Roadmap
            </button>
          </div>

        </div>

      </div>

      {/* Add Topic Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setAddOpen(false)} title="Add Study Topic">
        <form onSubmit={handleCreate} className="space-y-4 font-medium">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Topic Name</label>
              <input 
                type="text" 
                placeholder="e.g. Graph Algorithms"
                value={newTopicTitle}
                onChange={e => setNewTopicTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-blue font-medium"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Category</label>
              <input 
                type="text" 
                placeholder="e.g. DSA or Frontend"
                value={newTopicCategory}
                onChange={e => setNewTopicCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-blue font-medium"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Sub-topics (One per line)</label>
            <textarea
              placeholder="BFS traversal&#10;DFS traversal&#10;Dijkstra's search"
              rows={4}
              value={newTopicSubtopics}
              onChange={e => setNewTopicSubtopics(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-blue"
            />
          </div>
          <Button type="submit" fullWidth className="py-2.5 font-semibold mt-2">Add Topic</Button>
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
