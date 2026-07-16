import React, { useState } from 'react';
import { useTopics } from '../../hooks/useTopics';
import { notifySuccessCelebration } from '../../utils/celebration';
import { useStore } from '../../app/store';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { RadialProgress } from '../../components/ui/RadialProgress';
import { Modal } from '../../components/ui/Modal';
import { PageSkeleton } from '../../components/ui/Skeleton';
import { PillBadge } from '../../components/ui/PillBadge';
import { DonutChart } from '../../components/charts/DonutChart';
import { useTranslation } from '../../hooks/useTranslation';
import { 
  Search, 
  Filter, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  CheckCircle,
  Sparkles,
  Trash2,
  ArrowLeft,
  Share2,
  Award,
  Clock,
  ExternalLink,
  Code,
  PenTool,
  HelpCircle,
  ChevronRight,
  Bookmark,
  Check
} from 'lucide-react';

// Default Node.js Mock Data matches screenshots but adapts color themes
const DEFAULT_NODE_SUBTOPICS = [
  { title: 'Event Loop Architecture', isDone: true, confidence: 'high' as const, type: '12 MIN READ', desc: 'Phases, timers, poll, and idle. Understanding single-threaded concurrency.' },
  { title: 'Module Systems', isDone: true, confidence: 'high' as const, type: '5 EXERCISES', desc: 'CommonJS vs ESM. Import/Export patterns and dynamic loading.' },
  { title: 'Streams & Buffers', isDone: false, confidence: 'low' as const, type: 'PRIORITY FOCUS', desc: 'Readable, Writable, Transform streams and memory management with Buffers.' },
  { title: 'Async Programming', isDone: false, confidence: 'medium' as const, type: '15 MIN VIDEO', desc: 'Promises, Async/Await, and handling Errors in async contexts.' }
];

const DEFAULT_NODE_NOTES = [
  { id: '1', title: 'Event Loop Deep Dive', content: `# Event Loop Phases\n\nNode.js event loop consists of several phases:\n- **Timers**: \`setTimeout()\` and \`setInterval()\` callbacks are executed.\n- **Pending Callbacks**: I/O callbacks deferred to the next loop iteration.\n- **Idle, Prepare**: Internal use only.\n- **Poll**: Retrieve new I/O events.\n- **Check**: \`setImmediate()\` callbacks are called here.\n- **Close Callbacks**: Socket.on('close', ...)\n\n> Remember: process.nextTick() is not part of the event loop itself. It executes immediately after the current operation.` },
  { id: '2', title: 'Streams & Buffers', content: `# Streams & Buffers in Node.js\n\nStreams are collections of data that might not be available all at once. \n\nFour type of streams:\n1. **Readable**: stream from which data can be read (e.g. fs.createReadStream).\n2. **Writable**: stream to which data can be written (e.g. fs.createWriteStream).\n3. **Duplex**: stream that is both Readable and Writable (e.g. net.Socket).\n4. **Transform**: duplex stream where data can be modified (e.g. zlib.createGzip).` },
  { id: '3', title: 'Worker Threads vs Child Processes', content: `# Multithreading & Multiprocessing\n\n- **Child Processes**: Runs a new instance of Node.js engine with its own memory. Good for long running CPU tasks.\n- **Worker Threads**: Runs inside the same process sharing the same memory. Good for CPU-intensive JavaScript execution.` }
];

const DEFAULT_NODE_QUESTIONS = [
  { id: '1', question: 'What is the Event Loop in Node.js and how does it handle non-blocking I/O?', answer: 'The Event Loop offloads I/O operations to the system kernel whenever possible. When an async operation completes, the kernel notifies Node.js so that the callback can be queued and executed.', tag: 'COMMON', frequency: 'Google' },
  { id: '2', question: 'Explain the difference between process.nextTick() and setImmediate().', answer: 'process.nextTick() fires immediately after the current operation finishes (before the event loop continues). setImmediate() fires on the next check phase of the event loop.', tag: 'INTERMEDIATE', frequency: 'Amazon' },
  { id: '3', question: 'How do you manage environment variables in a production Node.js app?', answer: 'Use process.env coupled with a package like dotenv for local config. In production, variables should be injected via the deployment environment configuration.', tag: 'COMMON', frequency: 'Netflix' },
  { id: '4', question: 'What are Streams in Node.js and name the four types.', answer: 'Streams are objects that let you read data from a source or write data to a destination in continuous chunks. The types are Readable, Writable, Duplex, and Transform.', tag: 'ADVANCED', frequency: 'Google' }
];

const DEFAULT_NODE_CHALLENGES = [
  { id: '1', title: 'Implement a Thread-Safe Connection Pool', difficulty: 'MEDIUM' as const, age: '2 days ago', confidence: 'high' as const },
  { id: '2', title: 'Asynchronous Stream Data Transformer', difficulty: 'HARD' as const, age: '5 days ago', confidence: 'low' as const },
  { id: '3', title: 'Event Loop Macro/Micro-Task Ordering', difficulty: 'EASY' as const, age: '1 week ago', confidence: 'high' as const }
];

const getMocksForTopic = (title: string) => {
  const isNode = title.toLowerCase().includes('node');
  if (isNode) {
    return {
      subtopics: DEFAULT_NODE_SUBTOPICS,
      notes: DEFAULT_NODE_NOTES,
      questions: DEFAULT_NODE_QUESTIONS,
      challenges: DEFAULT_NODE_CHALLENGES
    };
  }
  // Generic fallback mocks dynamically customized with the topic title
  return {
    subtopics: [
      { title: `Core Concepts of ${title}`, isDone: true, confidence: 'high' as const, type: '10 MIN READ', desc: `Understanding the primary foundation and design principles of ${title}.` },
      { title: `Advanced Configurations`, isDone: false, confidence: 'medium' as const, type: '3 EXERCISES', desc: `Implementing optimized settings and scaling strategies for ${title}.` },
      { title: `Troubleshooting & Debugging`, isDone: false, confidence: 'low' as const, type: 'PRIORITY FOCUS', desc: `Finding and fixing performance bottlenecks in ${title}.` }
    ],
    notes: [
      { id: '1', title: `Introduction to ${title}`, content: `# Intro to ${title}\n\nKey notes on ${title}:\n- Simple structure\n- Best practice templates\n- Standard optimization algorithms.` }
    ],
    questions: [
      { id: '1', question: `What is the primary use case of ${title}?`, answer: `It is designed to solve complex organization and logic problems efficiently.`, tag: 'COMMON', frequency: 'Google' }
    ],
    challenges: [
      { id: '1', title: `Optimize ${title} Implementation`, difficulty: 'MEDIUM' as const, age: '3 days ago', confidence: 'high' as const }
    ]
  };
};

export default function Topics() {
  const { addNotification } = useStore();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // Navigation & Drilldown State
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'subtopics' | 'notes' | 'qna' | 'challenges'>('subtopics');

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
  
  // Accordion state for main page list
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});

  // Detail View Local State
  const [notesList, setNotesList] = useState<typeof DEFAULT_NODE_NOTES>([]);
  const [qnasList, setQnasList] = useState<typeof DEFAULT_NODE_QUESTIONS>([]);
  const [challengesList, setChallengesList] = useState<typeof DEFAULT_NODE_CHALLENGES>([]);
  
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [noteSearch, setNoteSearch] = useState('');
  const [noteIsSaving, setNoteIsSaving] = useState(false);

  const [qnaSearch, setQnaSearch] = useState('');
  const [qnaFilter, setQnaFilter] = useState('All');
  const [expandedQnas, setExpandedQnas] = useState<Record<string, boolean>>({});
  const [newQText, setNewQText] = useState('');
  const [newAText, setNewAText] = useState('');
  
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [quizRevealed, setQuizRevealed] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);

  // Queries
  const { topics, isLoading, createTopic, updateTopic, deleteTopic } = useTopics();

  const selectedTopic = topics.find(t => t._id === selectedTopicId);

  // Trigger load of mocks when topic selected
  React.useEffect(() => {
    if (selectedTopicId && selectedTopic) {
      const mocks = getMocksForTopic(selectedTopic.title);
      setNotesList(mocks.notes);
      setQnasList(mocks.questions);
      setChallengesList(mocks.challenges);
      if (mocks.notes.length > 0) {
        setActiveNoteId(mocks.notes[0].id);
      } else {
        setActiveNoteId(null);
      }
      setActiveTab('subtopics');
    }
  }, [selectedTopicId]);

  // Handle flashcard review keyboard shortcuts
  React.useEffect(() => {
    if (!isQuizOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsQuizOpen(false);
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        setQuizRevealed(true);
      } else if (e.key === '1' || e.key === '2' || e.key === '3') {
        if (quizRevealed) {
          if (quizIndex + 1 < qnasList.length) {
            setQuizIndex(prev => prev + 1);
            setQuizRevealed(false);
          } else {
            setIsQuizOpen(false);
            notifySuccessCelebration("Awesome job completing today's study review deck!");
            addNotification('Mastery Deck Finished! 🏆', 'Completed daily coding review quiz.', 'topic');
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isQuizOpen, quizRevealed, quizIndex, qnasList]);

  if (isLoading) {
    return <PageSkeleton cards={3} rows={4} />;
  }

  // Toggle Accordion helper for main list
  const toggleAccordion = (id: string) => {
    setExpandedTopics(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Toggle Subtopic (connects directly to hooks to update backend database)
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

  // Category listing helpers
  const categories = ['All', ...Array.from(new Set(topics.map(t => t.category)))];
  const filteredTopics = topics.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalTopicsCount = topics.length;
  const completedTopicsCount = topics.filter(t => t.progressPercent === 100).length;
  const overallProgressPercent = totalTopicsCount > 0 
    ? Math.round(topics.reduce((acc, t) => acc + t.progressPercent, 0) / totalTopicsCount)
    : 0;

  const categoryCounts = topics.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const donutColors: Record<string, string> = {
    DSA: '#10B981', // Emerald
    'System Design': '#8B5CF6', // Purple
    Frontend: '#6366F1', // Indigo
    Backend: '#F59E0B', // Amber
  };
  const fallbackColors = ['#10B981', '#8B5CF6', '#6366F1', '#EC4899'];
  const donutData = Object.entries(categoryCounts).map(([name, value], idx) => ({
    name,
    value,
    color: donutColors[name] || fallbackColors[idx % fallbackColors.length]
  }));

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

  // Notes tab operations
  const activeNote = notesList.find(n => n.id === activeNoteId);
  const handleNoteContentChange = (content: string) => {
    setNotesList(prev => prev.map(n => n.id === activeNoteId ? { ...n, content } : n));
    setNoteIsSaving(true);
    setTimeout(() => setNoteIsSaving(false), 850);
  };
  const handleNoteTitleChange = (title: string) => {
    setNotesList(prev => prev.map(n => n.id === activeNoteId ? { ...n, title } : n));
  };
  const handleAddNote = () => {
    const newId = `note_${Date.now()}`;
    const newN = {
      id: newId,
      title: 'Untitled Note',
      content: '# Untitled Note\n\nStart typing here...'
    };
    setNotesList(prev => [newN, ...prev]);
    setActiveNoteId(newId);
  };
  const filteredNotes = notesList.filter(n => 
    n.title.toLowerCase().includes(noteSearch.toLowerCase()) ||
    n.content.toLowerCase().includes(noteSearch.toLowerCase())
  );

  // Q&A Bank operations
  const handleAddQuestion = () => {
    if (!newQText.trim()) return;
    const newQ = {
      id: `qna_${Date.now()}`,
      question: newQText,
      answer: newAText || 'Answer will be formulated soon.',
      tag: 'COMMON',
      frequency: 'Google'
    };
    setQnasList(prev => [newQ, ...prev]);
    setNewQText('');
    setNewAText('');
    addNotification('Question Added! 🙋‍♂️', 'Successfully added to Q&A curriculum database fallback.', 'topic');
  };
  const filteredQnas = qnasList.filter(q => {
    const matchesSearch = q.question.toLowerCase().includes(qnaSearch.toLowerCase()) || 
                          q.answer.toLowerCase().includes(qnaSearch.toLowerCase());
    const matchesFilter = qnaFilter === 'All' || q.frequency === qnaFilter;
    return matchesSearch && matchesFilter;
  });

  // Confidence indicators helper
  const renderConfidenceDots = (confidence: 'low' | 'medium' | 'high') => {
    if (confidence === 'high') {
      return (
        <span className="flex gap-1 items-center select-none text-emerald-500" title="High confidence">
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
        </span>
      );
    }
    if (confidence === 'medium') {
      return (
        <span className="flex gap-1 items-center select-none text-amber-500" title="Medium confidence">
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          <span className="w-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-slate-700" />
        </span>
      );
    }
    return (
      <span className="flex gap-1 items-center select-none text-rose-500" title="Review needed">
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        <span className="w-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-slate-700" />
        <span className="w-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-slate-700" />
      </span>
    );
  };

  // --- DETAIL CURRICULUM VIEW RENDER ---
  if (selectedTopicId && selectedTopic) {
    return (
      <div className="space-y-6 md:space-y-8 select-none">
        
        {/* Detail Header breadcrumb & actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-slate-800/60 pb-6">
          <div className="space-y-2">
            <button 
              onClick={() => setSelectedTopicId(null)}
              className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-emerald-500 dark:text-slate-400 dark:hover:text-emerald-400 cursor-pointer transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back to Topics</span>
            </button>
            
            <div className="flex items-center gap-3 pt-1">
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
                {selectedTopic.title}
              </h1>
              <PillBadge variant="green" className="uppercase text-[9px] font-black tracking-wider px-2 py-0.5">
                {selectedTopic.category}
              </PillBadge>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              icon={<Share2 size={15} />}
              className="font-bold border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-355 dark:hover:bg-slate-900 hover:bg-slate-50"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                addNotification('Link Copied! 🔗', 'Topic share link copied to clipboard.', 'topic');
              }}
            >
              Share
            </Button>
            <Button
              icon={<Award size={15} />}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] active:scale-95 transition-all"
              onClick={() => {
                notifySuccessCelebration(`Congratulations! You marked "${selectedTopic.title}" as Mastered!`);
                addNotification('Topic Completed! 🎉', `You have completed study curriculum for ${selectedTopic.title}`, 'topic');
              }}
            >
              Mark as Mastered
            </Button>
          </div>
        </div>

        {/* Tab Sub-navigation Bar */}
        <div className="flex border-b border-slate-200 dark:border-slate-800/80 gap-6 select-none font-semibold text-sm">
          {(['subtopics', 'notes', 'qna', 'challenges'] as const).map(tab => {
            const label = tab === 'subtopics' ? 'Sub-topics' : tab === 'notes' ? 'Notes' : tab === 'qna' ? 'Q&A Bank' : 'Coding Questions';
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative py-3 transition-colors cursor-pointer group
                  ${isActive 
                    ? 'text-emerald-600 dark:text-emerald-400 font-bold' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }
                `}
              >
                <span>{label}</span>
                <span className={`absolute bottom-0 left-0 w-full h-[2px] bg-emerald-500 transition-transform duration-300 origin-center ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
              </button>
            );
          })}
        </div>

        {/* --- TAB CONTENT AREA --- */}

        {/* 1. Sub-topics Tab */}
        {activeTab === 'subtopics' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left 2/3 Content: Progress & Cards */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Curriculum Progress widget */}
              <Card className="p-5 space-y-4">
                <div className="flex justify-between items-baseline">
                  <h3 className="text-sm font-bold text-gray-800 dark:text-white">Curriculum Progress</h3>
                  <span className="text-xs font-bold text-emerald-500">{selectedTopic.progressPercent}% Completed</span>
                </div>
                <ProgressBar value={selectedTopic.progressPercent} color="green" />
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                  You have {selectedTopic.subTopics.filter(s => !s.isDone).length} sub-topics remaining to master the core {selectedTopic.title} architecture. Focus on review items next.
                </p>
              </Card>

              {/* Sub-topics Grid cards list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(selectedTopic.subTopics.length > 0 ? selectedTopic.subTopics : DEFAULT_NODE_SUBTOPICS).map((sub, idx) => {
                  const subDone = selectedTopic.subTopics[idx]?.isDone ?? sub.isDone;
                  // Map custom properties from mock subtopics for visual richness
                  const custom = DEFAULT_NODE_SUBTOPICS[idx % DEFAULT_NODE_SUBTOPICS.length];
                  
                  return (
                    <Card key={idx} className="p-5 flex flex-col justify-between h-48 relative border-slate-200/60 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-shadow">
                      <div className="space-y-2">
                        {/* Header card indicator dots */}
                        <div className="flex items-center justify-between">
                          {renderConfidenceDots(custom.confidence)}
                          <PillBadge variant={subDone ? 'green' : 'pink'} className="text-[8px] font-black uppercase tracking-wider scale-90">
                            {custom.type}
                          </PillBadge>
                        </div>
                        
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white pt-1">
                          {sub.title}
                        </h4>
                        
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal line-clamp-2">
                          {custom.desc}
                        </p>
                      </div>

                      {/* Bottom status trigger checkbox */}
                      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 pt-3 mt-auto">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${subDone ? 'text-emerald-500' : 'text-slate-400'}`}>
                          {subDone ? 'Completed' : 'Study Pending'}
                        </span>
                        <Checkbox 
                          checked={subDone}
                          size={18}
                          onChange={(checked) => handleToggleSubtopic(selectedTopic._id, idx, checked)}
                        />
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Right 1/3 Content: Sidebar widgets */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Topic Insights widget */}
              <Card title="Topic Insights" className="p-5">
                <div className="space-y-4">
                  {/* Stats items */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800/60 flex flex-col justify-between h-20">
                      <div className="flex justify-between text-slate-450 dark:text-slate-500">
                        <span className="text-[10px] font-bold uppercase tracking-wider">Time Invested</span>
                        <Clock size={12} />
                      </div>
                      <span className="text-sm font-bold text-slate-800 dark:text-white leading-none tracking-tight">24.5 hrs</span>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800/60 flex flex-col justify-between h-20">
                      <div className="flex justify-between text-slate-450 dark:text-slate-500">
                        <span className="text-[10px] font-bold uppercase tracking-wider">Ready Level</span>
                        <Award size={12} className="text-emerald-500" />
                      </div>
                      <span className="text-sm font-bold text-emerald-500 leading-none tracking-tight">High</span>
                    </div>
                  </div>

                  {/* Activity trend mini graphic */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Activity Trend (Last 7 Days)</span>
                    <div className="h-16 flex items-end justify-between px-1 gap-1">
                      {[15, 30, 10, 48, 65, 75, 25].map((height, i) => (
                        <div 
                          key={i} 
                          className="w-full bg-emerald-500/20 dark:bg-emerald-500/10 rounded-t-sm relative group hover:bg-emerald-500 transition-colors"
                          style={{ height: `${height}%` }}
                        >
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-slate-900 text-white text-[9px] font-bold py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                            {height}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              {/* External Resources widget */}
              <Card title="External Resources" className="p-5">
                <div className="space-y-3">
                  <a 
                    href="https://nodejs.org/docs" 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer group text-xs"
                  >
                    <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-355 font-bold">
                      <BookOpen size={14} className="text-emerald-500" />
                      <span>Official Documentation</span>
                    </div>
                    <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </a>

                  <a 
                    href="https://www.google.com/search?q=Node.js+Design+Patterns" 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer group text-xs"
                  >
                    <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-355 font-bold">
                      <Bookmark size={14} className="text-violet-500" />
                      <span>Recommended Guidebooks</span>
                    </div>
                    <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </Card>

              {/* Q&A Activity Activity feed */}
              <Card title="Community QA Activity" className="p-5 text-xs">
                <div className="space-y-3 font-medium text-slate-500 dark:text-slate-400 leading-normal">
                  <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800/60 space-y-2">
                    <p className="italic font-semibold text-slate-700 dark:text-slate-300">
                      &ldquo;Explain why process.nextTick() is faster than setImmediate()?&rdquo;
                    </p>
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 pt-1">
                      <span>8 new replies</span>
                      <span className="text-emerald-600 dark:text-emerald-400 cursor-pointer hover:underline" onClick={() => setActiveTab('qna')}>View Discussion</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* 2. Notes Editor Tab */}
        {activeTab === 'notes' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch min-h-[500px]">
            
            {/* Left Side: Notes titles list pane (4 cols) */}
            <div className="md:col-span-4 border-r border-slate-100 dark:border-slate-800/80 pr-4 flex flex-col space-y-4">
              
              {/* Controls: Search + Add */}
              <div className="flex items-center gap-2 select-none">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                    <Search size={14} />
                  </span>
                  <input
                    type="text"
                    placeholder="Search notes..."
                    value={noteSearch}
                    onChange={e => setNoteSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-semibold focus:outline-none focus:border-emerald-500 shadow-sm"
                  />
                </div>
                <button
                  onClick={handleAddNote}
                  className="p-2 border border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500 hover:text-white text-emerald-500 rounded-xl transition-all duration-300 cursor-pointer flex items-center justify-center shadow-sm"
                  title="Create new note"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Note List block */}
              <div className="space-y-2 flex-1 overflow-y-auto max-h-[420px] pr-1">
                {filteredNotes.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 py-12">No notes match your criteria.</p>
                ) : (
                  filteredNotes.map(n => {
                    const isActive = n.id === activeNoteId;
                    return (
                      <div
                        key={n.id}
                        onClick={() => setActiveNoteId(n.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer select-none text-left transition-all duration-300
                          ${isActive 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                            : 'border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400'
                          }
                        `}
                      >
                        <h5 className="text-xs font-bold truncate">{n.title}</h5>
                        <p className="text-[10px] text-slate-450 dark:text-slate-500 font-medium truncate pt-1">
                          {n.content.replace(/[#*`>]/g, '')}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Side: Markdown Note Editor (8 cols) */}
            <div className="md:col-span-8 flex flex-col space-y-4">
              {activeNote ? (
                <div className="flex-1 flex flex-col border border-slate-200/60 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-950 p-4 shadow-inner space-y-4">
                  
                  {/* Toolbar */}
                  <div className="flex flex-wrap items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-2">
                    <div className="flex items-center gap-1.5">
                      <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 rounded font-bold text-xs" title="Bold" onClick={() => handleNoteContentChange(activeNote.content + ' **bold**')}>B</button>
                      <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 rounded italic text-xs" title="Italic" onClick={() => handleNoteContentChange(activeNote.content + ' *italic*')}>I</button>
                      <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 rounded text-xs" title="Code" onClick={() => handleNoteContentChange(activeNote.content + ' \`code\`')}><Code size={12} /></button>
                      <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 rounded text-xs" title="Link" onClick={() => handleNoteContentChange(activeNote.content + ' [Title](https://link)')}><ExternalLink size={12} /></button>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 select-none">
                      {noteIsSaving ? (
                        <span className="text-emerald-500 animate-pulse flex items-center gap-1">
                          <Check size={11} />
                          <span>Saved</span>
                        </span>
                      ) : (
                        <span className="opacity-60 flex items-center gap-1">
                          <PenTool size={11} />
                          <span>Editor active</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title editor */}
                  <input
                    type="text"
                    value={activeNote.title}
                    onChange={e => handleNoteTitleChange(e.target.value)}
                    placeholder="Note Title..."
                    className="w-full text-base font-bold text-slate-800 dark:text-white bg-transparent border-none focus:outline-none placeholder-slate-300"
                  />

                  {/* Content Editor Textarea */}
                  <textarea
                    value={activeNote.content}
                    onChange={e => handleNoteContentChange(e.target.value)}
                    placeholder="Write details in markdown format..."
                    rows={12}
                    className="w-full flex-1 text-xs font-semibold text-slate-700 dark:text-slate-355 bg-transparent border-none focus:outline-none resize-none leading-relaxed"
                  />
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl py-24 text-slate-400 text-xs">
                  Create a new note or select one from the list to start writing.
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. Q&A Bank Tab */}
        {activeTab === 'qna' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left 2/3 Area: Q&As list */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Stats overview banner */}
              <div className="grid grid-cols-3 gap-4 select-none">
                <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl text-center">
                  <span className="block text-[10px] font-black uppercase text-rose-500 tracking-wider">Weak Items</span>
                  <span className="block text-2xl font-black text-rose-500 mt-1">12</span>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl text-center">
                  <span className="block text-[10px] font-black uppercase text-amber-500 tracking-wider">Average Skill</span>
                  <span className="block text-2xl font-black text-amber-500 mt-1">28</span>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl text-center">
                  <span className="block text-[10px] font-black uppercase text-emerald-500 tracking-wider">Strong Skills</span>
                  <span className="block text-2xl font-black text-emerald-500 mt-1">45</span>
                </div>
              </div>

              {/* Filters row */}
              <div className="flex gap-4 items-center justify-between">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                    <Search size={14} />
                  </span>
                  <input
                    type="text"
                    placeholder="Search Q&As..."
                    value={qnaSearch}
                    onChange={e => setQnaSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-semibold focus:outline-none focus:border-emerald-500 shadow-sm"
                  />
                </div>

                <div className="flex gap-1.5">
                  {['All', 'Google', 'Amazon', 'Netflix'].map(comp => (
                    <button
                      key={comp}
                      onClick={() => setQnaFilter(comp)}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-bold cursor-pointer transition-all duration-300 border
                        ${qnaFilter === comp 
                          ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm' 
                          : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50'
                        }
                      `}
                    >
                      {comp}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Add Custom Question panel */}
              <Card className="p-4 border-dashed border-emerald-500/20 bg-emerald-500/5">
                <div className="flex flex-col gap-3">
                  <input 
                    type="text" 
                    placeholder="Add a new custom question to your bank..."
                    value={newQText}
                    onChange={e => setNewQText(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:border-emerald-500"
                  />
                  <div className="flex gap-3 items-center">
                    <input 
                      type="text" 
                      placeholder="Answer / hint details..."
                      value={newAText}
                      onChange={e => setNewAText(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:border-emerald-500"
                    />
                    <Button 
                      onClick={handleAddQuestion} 
                      size="sm" 
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-9"
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Q&A Accordion List */}
              <div className="space-y-3">
                {filteredQnas.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 py-12">No QA questions match your search.</p>
                ) : (
                  filteredQnas.map(q => {
                    const isExpanded = !!expandedQnas[q.id];
                    return (
                      <Card key={q.id} className="p-4 relative hover:shadow-md transition-shadow">
                        <div 
                          onClick={() => setExpandedQnas(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
                          className="flex items-center justify-between cursor-pointer"
                        >
                          <div className="flex items-center gap-3 pr-4">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 animate-ping" />
                            <h4 className="text-xs md:text-sm font-bold text-slate-800 dark:text-white leading-snug">
                              {q.question}
                            </h4>
                          </div>
                          <div className="flex items-center gap-2">
                            <PillBadge variant="green" className="text-[8px] font-black tracking-wider uppercase scale-90">{q.tag}</PillBadge>
                            {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                          </div>
                        </div>

                        {/* Collapsible Answer panel */}
                        {isExpanded && (
                          <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/60 text-xs font-semibold text-gray-600 dark:text-slate-300 leading-relaxed bg-slate-50/50 dark:bg-slate-900/40 p-3 rounded-xl animate-scale-up">
                            {q.answer}
                          </div>
                        )}
                      </Card>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right 1/3 Area: Insights */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Coverage stats */}
              <Card title="Curriculum Coverage" className="p-5">
                <div className="flex flex-col gap-4 text-center">
                  <div className="h-32 flex items-center justify-center">
                    <RadialProgress percentage={68} size={90} strokeWidth={8} />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Topic Coverage</span>
                    <span className="text-xl font-black text-slate-800 dark:text-white">68% Covered</span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-500 leading-normal">
                    Complete 4 more Google frequency Q&A items to raise coverage score to 75%.
                  </p>
                </div>
              </Card>

              {/* Total Qs widget */}
              <Card className="p-5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Total Questions</span>
                  <h4 className="text-2xl font-black text-slate-800 dark:text-white mt-1">{qnasList.length} Qs</h4>
                </div>
                <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 rounded-2xl">
                  <HelpCircle size={24} />
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* 4. Coding Questions Tab */}
        {activeTab === 'challenges' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left 2/3: List of Coding Questions */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Filter Row */}
              <div className="flex gap-4 justify-between items-center select-none">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                    <Search size={14} />
                  </span>
                  <input
                    type="text"
                    placeholder="Search coding challenges..."
                    className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-semibold focus:outline-none focus:border-emerald-500 shadow-sm"
                  />
                </div>
                <Button 
                  icon={<Sparkles size={14} />}
                  onClick={() => {
                    const idx = Math.floor(Math.random() * challengesList.length);
                    addNotification('Random Challenge Chosen! 🎯', `Try solving: "${challengesList[idx].title}"`, 'topic');
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-9 py-1 px-4 text-xs"
                >
                  Random Challenge
                </Button>
              </div>

              {/* Challenges Card list */}
              <div className="space-y-3">
                {challengesList.map((ch, idx) => {
                  const numStr = `0${idx + 1}`.slice(-2);
                  const isHard = ch.difficulty === 'HARD';
                  const isMedium = ch.difficulty === 'MEDIUM';
                  
                  return (
                    <Card key={ch.id} className="p-4 hover:shadow-md transition-shadow relative overflow-hidden flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Index Indicator */}
                        <div className="w-9 h-9 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/85 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400">
                          {numStr}
                        </div>
                        
                        <div className="space-y-1">
                          <h4 className="text-xs md:text-sm font-bold text-slate-850 dark:text-white leading-snug">
                            {ch.title}
                          </h4>
                          <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            <span className={isHard ? 'text-rose-500' : isMedium ? 'text-amber-500' : 'text-emerald-500'}>
                              {ch.difficulty}
                            </span>
                            <span>•</span>
                            <span>{ch.age}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right metadata controls */}
                      <div className="flex items-center gap-4">
                        {renderConfidenceDots(ch.confidence)}
                        <ChevronRight size={16} className="text-slate-400 cursor-pointer hover:text-emerald-500" />
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Right 1/3: Stats & Daily Quiz */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Progress gauge */}
              <Card title="Coding Progress" className="p-5">
                <div className="flex flex-col gap-4 text-center">
                  <div className="h-32 flex items-center justify-center">
                    <RadialProgress percentage={65} size={90} strokeWidth={8} color="green" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Completed Level</span>
                    <span className="text-xl font-black text-slate-800 dark:text-white">65% Completed</span>
                  </div>
                  <Button 
                    onClick={() => {
                      setQuizIndex(0);
                      setQuizRevealed(false);
                      setIsQuizOpen(true);
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md hover:shadow-emerald-500/10 active:scale-95 transition-all text-xs"
                  >
                    Start Daily Quiz
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* --- DAILY QUIZ INTERACTIVE FLASHCARD MODAL (Image 5) --- */}
        <Modal 
          isOpen={isQuizOpen} 
          onClose={() => setIsQuizOpen(false)} 
          title="Reviewing: Topic Mastery"
        >
          <div className="space-y-6 py-2 select-none">
            {/* Header progress line */}
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <span>Question {quizIndex + 1} of {qnasList.length}</span>
              <span className="text-emerald-500">{Math.round(((quizIndex + 1) / qnasList.length) * 100)}% Complete</span>
            </div>

            {/* Main flashcard container */}
            <div className="min-h-[220px] flex flex-col justify-center items-center p-6 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900/60 shadow-inner relative overflow-hidden text-center">
              
              {/* Glow overlay */}
              <div className="absolute inset-0 bg-radial-gradient from-emerald-500/5 to-transparent pointer-events-none" />
              
              <div className="space-y-3 z-10 max-w-sm">
                <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                  {quizRevealed ? 'REVEALED ANSWER' : 'CORE CONCEPT'}
                </span>
                
                <h4 className={`text-sm md:text-base font-bold text-slate-800 dark:text-white leading-relaxed transition-all duration-300
                  ${!quizRevealed ? '' : 'scale-98 text-slate-750 dark:text-slate-350'}
                `}>
                  {quizRevealed ? qnasList[quizIndex % qnasList.length]?.answer : qnasList[quizIndex % qnasList.length]?.question}
                </h4>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-4">
              {!quizRevealed ? (
                <Button 
                  fullWidth
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-11 py-2"
                  onClick={() => setQuizRevealed(true)}
                >
                  Reveal Answer →
                </Button>
              ) : (
                <div className="space-y-3">
                  <span className="block text-[10px] font-black uppercase text-center text-slate-400 tracking-wider">Rate Difficulty to Continue</span>
                  <div className="grid grid-cols-3 gap-3">
                    <button 
                      onClick={() => {
                        if (quizIndex + 1 < qnasList.length) {
                          setQuizIndex(prev => prev + 1);
                          setQuizRevealed(false);
                        } else {
                          setIsQuizOpen(false);
                          notifySuccessCelebration('Awesome job completing today\'s study review deck!');
                          addNotification('Mastery Deck Finished! 🏆', 'Completed daily coding review quiz.', 'topic');
                        }
                      }}
                      className="py-2.5 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-500 hover:text-white text-rose-500 border border-rose-500/20 text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      Hard (Review)
                    </button>
                    <button 
                      onClick={() => {
                        if (quizIndex + 1 < qnasList.length) {
                          setQuizIndex(prev => prev + 1);
                          setQuizRevealed(false);
                        } else {
                          setIsQuizOpen(false);
                          notifySuccessCelebration('Awesome job completing today\'s study review deck!');
                          addNotification('Mastery Deck Finished! 🏆', 'Completed daily coding review quiz.', 'topic');
                        }
                      }}
                      className="py-2.5 bg-amber-50 dark:bg-amber-950/20 hover:bg-amber-500 hover:text-white text-amber-500 border border-amber-500/20 text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      Medium
                    </button>
                    <button 
                      onClick={() => {
                        if (quizIndex + 1 < qnasList.length) {
                          setQuizIndex(prev => prev + 1);
                          setQuizRevealed(false);
                        } else {
                          setIsQuizOpen(false);
                          notifySuccessCelebration('Awesome job completing today\'s study review deck!');
                          addNotification('Mastery Deck Finished! 🏆', 'Completed daily coding review quiz.', 'topic');
                        }
                      }}
                      className="py-2.5 bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-500 hover:text-white text-emerald-500 border border-emerald-500/20 text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      Easy (Mastered)
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Keyboard shortcut help legends */}
            <div className="flex justify-center gap-4 text-[10px] font-bold text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span>[SPACE] Reveal</span>
              <span>•</span>
              <span>[1-3] Rate difficulty</span>
              <span>•</span>
              <span>[ESC] Exit</span>
            </div>
          </div>
        </Modal>

      </div>
    );
  }

  // --- MAIN TOPIC DASHBOARD VIEW ---
  return (
    <div className="space-y-6 md:space-y-8 select-none">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
            {t.topicsTitle}
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2 select-none">
            Track your learning progress and master your curriculum systematically.
          </p>
        </div>
        
        {/* Buttons */}
        <Button 
          icon={<Plus size={16} />} 
          onClick={() => setAddOpen(true)}
          className="md:self-center select-none bg-emerald-600 hover:bg-emerald-500 text-white font-bold hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]"
        >
          {t.createTopic}
        </Button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 select-none">

        {/* Total Topics */}
        <div className="relative overflow-hidden rounded-2xl p-4 bg-white dark:bg-slate-900/80 border border-emerald-500/20 dark:border-emerald-500/15 shadow-lg shadow-emerald-500/5">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-t-2xl" />
          <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 blur-2xl pointer-events-none" />
          <div className="flex flex-col gap-0.5 relative">
            <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">{t.totalTopics}</span>
            <span className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white leading-none tracking-tight mt-1">{totalTopicsCount}</span>
            <span className="text-[10px] font-semibold text-gray-400 dark:text-slate-500 mt-0.5">{t.curriculumModules}</span>
          </div>
          <div className="absolute bottom-3 right-3 p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 dark:from-emerald-500/25 dark:to-teal-500/15 border border-emerald-500/15">
            <BookOpen size={18} className="text-emerald-500" />
          </div>
        </div>

        {/* Completed */}
        <div className="relative overflow-hidden rounded-2xl p-4 bg-white dark:bg-slate-900/80 border border-blue-500/20 dark:border-blue-500/15 shadow-lg shadow-blue-500/5">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-t-2xl" />
          <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-blue-500/10 dark:bg-blue-500/15 blur-2xl pointer-events-none" />
          <div className="flex flex-col gap-0.5 relative">
            <span className="text-[9px] font-bold text-blue-500 dark:text-blue-400 uppercase tracking-widest">{t.topicsCompleted}</span>
            <span className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white leading-none tracking-tight mt-1">{completedTopicsCount}<span className="text-base font-bold text-gray-400 dark:text-slate-500 ml-1">Topics</span></span>
            <span className="text-[10px] font-semibold text-gray-400 dark:text-slate-500 mt-0.5">{totalTopicsCount - completedTopicsCount} remaining</span>
          </div>
          <div className="absolute bottom-3 right-3 p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/10 dark:from-blue-500/25 dark:to-indigo-500/15 border border-blue-500/15">
            <CheckCircle size={18} className="text-blue-500 animate-bounce" />
          </div>
        </div>

        {/* Overall Progress */}
        <div className="relative overflow-hidden rounded-2xl p-4 bg-white dark:bg-slate-900/80 border border-violet-500/20 dark:border-violet-500/15 shadow-lg shadow-violet-500/5 col-span-2 lg:col-span-1">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-400 to-purple-400 rounded-t-2xl" />
          <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-violet-500/10 dark:bg-violet-500/15 blur-2xl pointer-events-none" />
          <div className="flex flex-col gap-0.5 relative">
            <span className="text-[9px] font-bold text-violet-500 dark:text-violet-400 uppercase tracking-widest">{t.overallTopicsProgress}</span>
            <span className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white leading-none tracking-tight mt-1">{overallProgressPercent}<span className="text-lg">%</span></span>
            <span className="text-[10px] font-semibold text-gray-400 dark:text-slate-500 mt-0.5">Curriculum coverage rate</span>
          </div>
          <div className="absolute bottom-3 right-3">
            <div className="relative">
              <div className="absolute inset-0 bg-violet-500/20 blur-md rounded-full" />
              <RadialProgress percentage={overallProgressPercent} size={46} strokeWidth={5} showLabel={false} color="green" />
            </div>
          </div>
        </div>

      </div>


      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 select-none">
        
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder={t.searchTopics}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:border-emerald-500 shadow-sm font-medium"
          />
        </div>

        {/* Category filter */}
        <div className="relative min-w-[160px]">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
            <Filter size={14} />
          </span>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-955 text-sm focus:outline-none focus:border-emerald-500 shadow-sm font-semibold text-gray-600 dark:text-slate-300 cursor-pointer appearance-none"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
            ))}
          </select>
          <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-450 pointer-events-none">
            <ChevronDown size={14} />
          </span>
        </div>

      </div>

      {/* Main Grid area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start select-none">
        
        {/* Cards Grid list (2 columns) */}
        <div className="lg:col-span-2">
          {filteredTopics.length === 0 ? (
            <div className="bg-white dark:bg-slate-950 p-12 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800/80 text-center text-slate-400 text-sm select-none">
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
                    className="p-5 relative overflow-hidden flex flex-col justify-between border-slate-200/60 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Circle top check indicator for 100% completion */}
                    {isCompleted && (
                      <div className="absolute top-3.5 right-11 p-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 animate-pulse">
                        <CheckCircle size={16} fill="currentColor" className="text-white dark:text-slate-950" />
                      </div>
                    )}

                    <div className="space-y-4">
                      {/* Badge and options */}
                      <div className="flex justify-between items-start">
                        <PillBadge variant="green" className="scale-95 origin-left uppercase text-[9px] font-black tracking-wider select-none">
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
                      <h4 
                        onClick={() => setSelectedTopicId(topic._id)}
                        className="text-base font-bold text-gray-800 dark:text-white hover:text-emerald-500 cursor-pointer transition-colors leading-snug select-none min-h-[40px]"
                      >
                        {topic.title}
                      </h4>

                      {/* Progress Bar */}
                      <div>
                        <div className="flex justify-between items-baseline mb-1 select-none">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Progress</span>
                          <span className={`text-xs font-semibold ${isCompleted ? 'text-emerald-500' : 'text-slate-500'}`}>
                            {topic.progressPercent}%
                          </span>
                        </div>
                        <ProgressBar value={topic.progressPercent} color={isCompleted ? 'green' : 'pink'} />
                      </div>
                    </div>

                    {/* View details button links to deep curriculum page */}
                    <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/60 flex flex-col gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedTopicId(topic._id)}
                        className="w-full font-bold border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors text-xs"
                      >
                        View Curriculum
                      </Button>

                      {/* Accordion checkbox fallback checklist */}
                      <button
                        onClick={() => toggleAccordion(topic._id)}
                        className="w-full flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider hover:text-gray-900 dark:hover:text-white cursor-pointer pt-1"
                      >
                        <span>Checkbox Checklist ({topic.subTopics.filter(s => s.isDone).length}/{topic.subTopics.length})</span>
                        {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>

                      {isExpanded && (
                        <div className="space-y-2.5 pt-2 animate-scale-up border-t border-slate-50 dark:border-slate-800/40">
                          {topic.subTopics.map((sub, sIdx) => (
                            <div key={sIdx} className="flex items-center gap-2.5 justify-between">
                              <span className={`text-xs select-none leading-snug
                                ${sub.isDone ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-slate-350'}
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

                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar panels (1 column) */}
        <div className="space-y-6">
          
          {/* Category Breakdown Donut */}
          <Card title="Category Breakdown" className="border-slate-200/60 dark:border-slate-800/80 shadow-sm">
            {donutData.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No categories mapped yet.</p>
            ) : (
              <div className="flex flex-col gap-4 select-none">
                <div className="h-44">
                  <DonutChart data={donutData} height={170} centerLabel="Topics" centerValue={totalTopicsCount} />
                </div>
                
                {/* Custom list legends */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                  {donutData.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs font-medium text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-bold text-slate-800 dark:text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* CTA Box Level Up */}
          <div 
            className="rounded-2xl p-6 text-white select-none relative overflow-hidden shadow-sm space-y-4"
            style={{ background: 'linear-gradient(135deg, #10B981 0%, #7C3AED 100%)' }}
          >
            {/* Glow blobs */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
            
            <div className="p-3 rounded-full bg-white/10 text-white w-fit animate-bounce">
              <Sparkles size={20} />
            </div>
            <div className="space-y-1">
              <h5 className="text-sm font-bold tracking-tight">Level Up Your Skills</h5>
              <p className="text-xs text-white/85 leading-normal">
                Complete 5 more topics this week to hit your learning milestone target.
              </p>
            </div>
            <button className="bg-white hover:bg-gray-50 text-emerald-600 text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm w-full">
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
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Topic Name</label>
              <input 
                type="text" 
                placeholder="e.g. Graph Algorithms"
                value={newTopicTitle}
                onChange={e => setNewTopicTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 font-medium bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Category</label>
              <input 
                type="text" 
                placeholder="e.g. DSA or Frontend"
                value={newTopicCategory}
                onChange={e => setNewTopicCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 font-medium bg-white"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Sub-topics (One per line)</label>
            <textarea
              placeholder="BFS traversal&#10;DFS traversal&#10;Dijkstra's search"
              rows={4}
              value={newTopicSubtopics}
              onChange={e => setNewTopicSubtopics(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 bg-white"
            />
          </div>
          <Button type="submit" fullWidth className="py-2.5 font-bold mt-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-md">Add Topic</Button>
        </form>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        isOpen={!!confirmModal}
        onClose={() => setConfirmModal(null)}
        title={confirmModal?.title || 'Confirm Action'}
      >
        <div className="space-y-5 py-1">
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-semibold">
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
