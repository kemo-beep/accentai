import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import { Clock, Zap, MessageSquare, TrendingUp, Mic, Search, Filter, X, ChevronLeft, ChevronRight, Download, Share2, Calendar, Award, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BADGES, getEarnedBadges } from '@/lib/rewards';
import { db } from '@/lib/db';
import { supabase } from '@/lib/supabase';

export function ProgressStats() {
  const [timeRange, setTimeRange] = useState('Weekly');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterIndustry, setFilterIndustry] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [earnedBadgeIds, setEarnedBadgeIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        try {
          // Fetch sessions
          const sessions = await db.getPracticeSessions(user.id);
          if (sessions) {
            const formattedHistory = sessions.map((s: any) => ({
              id: s.id,
              date: new Date(s.created_at).toLocaleString(),
              industry: s.industry,
              score: s.score,
              duration: `${Math.floor(s.duration / 60)} min`,
              durationSeconds: s.duration,
              tempo: s.transcript?.stats?.tempo || 0,
              fillerCount: s.transcript?.stats?.filler_count || 0,
              feedback: s.feedback || [],
              trend: [] // We could calculate trend if we had more data points per session
            }));
            setHistory(formattedHistory);
          }

          // Fetch badges
          const badges = await db.getUserBadges(user.id);
          if (badges) {
            setEarnedBadgeIds(badges.map(b => b.badge_id));
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      } else {
        // Fallback to local storage
        const localHistory = JSON.parse(localStorage.getItem('accent_ai_history') || '[]');
        setHistory(localHistory);
        setEarnedBadgeIds(getEarnedBadges());
      }
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const timeRanges = ['Daily', 'Weekly', '1 Month', '3 Months', 'Year', 'All Time'];

  // Mock data for different ranges (keep this for now as placeholder/demo)
  const getStatsForRange = (range: string) => {
    switch (range) {
      case 'Daily':
        return {
          chartData: [
            { name: '9 AM', score: 70 },
            { name: '12 PM', score: 85 },
            { name: '3 PM', score: 78 },
            { name: '6 PM', score: 92 },
            { name: '9 PM', score: 88 },
          ],
          summary: {
            tempo: 138,
            clarity: 82,
            time: '45',
            timeUnit: 'min',
            sessions: 5,
            clarityTrend: '+2% from yesterday'
          }
        };
      case 'Weekly':
        return {
          chartData: [
            { name: 'Mon', score: 65 },
            { name: 'Tue', score: 72 },
            { name: 'Wed', score: 68 },
            { name: 'Thu', score: 85 },
            { name: 'Fri', score: 82 },
            { name: 'Sat', score: 90 },
            { name: 'Sun', score: 88 },
          ],
          summary: {
            tempo: 145,
            clarity: 92,
            time: '4.5',
            timeUnit: 'hours',
            sessions: 12,
            clarityTrend: '+5% from last week'
          }
        };
      case '1 Month':
        return {
          chartData: [
            { name: 'Week 1', score: 75 },
            { name: 'Week 2', score: 78 },
            { name: 'Week 3', score: 82 },
            { name: 'Week 4', score: 88 },
          ],
          summary: {
            tempo: 142,
            clarity: 88,
            time: '18.2',
            timeUnit: 'hours',
            sessions: 45,
            clarityTrend: '+8% from last month'
          }
        };
      case '3 Months':
        return {
          chartData: [
            { name: 'Dec', score: 70 },
            { name: 'Jan', score: 78 },
            { name: 'Feb', score: 85 },
          ],
          summary: {
            tempo: 140,
            clarity: 85,
            time: '52.4',
            timeUnit: 'hours',
            sessions: 120,
            clarityTrend: '+12% from last quarter'
          }
        };
      case 'Year':
        return {
          chartData: [
            { name: 'Jan', score: 65 },
            { name: 'Feb', score: 70 },
            { name: 'Mar', score: 75 },
            { name: 'Apr', score: 72 },
            { name: 'May', score: 80 },
            { name: 'Jun', score: 85 },
            { name: 'Jul', score: 82 },
            { name: 'Aug', score: 88 },
            { name: 'Sep', score: 90 },
            { name: 'Oct', score: 87 },
            { name: 'Nov', score: 92 },
            { name: 'Dec', score: 95 },
          ],
          summary: {
            tempo: 144,
            clarity: 89,
            time: '180+',
            timeUnit: 'hours',
            sessions: 365,
            clarityTrend: '+25% this year'
          }
        };
      case 'All Time':
        return {
          chartData: [
            { name: '2024', score: 75 },
            { name: '2025', score: 88 },
            { name: '2026', score: 92 },
          ],
          summary: {
            tempo: 143,
            clarity: 90,
            time: '250+',
            timeUnit: 'hours',
            sessions: 480,
            clarityTrend: 'Consistent improvement'
          }
        };
      default:
        return { chartData: [], summary: { tempo: 0, clarity: 0, time: '0', timeUnit: 'min', sessions: 0, clarityTrend: '' } };
    }
  };
  
  const { chartData, summary } = getStatsForRange(timeRange); 

  const fillerWords = [
    { word: 'um', count: 12 },
    { word: 'like', count: 8 },
    { word: 'you know', count: 5 },
  ];

  // Get unique industries for filter
  const industries = Array.from(new Set(history.map(h => h.industry)));

  const filteredHistory = history.filter(session => {
    const matchesSearch = session.industry.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          session.date.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterIndustry ? session.industry === filterIndustry : true;
    return matchesSearch && matchesFilter;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredHistory.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentSessions = filteredHistory.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset page when filters change
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(1);
  }

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-olive-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Session Details Modal */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4" onClick={() => setSelectedSession(null)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-stone-100 flex items-start justify-between bg-stone-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-olive-100 flex items-center justify-center text-olive-600 shadow-inner">
                  <Mic size={24} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-2xl text-stone-900">{selectedSession.industry}</h3>
                  <div className="flex items-center gap-2 text-stone-500 text-sm mt-1">
                    <Calendar size={14} />
                    <span>{selectedSession.date}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedSession(null)} 
                className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400 hover:text-stone-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 md:p-8 overflow-y-auto space-y-6 md:space-y-8">
              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <div className="bg-stone-50 p-3 md:p-4 rounded-2xl border border-stone-100 flex flex-col items-center text-center">
                  <div className="mb-2 p-2 bg-white rounded-full shadow-sm text-emerald-500">
                    <Award size={20} />
                  </div>
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-wide mb-1">Score</p>
                  <p className="text-xl md:text-2xl font-serif font-bold text-stone-900">{selectedSession.score}%</p>
                </div>
                <div className="bg-stone-50 p-3 md:p-4 rounded-2xl border border-stone-100 flex flex-col items-center text-center">
                  <div className="mb-2 p-2 bg-white rounded-full shadow-sm text-blue-500">
                    <Clock size={20} />
                  </div>
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-wide mb-1">Duration</p>
                  <p className="text-xl md:text-2xl font-serif font-bold text-stone-900">{selectedSession.duration}</p>
                </div>
                <div className="bg-stone-50 p-3 md:p-4 rounded-2xl border border-stone-100 flex flex-col items-center text-center">
                  <div className="mb-2 p-2 bg-white rounded-full shadow-sm text-amber-500">
                    <Zap size={20} />
                  </div>
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-wide mb-1">Tempo</p>
                  <p className="text-xl md:text-2xl font-serif font-bold text-stone-900">{selectedSession.tempo || 140}</p>
                  <span className="text-[10px] text-stone-400">wpm</span>
                </div>
                <div className="bg-stone-50 p-3 md:p-4 rounded-2xl border border-stone-100 flex flex-col items-center text-center">
                  <div className="mb-2 p-2 bg-white rounded-full shadow-sm text-terracotta-500">
                    <MessageSquare size={20} />
                  </div>
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-wide mb-1">Fillers</p>
                  <p className="text-xl md:text-2xl font-serif font-bold text-stone-900">{selectedSession.fillerCount || 0}</p>
                  <span className="text-[10px] text-stone-400">detected</span>
                </div>
              </div>

              {/* Performance Chart */}
              <div className="bg-white rounded-2xl border border-stone-100 p-4 md:p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4 md:mb-6">
                  <Activity size={18} className="text-stone-400" />
                  <h4 className="font-bold text-stone-900">Performance Trend</h4>
                </div>
                <div className="h-40 md:h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={(selectedSession.trend || [selectedSession.score, selectedSession.score]).map((val: number, i: number) => ({ i, val }))}>
                      <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={selectedSession.score >= 90 ? "#10b981" : "#f59e0b"} stopOpacity={0.1}/>
                          <stop offset="95%" stopColor={selectedSession.score >= 90 ? "#10b981" : "#f59e0b"} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="i" hide />
                      <YAxis domain={[60, 100]} hide />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        formatter={(value: number) => [`${value}%`, 'Score']}
                        labelFormatter={() => ''}
                        cursor={{ stroke: '#e5e5e5', strokeWidth: 1, strokeDasharray: '4 4' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="val" 
                        stroke={selectedSession.score >= 90 ? "#10b981" : selectedSession.score >= 80 ? "#f59e0b" : "#ef4444"} 
                        fill="url(#colorScore)" 
                        strokeWidth={3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Feedback Section */}
              <div>
                <h4 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
                  <MessageSquare size={18} className="text-stone-400" />
                  Key Feedback
                </h4>
                <div className="space-y-3">
                  {(selectedSession.feedback || ['Great job overall!', 'Keep practicing your pacing.', 'Watch out for filler words.']).map((item: string, idx: number) => (
                    <div key={idx} className="flex gap-3 p-4 bg-stone-50 rounded-xl border border-stone-100">
                      <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-olive-600 shadow-sm flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold">{idx + 1}</span>
                      </div>
                      <p className="text-stone-700 text-sm leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-stone-100 bg-stone-50/50 flex flex-col-reverse sm:flex-row justify-between items-center gap-4">
              <button className="w-full sm:w-auto flex items-center justify-center gap-2 text-stone-500 hover:text-stone-800 font-medium text-sm transition-colors px-4 py-3 sm:py-2 rounded-lg hover:bg-stone-100">
                <Download size={18} />
                Export Report
              </button>
              <button 
                onClick={() => setSelectedSession(null)}
                className="w-full sm:w-auto px-8 py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl transition-colors shadow-lg shadow-stone-900/10"
              >
                Close Details
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <header>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
            <div>
                <h1 className="text-3xl font-serif font-bold text-stone-900 mb-2">Your Progress</h1>
                <p className="text-stone-500">Great job on your last session! Here's how you're doing.</p>
            </div>
            
            <div className="bg-stone-100 p-1 rounded-xl inline-flex flex-wrap gap-1">
                {timeRanges.map((range) => (
                    <button
                        key={range}
                        onClick={() => setTimeRange(range)}
                        className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                            timeRange === range 
                                ? "bg-white text-stone-900 shadow-sm" 
                                : "text-stone-500 hover:text-stone-700 hover:bg-stone-200/50"
                        )}
                    >
                        {range}
                    </button>
                ))}
            </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-stone-500">
            <Zap size={18} />
            <span className="text-sm font-medium uppercase tracking-wide">Avg Tempo</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-serif font-bold text-stone-900">{summary.tempo}</span>
            <span className="text-sm text-stone-400 mb-1">wpm</span>
          </div>
          <p className="text-xs text-emerald-600 mt-2 font-medium">Perfect conversational pace</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-stone-500">
            <MessageSquare size={18} />
            <span className="text-sm font-medium uppercase tracking-wide">Clarity Score</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-serif font-bold text-stone-900">{summary.clarity}%</span>
          </div>
          <p className="text-xs text-emerald-600 mt-2 font-medium">{summary.clarityTrend}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-stone-500">
            <Clock size={18} />
            <span className="text-sm font-medium uppercase tracking-wide">Practice Time</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-serif font-bold text-stone-900">{summary.time}</span>
            <span className="text-sm text-stone-400 mb-1">{summary.timeUnit}</span>
          </div>
          <p className="text-xs text-stone-400 mt-2">{timeRange}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-stone-500">
            <TrendingUp size={18} />
            <span className="text-sm font-medium uppercase tracking-wide">Total Sessions</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-serif font-bold text-stone-900">
                {summary.sessions}
            </span>
          </div>
          <p className="text-xs text-stone-400 mt-2">In selected period</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart */}
        <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm">
          <h3 className="font-serif font-bold text-lg mb-6">Pronunciation Score Trend</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#a8a29e', fontSize: 12 }} 
                  dy={10}
                />
                <Tooltip 
                  cursor={{ fill: '#f5f5f4' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="score" radius={[4, 4, 4, 4]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#5A5A40' : '#E6E6E6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Filler Words */}
        <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm">
          <h3 className="font-serif font-bold text-lg mb-6">Filler Words Detected</h3>
          <div className="space-y-4">
            {fillerWords.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="font-mono text-lg text-stone-700">"{item.word}"</span>
                <div className="flex items-center gap-3 flex-1 ml-4">
                  <div className="h-2 bg-stone-100 rounded-full flex-1 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.count / 15) * 100}%` }}
                      className="h-full bg-terracotta-500 rounded-full"
                    />
                  </div>
                  <span className="text-sm font-bold text-stone-500 w-6">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 p-4 bg-cream-100 rounded-xl text-sm text-stone-600">
            <p><strong>Tip:</strong> Try pausing silently instead of saying "um" when you need to think. It makes you sound more confident.</p>
          </div>
        </div>
      </div>

      {/* Badges Section */}
      <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-6 md:p-8">
        <h3 className="font-serif font-bold text-lg mb-6 flex items-center gap-2">
            <Award className="text-olive-500" size={24} />
            Achievements
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {BADGES.map(badge => {
                const isEarned = earnedBadgeIds.includes(badge.id);
                return (
                    <div 
                        key={badge.id} 
                        className={cn(
                            "flex flex-col items-center text-center p-4 rounded-2xl border transition-all",
                            isEarned 
                                ? "bg-white border-stone-200 shadow-sm" 
                                : "bg-stone-50 border-stone-100 opacity-60 grayscale"
                        )}
                    >
                        <div className={cn(
                            "w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-3 shadow-sm",
                            isEarned ? badge.color.replace('text-', 'bg-').split(' ')[0] + " bg-opacity-20" : "bg-stone-200"
                        )}>
                            {badge.icon}
                        </div>
                        <h4 className="font-bold text-stone-900 text-sm mb-1">{badge.name}</h4>
                        <p className="text-xs text-stone-500 leading-tight">{badge.description}</p>
                        {isEarned && (
                            <span className="mt-2 text-[10px] font-bold uppercase tracking-wide text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                Earned
                            </span>
                        )}
                    </div>
                );
            })}
        </div>
      </div>

      {/* History Section */}
      <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="font-serif font-bold text-lg">Recent Sessions</h3>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
              <input 
                type="text" 
                placeholder="Search sessions..." 
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-olive-500/20 focus:border-olive-500 w-full md:w-64 transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => { setSearchQuery(''); setCurrentPage(1); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={cn(
                  "p-2 rounded-xl border transition-colors flex items-center gap-2",
                  filterIndustry || isFilterOpen ? "bg-olive-50 border-olive-200 text-olive-700" : "bg-white border-stone-200 text-stone-500 hover:bg-stone-50"
                )}
              >
                <Filter size={18} />
                {filterIndustry && <span className="text-xs font-bold max-w-[100px] truncate hidden md:inline">{filterIndustry}</span>}
              </button>
              
              {isFilterOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsFilterOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-stone-100 p-2 z-20">
                    <div className="text-xs font-bold text-stone-400 px-3 py-2 uppercase tracking-wide">Filter by Industry</div>
                    <button 
                      onClick={() => { setFilterIndustry(null); setIsFilterOpen(false); setCurrentPage(1); }}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                        !filterIndustry ? "bg-olive-50 text-olive-700 font-medium" : "text-stone-600 hover:bg-stone-50"
                      )}
                    >
                      All Industries
                    </button>
                    {industries.map(ind => (
                      <button 
                        key={ind}
                        onClick={() => { setFilterIndustry(ind); setIsFilterOpen(false); setCurrentPage(1); }}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors truncate",
                          filterIndustry === ind ? "bg-olive-50 text-olive-700 font-medium" : "text-stone-600 hover:bg-stone-50"
                        )}
                      >
                        {ind}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="divide-y divide-stone-100">
          {currentSessions.length > 0 ? (
            <>
              {currentSessions.map((session) => (
                <div 
                  key={session.id} 
                  onClick={() => setSelectedSession(session)}
                  className="p-6 flex items-center justify-between hover:bg-stone-50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-4 min-w-[200px]">
                    <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 group-hover:bg-white group-hover:shadow-sm transition-all">
                      <Mic size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-900 group-hover:text-olive-600 transition-colors">{session.industry}</h4>
                      <p className="text-sm text-stone-500">{session.date} • {session.duration}</p>
                    </div>
                  </div>
                  
                  {/* Sparkline */}
                  <div className="hidden md:block h-10 w-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={(session.trend || [session.score, session.score]).map((val: number, i: number) => ({ i, val }))}>
                        <Area 
                          type="monotone" 
                          dataKey="val" 
                          stroke={session.score >= 90 ? "#10b981" : session.score >= 80 ? "#f59e0b" : "#ef4444"} 
                          fill={session.score >= 90 ? "#d1fae5" : session.score >= 80 ? "#fef3c7" : "#fee2e2"} 
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="block text-lg font-bold text-stone-900">{session.score}%</span>
                      <span className="text-xs text-stone-500 uppercase tracking-wide">Score</span>
                    </div>
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      session.score >= 90 ? "bg-emerald-500" : session.score >= 80 ? "bg-amber-500" : "bg-red-500"
                    )} />
                  </div>
                </div>
              ))}
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-stone-100 flex items-center justify-between bg-stone-50/50">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg hover:bg-stone-100 disabled:opacity-50 disabled:cursor-not-allowed text-stone-500 transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {getPageNumbers().map((page, idx) => (
                      typeof page === 'number' ? (
                        <button
                          key={idx}
                          onClick={() => setCurrentPage(page)}
                          className={cn(
                            "w-8 h-8 rounded-lg text-sm font-medium transition-colors",
                            currentPage === page
                              ? "bg-olive-500 text-white"
                              : "text-stone-600 hover:bg-stone-100"
                          )}
                        >
                          {page}
                        </button>
                      ) : (
                        <span key={idx} className="w-8 h-8 flex items-center justify-center text-stone-400">
                          ...
                        </span>
                      )
                    ))}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg hover:bg-stone-100 disabled:opacity-50 disabled:cursor-not-allowed text-stone-500 transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="p-12 text-center text-stone-500">
              <p>No sessions found matching your criteria.</p>
              <button 
                onClick={() => { setSearchQuery(''); setFilterIndustry(null); setCurrentPage(1); }}
                className="text-olive-500 font-medium mt-2 hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
