import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { PracticeSession } from './components/PracticeSession';
import { ProgressStats } from './components/ProgressStats';
import { Mic } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
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

  useEffect(() => {
    localStorage.setItem('user_target_accent', targetAccent);
  }, [targetAccent]);

  useEffect(() => {
    localStorage.setItem('user_daily_goal', dailyGoal.toString());
  }, [dailyGoal]);

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
    if (tab === 'practice' && !micPermissionGranted) {
      setPendingPractice({ industry: selectedIndustry || 'general', topic: customTopic || undefined });
      setShowMicModal(true);
    } else {
      setActiveTab(tab);
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={handleTabChange}>
      {activeTab === 'dashboard' && (
        <Dashboard onStartPractice={handleStartPractice} dailyGoal={dailyGoal} />
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
              A
            </div>
            <div>
              <h2 className="text-2xl font-bold text-stone-900">Alex Johnson</h2>
              <p className="text-stone-500">alex.johnson@example.com</p>
              <div className="flex items-center gap-2 mt-3">
                <span className="bg-stone-100 text-stone-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Premium Member</span>
                <span className="bg-olive-100 text-olive-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Level 4</span>
              </div>
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
            </div>
          </div>
        </div>
      )}

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
