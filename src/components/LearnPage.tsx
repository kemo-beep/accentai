import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, 
  BookOpen, 
  MessageCircle, 
  Target, 
  ArrowRight, 
  Lightbulb, 
  Users, 
  Layers,
  Lock,
  Star,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { db } from '@/lib/db';
import { getEarnedBadges } from '@/lib/rewards';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface LearnPageProps {
  onStartPractice: (industry: string, customTopic?: string) => void;
  onCourseSelect: (courseId: string) => void;
}

export function LearnPage({ onStartPractice, onCourseSelect }: LearnPageProps) {
  const [activeCategory, setActiveCategory] = useState<'Casual' | 'Professional' | 'Drills'>('Casual');
  const [earnedBadgeIds, setEarnedBadgeIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchBadges = async () => {
      let userId = null;
      
      if (isSupabaseConfigured) {
        try {
            const { data } = await supabase.auth.getUser();
            userId = data.user?.id;
        } catch (e) {
            console.warn("Failed to fetch user:", e);
        }
      }
      
      if (userId) {
        try {
          const badges = await db.getUserBadges(userId);
          if (badges) {
            setEarnedBadgeIds(badges.map(b => b.badge_id));
          }
        } catch (error) {
          console.error("Error fetching badges:", error);
        }
      } else {
        setEarnedBadgeIds(getEarnedBadges());
      }
    };

    fetchBadges();
  }, []);

  const hasFirstStep = earnedBadgeIds.includes('first_step');
  const hasHighFlyer = earnedBadgeIds.includes('high_flyer');

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
    ],
    Drills: [
      { id: 'impromptu', name: 'Impromptu Speaking', level: 'Advanced', locked: false, color: 'bg-rose-100 text-rose-700', description: 'Practice thinking on your feet with random topics.' },
    ]
  };

  const modules = [
    {
      id: 'clear-thinking',
      title: 'Clear Thinking',
      description: 'Learn to organize your thoughts and articulate complex ideas with precision.',
      icon: Brain,
      color: 'bg-blue-100 text-blue-700',
      lessons: 12,
      duration: '2.5h'
    },
    {
      id: 'storytelling',
      title: 'Storytelling',
      description: 'Master the art of narrative to engage your audience and make your message memorable.',
      icon: BookOpen,
      color: 'bg-amber-100 text-amber-700',
      lessons: 8,
      duration: '1.5h'
    },
    {
      id: 'persuasion',
      title: 'Persuasion',
      description: 'Techniques to influence others and effectively advocate for your ideas.',
      icon: Users,
      color: 'bg-rose-100 text-rose-700',
      lessons: 10,
      duration: '2h'
    },
    {
      id: 'structure-focus',
      title: 'Structure & Focus',
      description: 'Frameworks to keep your communication concise, logical, and on-point.',
      icon: Layers,
      color: 'bg-emerald-100 text-emerald-700',
      lessons: 15,
      duration: '3h'
    },
    {
      id: 'active-listening',
      title: 'Active Listening',
      description: 'Improve your communication by becoming a better, more empathetic listener.',
      icon: MessageCircle,
      color: 'bg-purple-100 text-purple-700',
      lessons: 6,
      duration: '1h'
    },
    {
      id: 'strategic-brevity',
      title: 'Strategic Brevity',
      description: 'Say more with less. Learn the power of concise communication.',
      icon: Target,
      color: 'bg-teal-100 text-teal-700',
      lessons: 5,
      duration: '45m'
    }
  ];

  return (
    <div className="space-y-12">
      <header>
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-serif font-bold text-stone-900 mb-2"
        >
          Learning Center
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-stone-500 max-w-2xl"
        >
          Expand your communication toolkit with in-depth courses on soft skills and strategy.
        </motion.p>
      </header>

      {/* Learning Path Section */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <h3 className="text-xl font-serif font-bold">Your Learning Path</h3>
          
          <div className="bg-stone-100 p-1 rounded-xl inline-flex self-start sm:self-auto">
            {(['Casual', 'Professional', 'Drills'] as const).map((category) => (
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

      {/* Skill Courses Section */}
      <section>
        <h3 className="text-xl font-serif font-bold mb-6">Skill Courses</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module, index) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 + 0.2 }}
              onClick={() => onCourseSelect(module.id)}
              className="group bg-white rounded-2xl p-6 border border-stone-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={cn("p-3 rounded-xl", module.color)}>
                  <module.icon size={24} />
                </div>
                <div className="bg-stone-50 text-stone-500 text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wide">
                  Course
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-stone-900 mb-2 group-hover:text-olive-600 transition-colors">
                {module.title}
              </h3>
              <p className="text-stone-500 text-sm mb-6 flex-grow">
                {module.description}
              </p>
              
              <div className="flex items-center justify-between pt-4 border-t border-stone-50 mt-auto">
                <div className="flex items-center gap-4 text-xs text-stone-400 font-medium">
                  <span className="flex items-center gap-1">
                    <Layers size={14} />
                    {module.lessons} Lessons
                  </span>
                  <span className="flex items-center gap-1">
                    <Lightbulb size={14} />
                    {module.duration}
                  </span>
                </div>
                <button className="text-olive-500 hover:text-olive-600 transition-colors">
                  <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="bg-stone-900 rounded-3xl p-8 text-center text-white relative overflow-hidden"
      >
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-2xl font-serif font-bold mb-4">Suggest a Topic</h2>
          <p className="text-stone-300 mb-6">
            Is there a specific communication skill you'd like to master? Let us know and we'll consider adding it to our curriculum.
          </p>
          <button className="bg-white text-stone-900 hover:bg-stone-100 px-6 py-3 rounded-xl font-bold transition-colors">
            Submit Suggestion
          </button>
        </div>
        
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-olive-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-terracotta-500/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </motion.div>
    </div>
  );
}
