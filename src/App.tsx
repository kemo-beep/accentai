import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { LearnPage } from './components/LearnPage';
import { CourseDetail } from './components/CourseDetail';
import { LessonView } from './components/LessonView';
import { PracticeSession } from './components/PracticeSession';
import { ProgressStats } from './components/ProgressStats';
import { AuthModal } from './components/AuthModal';
import { Mic } from 'lucide-react';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { CLEAR_THINKING_COURSE } from '@/data/courses';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [customTopic, setCustomTopic] = useState<string | null>(null);
  const [targetAccent, setTargetAccent] = useState(() => {
    const saved = localStorage.getItem('user_target_accent');
    return saved || 'General American';
  });
  const [isEditingAccent, setIsEditingAccent] = useState(false);

  const [dailyGoal, setDailyGoal] = useState(() => {
    const saved = localStorage.getItem('user_daily_goal');
    return saved ? parseInt(saved) : 15;
  });
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [micPermissionGranted, setMicPermissionGranted] = useState(false);
  const [showMicModal, setShowMicModal] = useState(false);
  const [pendingPractice, setPendingPractice] = useState<{industry: string, topic?: string} | null>(null);
  
  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<{name: string, email: string} | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setIsLoggedIn(true);
        setUser({
          name: session.user.user_metadata.full_name || 'User',
          email: session.user.email || '',
        });
      }
    }).catch(err => {
      console.warn("Supabase auth session check failed:", err);
      // Gracefully handle the error - user stays logged out
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setIsLoggedIn(true);
        setUser({
          name: session.user.user_metadata.full_name || 'User',
          email: session.user.email || '',
        });
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem('user_target_accent', targetAccent);
  }, [targetAccent]);

  useEffect(() => {
    localStorage.setItem('user_daily_goal', dailyGoal.toString());
  }, [dailyGoal]);

  const handleLogin = (userData: { name: string; email: string }) => {
    // State updates are handled by onAuthStateChange listener
    setShowAuthModal(false);
    
    // If there was a pending practice session, start it
    if (pendingPractice) {
        handleStartPractice(pendingPractice.industry, pendingPractice.topic);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setActiveTab('dashboard'); // Redirect to dashboard
  };

  useEffect(() => {
    // Check initial permission state
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'microphone' as PermissionName })
        .then((permissionStatus) => {
          setMicPermissionGranted(permissionStatus.state === 'granted');
          permissionStatus.onchange = () => {
             setMicPermissionGranted(permissionStatus.state === 'granted');
          };
        })
        .catch(() => {
          // Fallback or ignore if not supported
        });
    }
  }, []);

  const goalOptions = [5, 10, 15, 20, 30, 45, 60];

  const handleStartPractice = (industry: string, topic?: string) => {
    if (!isLoggedIn) {
        setPendingPractice({ industry, topic });
        setShowAuthModal(true);
        return;
    }

    if (micPermissionGranted) {
      setSelectedIndustry(industry);
      setCustomTopic(topic || null);
      setActiveTab('practice');
    } else {
      setPendingPractice({ industry, topic });
      setShowMicModal(true);
    }
  };

  const [micError, setMicError] = useState<string | null>(null);

  const requestMicrophoneAccess = async () => {
    setMicError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setMicPermissionGranted(true);
      setShowMicModal(false);
      
      if (pendingPractice) {
        setSelectedIndustry(pendingPractice.industry);
        setCustomTopic(pendingPractice.topic || null);
        setActiveTab('practice');
        setPendingPractice(null);
      }
    } catch (err) {
      console.error('Microphone permission denied:', err);
      setMicError("Permission denied. Please enable microphone access in your browser settings.");
    }
  };

  const accents = [
    { id: 'General American', label: 'General American', flag: '🇺🇸' },
    { id: 'British (RP)', label: 'British (RP)', flag: '🇬🇧' },
    { id: 'Australian', label: 'Australian', flag: '🇦🇺' },
    { id: 'Indian', label: 'Indian', flag: '🇮🇳' },
    { id: 'Canadian', label: 'Canadian', flag: '🇨🇦' },
  ];

  const handleTabChange = (tab: string) => {
    if (tab === 'practice') {
        if (!isLoggedIn) {
            setShowAuthModal(true);
            return;
        }
        if (!micPermissionGranted) {
            setPendingPractice({ industry: selectedIndustry || 'general', topic: customTopic || undefined });
            setShowMicModal(true);
            return;
        }
    }
    setActiveTab(tab);
    if (tab !== 'course') {
      setActiveCourseId(null);
    }
    setActiveLessonId(null);
  };

  const handleCourseSelect = (courseId: string) => {
    setActiveCourseId(courseId);
    setActiveTab('course');
  };

  const handleStartLesson = (lessonId: string) => {
    setActiveLessonId(lessonId);
  };

  const handleLessonComplete = () => {
    // Logic to mark lesson as complete would go here
    // For now, just find the next lesson
    if (!activeLessonId) return;
    
    // Simple logic to find next lesson
    let foundCurrent = false;
    let nextLessonId = null;
    
    for (const module of CLEAR_THINKING_COURSE.modules) {
      for (const lesson of module.lessons) {
        if (foundCurrent) {
          nextLessonId = lesson.id;
          break;
        }
        if (lesson.id === activeLessonId) {
          foundCurrent = true;
        }
      }
      if (nextLessonId) break;
    }

    if (nextLessonId) {
      setActiveLessonId(nextLessonId);
    } else {
      // Course complete!
      setActiveLessonId(null);
      setActiveTab('stats'); // Or back to course detail
    }
  };

  // Find current lesson object
  const currentLesson = activeLessonId 
    ? CLEAR_THINKING_COURSE.modules.flatMap(m => m.lessons).find(l => l.id === activeLessonId)
    : null;

  return (
    <Layout 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
        isLoggedIn={isLoggedIn} 
        user={user} 
        onLoginClick={() => setShowAuthModal(true)}
        onLogoutClick={handleLogout}
    >
      {activeTab === 'dashboard' && (
        <Dashboard onStartPractice={handleStartPractice} dailyGoal={dailyGoal} userName={user?.name} />
      )}
      {activeTab === 'learn' && (
        <LearnPage onStartPractice={handleStartPractice} onCourseSelect={handleCourseSelect} />
      )}
      {activeTab === 'course' && activeCourseId && !activeLessonId && (
        <CourseDetail 
          courseId={activeCourseId} 
          onBack={() => setActiveTab('learn')}
          onStartLesson={handleStartLesson}
        />
      )}
      {activeTab === 'course' && activeLessonId && currentLesson && (
        <LessonView 
          lesson={currentLesson}
          onBack={() => setActiveLessonId(null)}
          onComplete={() => {}}
          onNext={handleLessonComplete}
          hasNext={true} // Simplified for now
        />
      )}
      {activeTab === 'practice' && (
        <PracticeSession 
          industry={selectedIndustry || 'general'} 
          customTopic={customTopic}
          targetAccent={targetAccent}
          onComplete={() => setActiveTab('stats')}
          onExit={() => setActiveTab('dashboard')}
        />
      )}
      {activeTab === 'stats' && (
        <ProgressStats />
      )}
      {activeTab === 'profile' && (
        <div className="max-w-2xl mx-auto space-y-8">
          <header>
            <h1 className="text-3xl font-serif font-bold text-stone-900 mb-2">My Profile</h1>
            <p className="text-stone-500">Manage your account and preferences.</p>
          </header>

          <div className="bg-white rounded-3xl p-8 border border-stone-100 shadow-sm flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-olive-500 flex items-center justify-center text-white font-serif font-bold text-4xl">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-stone-900">{user?.name || 'Guest User'}</h2>
              <p className="text-stone-500">{user?.email || 'Please log in'}</p>
              {isLoggedIn && (
                  <div className="flex items-center gap-2 mt-3">
                    <span className="bg-stone-100 text-stone-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Premium Member</span>
                    <span className="bg-olive-100 text-olive-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Level 4</span>
                  </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-stone-100">
              <h3 className="font-bold text-lg">Preferences</h3>
            </div>
            <div className="divide-y divide-stone-100">
              <div className="p-6 flex flex-col gap-4 hover:bg-stone-50 transition-colors cursor-pointer" onClick={() => setIsEditingAccent(!isEditingAccent)}>
                <div className="flex items-center justify-between w-full">
                  <div>
                    <p className="font-medium text-stone-900">Target Accent</p>
                    <p className="text-sm text-stone-500 flex items-center gap-2">
                       <span>{accents.find(a => a.id === targetAccent)?.flag}</span>
                       {targetAccent}
                    </p>
                  </div>
                  <div className="text-olive-500 font-medium text-sm">{isEditingAccent ? 'Done' : 'Change'}</div>
                </div>
                
                <AnimatePresence>
                  {isEditingAccent && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 overflow-hidden" 
                      onClick={(e) => e.stopPropagation()}
                    >
                       {accents.map(accent => (
                         <button
                           key={accent.id}
                           onClick={() => {
                             setTargetAccent(accent.id);
                             setIsEditingAccent(false);
                           }}
                           className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all text-left flex items-center gap-3 ${
                             targetAccent === accent.id 
                               ? "bg-olive-50 border-olive-500 text-olive-900 ring-1 ring-olive-500" 
                               : "bg-white border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50"
                           }`}
                         >
                           <span className="text-xl">{accent.flag}</span>
                           <span className="flex-1">{accent.label}</span>
                           {targetAccent === accent.id && (
                             <div className="w-2 h-2 rounded-full bg-olive-500" />
                           )}
                         </button>
                       ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="p-6 flex flex-col gap-4 hover:bg-stone-50 transition-colors cursor-pointer" onClick={() => setIsEditingGoal(!isEditingGoal)}>
                <div className="flex items-center justify-between w-full">
                  <div>
                    <p className="font-medium text-stone-900">Daily Goal</p>
                    <p className="text-sm text-stone-500">{dailyGoal} minutes / day</p>
                  </div>
                  <div className="text-olive-500 font-medium text-sm">{isEditingGoal ? 'Done' : 'Edit'}</div>
                </div>

                <AnimatePresence>
                  {isEditingGoal && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="flex flex-wrap gap-2 mt-2 overflow-hidden" 
                      onClick={(e) => e.stopPropagation()}
                    >
                       {goalOptions.map(goal => (
                         <button
                           key={goal}
                           onClick={() => {
                             setDailyGoal(goal);
                             setIsEditingGoal(false);
                           }}
                           className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                             dailyGoal === goal 
                               ? "bg-olive-500 text-white border-olive-500" 
                               : "bg-white border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50"
                           }`}
                         >
                           {goal} min
                         </button>
                       ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="p-6 flex items-center justify-between hover:bg-stone-50 transition-colors cursor-pointer">
                <div>
                  <p className="font-medium text-stone-900">Notifications</p>
                  <p className="text-sm text-stone-500">Email & Push enabled</p>
                </div>
                <div className="text-olive-500 font-medium text-sm">Manage</div>
              </div>
              
              {isLoggedIn ? (
                  <div className="p-6 flex items-center justify-center border-t border-stone-100">
                    <button 
                        onClick={handleLogout}
                        className="text-red-500 font-bold hover:bg-red-50 px-6 py-2 rounded-xl transition-colors w-full sm:w-auto"
                    >
                        Sign Out
                    </button>
                  </div>
              ) : (
                  <div className="p-6 flex items-center justify-center border-t border-stone-100">
                    <button 
                        onClick={() => setShowAuthModal(true)}
                        className="bg-olive-500 hover:bg-olive-600 text-white font-bold px-6 py-2 rounded-xl transition-colors w-full sm:w-auto shadow-lg shadow-olive-500/20"
                    >
                        Sign In / Create Account
                    </button>
                  </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        onLogin={handleLogin} 
      />

      {/* Microphone Permission Modal */}
      <AnimatePresence>
        {showMicModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center"
            >
              <div className="w-20 h-20 bg-olive-100 rounded-full flex items-center justify-center mx-auto mb-6 text-olive-600">
                <Mic size={40} />
              </div>
              <h2 className="text-2xl font-serif font-bold text-stone-900 mb-3">Microphone Access Needed</h2>
              <p className="text-stone-500 mb-8 leading-relaxed">
                To provide real-time feedback on your pronunciation and pacing, Accent AI needs access to your microphone. Your audio is processed securely.
              </p>
              {micError && (
                <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                  {micError}
                </div>
              )}
              <div className="flex flex-col gap-3">
                <button
                  onClick={requestMicrophoneAccess}
                  className="w-full bg-olive-500 hover:bg-olive-600 text-white font-bold py-4 rounded-xl transition-colors"
                >
                  Allow Microphone Access
                </button>
                <button
                  onClick={() => setShowMicModal(false)}
                  className="w-full bg-transparent hover:bg-stone-50 text-stone-500 font-medium py-3 rounded-xl transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
