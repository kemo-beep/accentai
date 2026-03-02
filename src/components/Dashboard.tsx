import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Play, CheckCircle2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { db } from '@/lib/db';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface DashboardProps {
  onStartPractice: (industry: string, customTopic?: string) => void;
  dailyGoal: number;
  userName?: string;
}

export function Dashboard({ onStartPractice, dailyGoal, userName }: DashboardProps) {
  const [customTopic, setCustomTopic] = useState('');
  const [todayMinutes, setTodayMinutes] = useState(0);
  const [weeklySessions, setWeeklySessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      let user = null;
      if (isSupabaseConfigured) {
        try {
            const { data } = await supabase.auth.getUser();
            user = data.user;
        } catch (e) {
            console.warn("Failed to fetch user:", e);
        }
      }
      
      if (user) {
        try {
          // Fetch sessions
          const sessions = await db.getPracticeSessions(user.id);
          if (sessions) {
            setWeeklySessions(sessions);
            const today = new Date().toDateString();
            const minutes = sessions.reduce((acc: number, session: any) => {
              const sessionDate = new Date(session.created_at).toDateString();
              if (sessionDate === today) {
                return acc + (session.duration / 60);
              }
              return acc;
            }, 0);
            setTodayMinutes(Math.round(minutes));
          }
        } catch (error) {
          console.error("Error fetching dashboard data:", error);
        }
      } else {
        // Fallback to local storage
        const localHistory = JSON.parse(localStorage.getItem('accent_ai_history') || '[]');
        setWeeklySessions(localHistory);
        
        const today = new Date().toDateString();
        const minutes = localHistory.reduce((acc: number, session: any) => {
            // Handle both date formats (locale string vs ISO) - simple check
            const sessionDate = new Date(session.id).toDateString(); // ID is timestamp
            if (sessionDate === today) {
                 // Handle both duration formats
                 if (session.durationSeconds) return acc + (session.durationSeconds / 60);
                 return acc + parseInt(session.duration);
            }
            return acc;
        }, 0);
        setTodayMinutes(Math.round(minutes));
      }
      setIsLoading(false);
    };

    fetchData();
  }, []);
  
  // Helper to get current week days (Mon-Sun)
  const getWeekDays = () => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0-6, Sun-Sat
    const numDay = now.getDate();

    const start = new Date(now);
    // If Sunday (0), subtract 6 to get previous Monday. Otherwise subtract dayOfWeek - 1
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    start.setDate(numDay - daysToSubtract);
    start.setHours(0, 0, 0, 0);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const weekDays = getWeekDays();
  const todayDateString = new Date().toDateString();

  const hasSessionOnDate = (date: Date) => {
    const dateString = date.toDateString();
    return weeklySessions.some(session => {
      const sessionDate = session.created_at 
        ? new Date(session.created_at).toDateString() 
        : new Date(session.id).toDateString();
      return sessionDate === dateString;
    });
  };

  const progressPercentage = Math.min(100, Math.round((todayMinutes / dailyGoal) * 100));
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  return (
    <div className="space-y-8">
      <header>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl font-serif font-bold text-stone-900 mb-2"
            >
              Good morning, {userName || 'Guest'}
            </motion.h1>
            <p className="text-stone-500">Ready to improve your pronunciation today?</p>
          </div>
        </div>
      </header>

      {/* Daily Goal Card */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-stone-100 flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-terracotta-500 text-white text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide">Daily Goal</span>
            <span className="text-stone-400 text-sm">{dailyGoal} mins target</span>
          </div>
          <h2 className="text-2xl font-serif font-bold mb-2">
            {progressPercentage >= 100 ? "Goal Achieved!" : "Keep your streak alive!"}
          </h2>
          <p className="text-stone-600 mb-6 max-w-md">
            {progressPercentage >= 100 
                ? "You've hit your daily target! Feel free to practice more." 
                : `You've practiced ${todayMinutes} minutes today. Complete another session to reach your target.`}
          </p>

          {/* Weekly Calendar Strip */}
          <div className="w-full mb-8">
            <div className="flex items-center justify-between md:justify-start gap-2 md:gap-4">
              {weekDays.map((date, i) => {
                const isToday = date.toDateString() === todayDateString;
                const hasSession = hasSessionOnDate(date);
                const dayName = date.toLocaleDateString('en-US', { weekday: 'narrow' });
                
                return (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">{dayName}</span>
                    <div className={cn(
                      "w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all shadow-sm",
                      isToday ? "ring-2 ring-stone-900 ring-offset-2" : "",
                      hasSession 
                        ? "bg-olive-500 text-white shadow-olive-200" 
                        : isToday 
                          ? "bg-stone-900 text-white" 
                          : "bg-stone-50 text-stone-400"
                    )}>
                      {hasSession ? <CheckCircle2 size={16} /> : date.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button 
            onClick={() => onStartPractice('general')}
            className="bg-olive-500 hover:bg-olive-600 text-white px-6 py-3 rounded-full font-medium transition-colors flex items-center gap-2"
          >
            <Play size={18} fill="currentColor" />
            Start Quick Session
          </button>
        </div>
        <div className="relative w-32 h-32 md:w-40 md:h-40 flex-shrink-0">
          {/* Simple circular progress visualization */}
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="50%" cy="50%" r="45%" className="stroke-cream-100 fill-none stroke-[8]" />
            <circle 
                cx="50%" 
                cy="50%" 
                r="45%" 
                className="stroke-terracotta-500 fill-none stroke-[8] transition-all duration-1000 ease-out" 
                strokeDasharray={circumference} 
                strokeDashoffset={strokeDashoffset} 
                strokeLinecap="round" 
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-3xl font-bold font-serif">{progressPercentage}%</span>
          </div>
        </div>
      </motion.section>

      {/* Custom Practice Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-r from-stone-900 to-stone-800 rounded-3xl p-6 md:p-8 shadow-md text-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <Sparkles size={120} />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
          <div className="max-w-lg">
            <div className="flex items-center gap-2 mb-2 text-stone-300">
              <Sparkles size={16} className="text-yellow-400" />
              <span className="text-xs font-bold uppercase tracking-wide">Custom Scenario</span>
            </div>
            <h3 className="text-xl font-serif font-bold mb-2">Practice Anything</h3>
            <p className="text-stone-300 text-sm">
              Preparing for a specific interview, presentation, or conversation? Enter your topic and let the AI simulate it for you.
            </p>
          </div>
          
          <div className="flex w-full md:w-auto gap-2 flex-col sm:flex-row">
            <input
              type="text"
              placeholder="e.g., Negotiating a salary raise..."
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              className="flex-1 md:w-72 px-4 py-3 rounded-xl border-0 bg-white/10 text-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm transition-all"
            />
            <button
              onClick={() => {
                if (customTopic.trim()) {
                  onStartPractice('custom', customTopic);
                }
              }}
              disabled={!customTopic.trim()}
              className="bg-white hover:bg-stone-100 disabled:opacity-50 disabled:cursor-not-allowed text-stone-900 px-6 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Play size={18} fill="currentColor" />
              Start
            </button>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
