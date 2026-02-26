import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Star, Clock, ArrowRight, CheckCircle2, Lock, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getEarnedBadges } from '@/lib/rewards';

interface DashboardProps {
  onStartPractice: (industry: string, customTopic?: string) => void;
  dailyGoal: number;
}

export function Dashboard({ onStartPractice, dailyGoal }: DashboardProps) {
  const [customTopic, setCustomTopic] = useState('');
  const [activeCategory, setActiveCategory] = useState<'Casual' | 'Professional'>('Casual');
  
  const earnedBadges = getEarnedBadges();
  const hasFirstStep = earnedBadges.includes('first_step');
  const hasHighFlyer = earnedBadges.includes('high_flyer');

  const learningPaths = {
    Casual: [
      { id: 'common-phrases', name: 'Common Phrases', level: 'Beginner', locked: false, color: 'bg-teal-100 text-teal-700', description: 'Essential everyday expressions and greetings.' },
      { id: 'native-say', name: 'Native: Say vs Don\'t Say', level: 'Intermediate', locked: !hasFirstStep, req: 'Complete 1 session', color: 'bg-orange-100 text-orange-700', description: 'Sound more natural by avoiding textbook phrases.' },
      { id: 'reductions', name: 'Reductions & Linking', level: 'Intermediate', locked: !hasFirstStep, req: 'Complete 1 session', color: 'bg-indigo-100 text-indigo-700', description: 'Understand "gonna", "wanna", and connected speech.' },
      { id: 'slang', name: 'Modern Slang', level: 'Advanced', locked: !hasHighFlyer, req: 'Score 90%+', color: 'bg-pink-100 text-pink-700', description: 'Current slang used in casual conversations.' },
    ],
    Professional: [
      { id: 'tech', name: 'Tech & Engineering', level: 'Intermediate', locked: false, color: 'bg-blue-100 text-blue-700', description: 'Master technical jargon and presentation skills.' },
      { id: 'medical', name: 'Medical & Health', level: 'Advanced', locked: !hasFirstStep, req: 'Complete 1 session', color: 'bg-emerald-100 text-emerald-700', description: 'Patient communication and medical terminology.' },
      { id: 'business', name: 'Business & Sales', level: 'Beginner', locked: false, color: 'bg-amber-100 text-amber-700', description: 'Negotiation, pitching, and professional etiquette.' },
      { id: 'academic', name: 'Academic Research', level: 'Advanced', locked: !hasHighFlyer, req: 'Score 90%+', color: 'bg-purple-100 text-purple-700', description: 'Presenting research and academic discussions.' },
    ]
  };

  return (
    <div className="space-y-8">
      <header>
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-serif font-bold text-stone-900 mb-2"
        >
          Good morning, Alex
        </motion.h1>
        <p className="text-stone-500">Ready to improve your pronunciation today?</p>
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
          <h2 className="text-2xl font-serif font-bold mb-2">Keep your streak alive!</h2>
          <p className="text-stone-600 mb-6 max-w-md">You're on a 12-day streak. Complete one roleplay session to reach your daily target of {dailyGoal} minutes.</p>
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
            <circle cx="50%" cy="50%" r="45%" className="stroke-terracotta-500 fill-none stroke-[8]" strokeDasharray="283" strokeDashoffset="100" strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-3xl font-bold font-serif">65%</span>
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

      {/* Learning Path */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <h3 className="text-xl font-serif font-bold">Your Learning Path</h3>
          
          <div className="bg-stone-100 p-1 rounded-xl inline-flex self-start sm:self-auto">
            {(['Casual', 'Professional'] as const).map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                  activeCategory === category
                    ? "bg-white text-stone-900 shadow-sm"
                    : "text-stone-500 hover:text-stone-700 hover:bg-stone-200/50"
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="wait">
            {learningPaths[activeCategory].map((path, index) => (
              <motion.div
                key={path.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "group relative bg-white rounded-2xl p-6 border border-stone-100 transition-all hover:shadow-md cursor-pointer",
                  path.locked && "opacity-75 bg-stone-50"
                )}
                onClick={() => !path.locked && onStartPractice(path.id)}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className={cn("text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wide", path.color)}>
                    {path.level}
                  </span>
                  {path.locked ? (
                      <div className="flex items-center gap-1 text-stone-400" title={path.req ? `Unlock: ${path.req}` : 'Locked'}>
                          {path.req && <span className="text-[10px] font-medium uppercase tracking-wide hidden group-hover:inline-block transition-all">{path.req}</span>}
                          <Lock size={18} />
                      </div>
                  ) : (
                      <ArrowRight size={18} className="text-stone-300 group-hover:text-olive-500 transition-colors" />
                  )}
                </div>
                
                <h4 className="text-lg font-bold mb-2">{path.name}</h4>
                <p className="text-stone-500 text-sm mb-4">{path.description}</p>
                
                <div className="flex items-center gap-4 text-xs text-stone-400">
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>5-10 min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={14} />
                    <span>+50 XP</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
