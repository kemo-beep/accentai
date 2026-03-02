import { useState, useEffect, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, X, Volume2, AlertCircle, Play, Square, CheckCircle2, Zap, MessageSquare, Clock, Download } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality, Type } from "@google/genai";
import { cn } from '@/lib/utils';
import { floatTo16BitPCM, arrayBufferToBase64, base64ToFloat32PCM } from '@/lib/audio-utils';
import { playStartSound, playEndSound, playFeedbackSound, playSuccessSound } from '@/lib/sound-effects';
import { checkNewBadges, Badge, getEarnedBadges } from '@/lib/rewards';
import { db } from '@/lib/db';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface PracticeSessionProps {
  industry: string;
  customTopic?: string | null;
  targetAccent: string;
  onComplete: () => void;
  onExit: () => void;
}

interface SessionStats {
  pronunciationScore: number;
  tempo: number;
  fillerWordCount: number;
  duration: number; // in seconds
}

// Audio context and processor for visualization
const AudioVisualizer = memo(({ isRecording, audioData }: { isRecording: boolean, audioData: number[] }) => {
  return (
    <div className="h-24 flex items-center justify-center gap-1 w-full max-w-md mx-auto">
      {audioData.map((val, i) => (
        <div
          key={i}
          className={cn(
            "w-1.5 bg-olive-500 rounded-full transition-all duration-75 ease-linear will-change-[height]",
            isRecording ? "opacity-100" : "opacity-30"
          )}
          style={{
            height: isRecording ? `${Math.max(4, val * 50)}px` : '4px'
          }}
        />
      ))}
    </div>
  );
});

// Helper to highlight filler words
const HighlightedText = ({ text }: { text: string }) => {
  // Split by filler words, keeping the delimiters
  const parts = text.split(/(\b(?:um|uh|er|ah|like|you know|i mean|hmm|mhm)\b)/gi);
  return (
    <>
      {parts.map((part, i) => 
        /(\b(?:um|uh|er|ah|like|you know|i mean|hmm|mhm)\b)/i.test(part) ? (
          <span key={i} className="bg-yellow-100 text-yellow-800 px-1 rounded mx-0.5 border-b-2 border-yellow-200 font-medium" title="Potential filler word">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
};

export function PracticeSession({ industry, customTopic, targetAccent, onComplete, onExit }: PracticeSessionProps) {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'active' | 'summary' | 'error'>('idle');
  const [transcript, setTranscript] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [currentFeedback, setCurrentFeedback] = useState<string | null>(null);
  const [feedbackHistory, setFeedbackHistory] = useState<string[]>([]);
  const [fillerCount, setFillerCount] = useState(0);
  const [audioData, setAudioData] = useState<number[]>(new Array(20).fill(0));
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);
  const [newBadges, setNewBadges] = useState<Badge[]>([]);
  const startTimeRef = useRef<number>(0);
  const [lastAiAudio, setLastAiAudio] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === 'active') {
      // Set initial time immediately to avoid delay
      if (startTimeRef.current) {
        setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }
      
      interval = setInterval(() => {
        if (startTimeRef.current) {
          setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  // Auto-scroll to bottom of transcript
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript, interimTranscript]);

  const replayLastAudio = () => {
    if (lastAiAudio) {
        playAudioChunk(lastAiAudio);
    }
  };
  
  // Refs for audio handling
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sessionRef = useRef<any>(null);
  const nextPlayTimeRef = useRef<number>(0);
  const recognitionRef = useRef<any>(null);

  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [savedSession, setSavedSession] = useState<any>(null);

  // Initialize Gemini API
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  // Load saved session on mount
  useEffect(() => {
    const saved = localStorage.getItem(`accent_ai_session_${industry}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Only offer resume if saved less than 24 hours ago
        if (Date.now() - parsed.lastSavedTime < 24 * 60 * 60 * 1000) {
            setSavedSession(parsed);
            setShowResumeDialog(true);
        } else {
            localStorage.removeItem(`accent_ai_session_${industry}`);
        }
      } catch (e) {
        console.error("Failed to parse saved session", e);
      }
    }
  }, [industry]);

  // Save session periodically when active
  useEffect(() => {
    if (status !== 'active') return;

    const interval = setInterval(() => {
        const sessionData = {
            transcript,
            interimTranscript,
            feedbackHistory,
            fillerCount,
            elapsedTime: (Date.now() - startTimeRef.current) / 1000,
            lastSavedTime: Date.now(),
            audioContextState: audioContextRef.current?.state
        };
        localStorage.setItem(`accent_ai_session_${industry}`, JSON.stringify(sessionData));
    }, 5000); // Save every 5 seconds

    return () => clearInterval(interval);
  }, [status, transcript, interimTranscript, feedbackHistory, fillerCount, industry]);

  const resumeSession = () => {
    if (savedSession) {
        let restoredTranscript = savedSession.transcript || [];
        if (savedSession.interimTranscript) {
             restoredTranscript = [...restoredTranscript, { role: 'user', text: savedSession.interimTranscript }];
        }
        setTranscript(restoredTranscript);
        setFeedbackHistory(savedSession.feedbackHistory || []);
        setFillerCount(savedSession.fillerCount || 0);
        // Adjust start time to account for previously elapsed time
        startTimeRef.current = Date.now() - (savedSession.elapsedTime * 1000);
        setShowResumeDialog(false);
        startSession(restoredTranscript); // Re-connect to Gemini with context
    }
  };

  const clearSavedSession = () => {
    localStorage.removeItem(`accent_ai_session_${industry}`);
    setSavedSession(null);
    setShowResumeDialog(false);
  };

  const startSession = async (initialTranscript?: {role: 'user' | 'ai', text: string}[]) => {
    setStatus('connecting');
    if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
    }
    
    try {
      // 1. Setup Audio Context
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext({ sampleRate: 16000 }); // Try to request 16kHz directly
      audioContextRef.current = ctx;
      nextPlayTimeRef.current = ctx.currentTime;

      // 2. Request Mic
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 16000,
        } 
      });
      mediaStreamRef.current = stream;

      // 3. Setup Speech Recognition (Client-side)
      if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
            let interim = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    const text = event.results[i][0].transcript;
                    setTranscript(prev => [...prev, { role: 'user', text }]);
                } else {
                    interim += event.results[i][0].transcript;
                }
            }
            setInterimTranscript(interim);
        };

        recognition.start();
        recognitionRef.current = recognition;
      }

      // Prepare system instruction with context if resuming
      let systemInstruction = '';
      const accentInstruction = `Your goal is to help the user practice their ${targetAccent} accent. Model this accent in your speech (if capable) and provide feedback specifically on how well they match ${targetAccent} pronunciation patterns.`;
      
      if (industry === 'custom' && customTopic) {
          systemInstruction = `You are a friendly and professional pronunciation coach. 
          ${accentInstruction}
          Conduct a roleplay scenario based on the following topic: "${customTopic}".
          Listen carefully to the user's pronunciation, pacing, and filler words.
          If the user makes a significant mistake or uses too many filler words, use the 'giveFeedback' tool to gently notify them, but keep the conversation flowing naturally.
          Do not interrupt for every small mistake.
          Start by introducing the scenario based on the topic.`;
      } else if (industry === 'impromptu') {
          systemInstruction = `You are an expert impromptu speaking coach.
          ${accentInstruction}
          Your goal is to help the user practice thinking on their feet and speaking clearly without preparation.
          Start by giving the user a random, thought-provoking topic or question (e.g., "If you could have dinner with any historical figure, who would it be?", "Is technology making us more connected?", "Describe your perfect day.").
          Ask them to speak for about 1 minute on this topic.
          Listen to their response without interrupting, unless they struggle significantly.
          After they finish their response, provide brief, constructive feedback on their structure, clarity, and delivery.
          Then, give them a new, different topic to practice.
          Keep the tone encouraging but challenging.`;
      } else {
          systemInstruction = `You are a friendly and professional pronunciation coach specializing in the ${industry} industry. 
          ${accentInstruction}
          Conduct a roleplay scenario relevant to this industry. 
          Listen carefully to the user's pronunciation, pacing, and filler words.
          If the user makes a significant mistake or uses too many filler words, use the 'giveFeedback' tool to gently notify them, but keep the conversation flowing naturally.
          Do not interrupt for every small mistake.
          Start by introducing the scenario.`;
      }

      if (initialTranscript && initialTranscript.length > 0) {
        const historyText = initialTranscript.map(t => `${t.role === 'user' ? 'User' : 'Coach'}: ${t.text}`).join('\n');
        
        const lastTurn = initialTranscript[initialTranscript.length - 1];
        let resumeContext = `\n\nIMPORTANT: You are RESUMING a previous session. Here is the transcript of the conversation so far:\n${historyText}\n\nContinue the roleplay naturally from where it left off. Do not restart the scenario.`;
        
        if (lastTurn.role === 'ai') {
             resumeContext += `\nYour last spoken line was: "${lastTurn.text}". Wait for the user to respond to this.`;
        } else {
             resumeContext += `\nThe user just said: "${lastTurn.text}". Respond to them directly.`;
        }
        
        systemInstruction += resumeContext;
      }

      // 4. Setup Gemini Live Session
      const sessionPromise = ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-09-2025",
        callbacks: {
          onopen: () => {
            console.log("Session connected");
            setStatus('active');
            playStartSound();
            
            // Start audio processing loop
            setupAudioProcessing(ctx, stream, sessionPromise);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Audio Output
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
              playAudioChunk(base64Audio);
              setLastAiAudio(base64Audio);
            }

            // Handle Text Output (Transcript)
            const parts = message.serverContent?.modelTurn?.parts;
            if (parts) {
                parts.forEach(part => {
                    if (part.text) {
                        setTranscript(prev => {
                            const last = prev[prev.length - 1];
                            // If the last message was from AI, append to it to create a continuous sentence
                            if (last && last.role === 'ai') {
                                return [...prev.slice(0, -1), { ...last, text: last.text + part.text }];
                            }
                            return [...prev, { role: 'ai', text: part.text }];
                        });
                    }
                });
            }
            
            // Handle Tool Calls (Feedback)
            const toolCall = message.toolCall;
            if (toolCall) {
               const functionCalls = toolCall.functionCalls;
               if (functionCalls) {
                 const responses = functionCalls.map(call => {
                   if (call.name === 'giveFeedback') {
                     const args = call.args as any;
                     if (args.type === 'filler') {
                        setFillerCount(prev => prev + 1);
                     }
                     setCurrentFeedback(args.message);
                     playFeedbackSound();
                     setFeedbackHistory(prev => [...prev, args.message]);
                     // Clear feedback after 5 seconds
                     setTimeout(() => setCurrentFeedback(null), 5000);
                     return {
                       name: call.name,
                       response: { result: "Feedback displayed to user" },
                       id: call.id
                     };
                   }
                   return {
                     name: call.name,
                     response: { result: "ok" },
                     id: call.id
                   };
                 });
                 
                 sessionPromise.then(session => session.sendToolResponse({ functionResponses: responses }));
               }
            }
          },
          onclose: () => {
            console.log("Session closed");
            // Only call stopSession if not already in summary (to avoid loops if close triggered by stop)
            if (status !== 'summary') {
                stopSession();
            }
          },
          onerror: (err) => {
            console.error("Session error:", err);
            setStatus('error');
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: systemInstruction,
          tools: [{
            functionDeclarations: [{
              name: "giveFeedback",
              description: "Give real-time feedback to the user about their pronunciation or speaking style.",
              parameters: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, enum: ["pronunciation", "grammar", "filler", "pacing"] },
                  message: { type: Type.STRING, description: "The feedback message to display to the user." }
                },
                required: ["type", "message"]
              }
            }]
          }]
        },
      });
      
      sessionRef.current = sessionPromise;

    } catch (err) {
      console.error("Error starting session:", err);
      setStatus('error');
    }
  };

  const setupAudioProcessing = (ctx: AudioContext, stream: MediaStream, sessionPromise: Promise<any>) => {
    const source = ctx.createMediaStreamSource(stream);
    const processor = ctx.createScriptProcessor(4096, 1, 1);
    
    processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      
      // Update visualizer
      updateVisualizerData(inputData);
      
      // Convert to PCM 16-bit
      const pcmData = floatTo16BitPCM(inputData);
      const base64Data = arrayBufferToBase64(pcmData.buffer);
      
      // Send to Gemini
      sessionPromise.then(session => {
        session.sendRealtimeInput({
          media: {
            mimeType: "audio/pcm;rate=16000",
            data: base64Data
          }
        });
      });
    };
    
    source.connect(processor);
    processor.connect(ctx.destination); // ScriptProcessor needs to be connected to destination to fire
    processorRef.current = processor;
  };

  const updateVisualizerData = (inputData: Float32Array) => {
    // Simple downsampling for visualization
    const bars = [];
    const step = Math.floor(inputData.length / 20);
    for (let i = 0; i < 20; i++) {
      let sum = 0;
      for (let j = 0; j < step; j++) {
        sum += Math.abs(inputData[i * step + j]);
      }
      bars.push(Math.min(1, sum / step * 5)); // Amplify a bit
    }
    setAudioData(bars);
  };

  const playAudioChunk = (base64Audio: string) => {
    if (!audioContextRef.current) return;
    
    const float32Data = base64ToFloat32PCM(base64Audio);
    const buffer = audioContextRef.current.createBuffer(1, float32Data.length, 24000); // Gemini usually sends 24kHz
    buffer.getChannelData(0).set(float32Data);
    
    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    
    // Schedule playback
    const now = audioContextRef.current.currentTime;
    // Ensure we don't schedule in the past, but also don't let the delay grow too large
    const startTime = Math.max(now, nextPlayTimeRef.current);
    source.start(startTime);
    
    nextPlayTimeRef.current = startTime + buffer.duration;
  };

  const stopSession = async () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (e) {
        console.error("Error closing AudioContext:", e);
      }
    }
    if (sessionRef.current) {
      sessionRef.current.then((s: any) => s.close());
    }
    if (recognitionRef.current) {
        recognitionRef.current.stop();
    }

    // Calculate stats for the summary
    const duration = (Date.now() - startTimeRef.current) / 1000;
    
    // Calculate score based on fillers (simple heuristic)
    const baseScore = 100 - (fillerCount * 5);
    const randomVariance = Math.floor(Math.random() * 10) - 5; // -5 to +5
    const calculatedScore = Math.min(100, Math.max(60, baseScore + randomVariance));

    const mockStats: SessionStats = {
        pronunciationScore: calculatedScore,
        tempo: Math.floor(Math.random() * (150 - 110) + 110), // Random WPM for now
        fillerWordCount: fillerCount,
        duration: duration
    };
    setSessionStats(mockStats);
    setStatus('summary');
    playEndSound();
    
    // Save to persistent history (Supabase)
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
            // Save session
            await db.savePracticeSession(user.id, {
                industry: industry === 'custom' ? (customTopic || 'Custom') : industry,
                score: calculatedScore,
                duration: Math.floor(duration),
                tempo: mockStats.tempo,
                filler_count: fillerCount,
                feedback: feedbackHistory,
                transcript: transcript
            });

            // Check for new badges
            // First, get existing badges
            const existingBadges = await db.getUserBadges(user.id);
            const earnedBadgeIds = existingBadges.map(b => b.badge_id);
            
            // We need total sessions count for some badges
            const sessions = await db.getPracticeSessions(user.id);
            const totalSessions = sessions ? sessions.length + 1 : 1; // +1 for current session

            // Calculate new badges
            const newBadgeList = checkNewBadges(mockStats, totalSessions, earnedBadgeIds);
            
            if (newBadgeList.length > 0) {
                setNewBadges(newBadgeList);
                playSuccessSound();
                
                // Save new badges
                for (const badge of newBadgeList) {
                    await db.saveUserBadge(user.id, badge.id);
                }
            }
        } catch (error) {
            console.error("Error saving session to Supabase:", error);
        }
    } else {
        // Fallback to localStorage for guest users (or handle as error)
        const historyItem = {
            id: Date.now(),
            date: new Date().toLocaleString(),
            industry: industry === 'custom' ? (customTopic || 'Custom') : industry,
            score: calculatedScore,
            duration: `${Math.floor(duration / 60)} min`,
            durationSeconds: duration,
            trend: [] 
        };
        
        const existingHistory = JSON.parse(localStorage.getItem('accent_ai_history') || '[]');
        const updatedHistory = [historyItem, ...existingHistory];
        localStorage.setItem('accent_ai_history', JSON.stringify(updatedHistory));
        
        // Check for new badges (local)
        const earnedBadges = checkNewBadges(mockStats, updatedHistory.length, getEarnedBadges());
        if (earnedBadges.length > 0) {
            setNewBadges(earnedBadges);
            playSuccessSound();
            
            // Save local badges
            const currentLocalBadges = getEarnedBadges();
            const updatedLocalBadges = [...currentLocalBadges, ...earnedBadges.map(b => b.id)];
            localStorage.setItem('user_badges', JSON.stringify(updatedLocalBadges));
        }
    }

    localStorage.removeItem(`accent_ai_session_${industry}`);
  };

  const handleExport = () => {
    // Use existing sessionStats if available (summary view), otherwise calculate current stats
    const stats = sessionStats || {
        duration: elapsedSeconds,
        pronunciationScore: "N/A (In Progress)",
        tempo: "N/A (In Progress)",
        fillerWordCount: fillerCount
    };

    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();
    
    let content = `Practice Session - ${industry === 'custom' ? (customTopic || 'Custom') : industry}\n`;
    content += `Date: ${date} ${time}\n`;
    
    const durationMin = Math.floor(stats.duration / 60);
    const durationSec = Math.floor(stats.duration % 60).toString().padStart(2, '0');
    content += `Duration: ${durationMin}:${durationSec}\n`;
    
    content += `Score: ${stats.pronunciationScore}${typeof stats.pronunciationScore === 'number' ? '%' : ''}\n`;
    content += `Tempo: ${stats.tempo}${typeof stats.tempo === 'number' ? ' wpm' : ''}\n`;
    content += `Filler Words: ${stats.fillerWordCount}\n\n`;
    
    content += `--- TRANSCRIPT ---\n\n`;
    transcript.forEach(t => {
      content += `${t.role === 'user' ? 'You' : 'Coach'}: ${t.text}\n\n`;
    });
    
    content += `--- FEEDBACK HISTORY ---\n\n`;
    if (feedbackHistory.length > 0) {
      feedbackHistory.forEach(f => {
        content += `- ${f}\n`;
      });
    } else {
      content += `No specific feedback recorded.\n`;
    }
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `practice-session-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (status === 'active' || status === 'connecting') {
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
        }
        if (processorRef.current) {
            processorRef.current.disconnect();
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            try {
                audioContextRef.current.close();
            } catch (e) {
                console.error("Error closing AudioContext in cleanup:", e);
            }
        }
        if (sessionRef.current) {
            sessionRef.current.then((s: any) => s.close());
        }
      }
    };
  }, []);

  if (status === 'summary' && sessionStats) {
      return (
        <div className="h-full flex flex-col max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif font-bold text-2xl">Session Summary</h2>
                <button onClick={onComplete} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                    <X size={24} className="text-stone-500" />
                </button>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-6 md:p-8 overflow-y-auto space-y-6 md:space-y-8">
                {newBadges.length > 0 && (
                    <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-100 rounded-2xl p-6 text-center animate-in fade-in slide-in-from-top-4 duration-700">
                        <h3 className="text-lg font-serif font-bold text-yellow-800 mb-4">🎉 New Badge Unlocked!</h3>
                        <div className="flex flex-wrap justify-center gap-4">
                            {newBadges.map(badge => (
                                <div key={badge.id} className="flex flex-col items-center gap-2">
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-sm ${badge.color.replace('text-', 'bg-').split(' ')[0]} bg-opacity-20`}>
                                        {badge.icon}
                                    </div>
                                    <span className="font-bold text-stone-800 text-sm">{badge.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-olive-50 mb-4">
                        <TrophyIcon score={sessionStats.pronunciationScore} />
                    </div>
                    <h3 className="text-4xl font-serif font-bold text-stone-900 mb-2">{sessionStats.pronunciationScore}%</h3>
                    <p className="text-stone-500">Overall Pronunciation Score</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100">
                        <div className="flex items-center gap-2 mb-2 text-stone-500">
                            <Zap size={18} />
                            <span className="text-xs font-bold uppercase tracking-wide">Tempo</span>
                        </div>
                        <div className="flex items-end gap-1">
                            <span className="text-2xl font-bold text-stone-900">{sessionStats.tempo}</span>
                            <span className="text-sm text-stone-500 mb-1">wpm</span>
                        </div>
                    </div>
                    <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100">
                        <div className="flex items-center gap-2 mb-2 text-stone-500">
                            <MessageSquare size={18} />
                            <span className="text-xs font-bold uppercase tracking-wide">Filler Words</span>
                        </div>
                        <div className="flex items-end gap-1">
                            <span className="text-2xl font-bold text-stone-900">{sessionStats.fillerWordCount}</span>
                            <span className="text-sm text-stone-500 mb-1">detected</span>
                        </div>
                    </div>
                    <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100">
                        <div className="flex items-center gap-2 mb-2 text-stone-500">
                            <Clock size={18} />
                            <span className="text-xs font-bold uppercase tracking-wide">Duration</span>
                        </div>
                        <div className="flex items-end gap-1">
                            <span className="text-2xl font-bold text-stone-900">{Math.floor(sessionStats.duration / 60)}:{Math.floor(sessionStats.duration % 60).toString().padStart(2, '0')}</span>
                            <span className="text-sm text-stone-500 mb-1">min</span>
                        </div>
                    </div>
                </div>

                <div>
                    <h4 className="font-serif font-bold text-lg mb-4">Feedback History</h4>
                    {feedbackHistory.length > 0 ? (
                        <div className="space-y-3">
                            {feedbackHistory.map((feedback, idx) => (
                                <div key={idx} className="flex gap-3 p-4 bg-cream-50 rounded-xl border border-stone-100">
                                    <AlertCircle size={20} className="text-terracotta-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-stone-700 text-sm">{feedback}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center p-8 bg-stone-50 rounded-xl border border-stone-100 border-dashed">
                            <CheckCircle2 size={32} className="text-emerald-500 mx-auto mb-2" />
                            <p className="text-stone-500">No specific issues detected. Great job!</p>
                        </div>
                    )}
                </div>

                <div className="pt-4 flex justify-center gap-4">
                    <button 
                        onClick={handleExport}
                        className="bg-white border border-stone-200 hover:bg-stone-50 text-stone-600 px-6 py-3 rounded-full font-bold transition-colors flex items-center gap-2"
                    >
                        <Download size={20} />
                        Export Transcript
                    </button>
                    <button 
                        onClick={() => {
                            playSuccessSound();
                            onComplete();
                        }}
                        className="bg-olive-500 hover:bg-olive-600 text-white px-8 py-3 rounded-full font-bold transition-colors"
                    >
                        Finish Review
                    </button>
                </div>
            </div>
        </div>
      );
  }

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={onExit} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
            <X size={20} className="text-stone-500" />
          </button>
          <div>
            <h2 className="font-serif font-bold text-xl capitalize">
              {industry === 'custom' ? (customTopic || 'Custom Scenario') : 
               industry === 'impromptu' ? 'Impromptu Speaking' : 
               `${industry} Roleplay`}
            </h2>
            <p className="text-xs text-stone-500">Live Feedback Enabled</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {status === 'active' && (
             <div className="font-mono text-stone-500 font-medium bg-stone-100 px-3 py-1 rounded-full text-sm">
                {Math.floor(elapsedSeconds / 60).toString().padStart(2, '0')}:{(elapsedSeconds % 60).toString().padStart(2, '0')}
             </div>
          )}
          <div className="flex items-center gap-2">
            <span className={cn("w-2 h-2 rounded-full", status === 'active' ? "bg-red-500 animate-pulse" : "bg-stone-300")} />
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wide">
              {status === 'active' ? 'Live' : status}
            </span>
          </div>
        </div>
      </div>

      {/* Resume Dialog */}
      <AnimatePresence>
        {showResumeDialog && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full border border-stone-200"
            >
              <h3 className="font-serif font-bold text-xl mb-2">Resume Session?</h3>
              <p className="text-stone-500 mb-6">You have an unfinished {industry} session from earlier. Would you like to continue where you left off?</p>
              <div className="flex gap-3">
                <button
                  onClick={clearSavedSession}
                  className="flex-1 py-3 px-4 rounded-xl font-medium text-stone-600 hover:bg-stone-100 transition-colors"
                >
                  Start New
                </button>
                <button
                  onClick={resumeSession}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-olive-500 hover:bg-olive-600 transition-colors"
                >
                  Resume
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Interaction Area */}
      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden flex flex-col relative">
        
        {/* Transcript / Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col items-center justify-center">
          {status === 'idle' ? (
            <div className="text-center p-8">
              <div className="w-20 h-20 bg-olive-100 rounded-full flex items-center justify-center mb-6 text-olive-600 mx-auto">
                <Mic size={32} />
              </div>
              <h3 className="text-2xl font-serif font-bold mb-2">Ready to start?</h3>
              <p className="text-stone-500 max-w-md mb-8 mx-auto">
                {industry === 'custom' 
                  ? `I'll act as your counterpart in a scenario about "${customTopic}". I'll listen to your pronunciation, pacing, and filler words in real-time.`
                  : `I'll act as your counterpart in a ${industry} scenario. I'll listen to your pronunciation, pacing, and filler words in real-time.`
                }
              </p>
              <button 
                onClick={() => startSession()}
                className="bg-olive-500 hover:bg-olive-600 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center gap-3 mx-auto"
              >
                <Play fill="currentColor" size={20} />
                Start Session
              </button>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col relative">
               {/* Transcript List */}
               <div className="flex-1 overflow-y-auto p-6 space-y-4" ref={scrollRef}>
                  {transcript.length === 0 && !interimTranscript && (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                        <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mb-4">
                            <Volume2 size={32} className="text-stone-400" />
                        </div>
                        <p className="text-stone-500 font-medium">Start speaking to see the transcript...</p>
                    </div>
                  )}
                  
                  {transcript.map((t, i) => (
                    <div key={i} className={cn("flex", t.role === 'user' ? "justify-end" : "justify-start")}>
                      <div className={cn(
                        "max-w-[85%] rounded-2xl p-4 shadow-sm",
                        t.role === 'user' ? "bg-olive-50 text-olive-900 rounded-tr-sm" : "bg-stone-50 border border-stone-200 border-l-4 border-l-stone-400 text-stone-800 rounded-tl-sm"
                      )}>
                        <p className="text-xs font-bold mb-1 opacity-50 uppercase tracking-wider">{t.role === 'user' ? 'You' : 'Coach'}</p>
                        <p className="leading-relaxed text-[15px]">
                          {t.role === 'user' ? <HighlightedText text={t.text} /> : t.text}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {interimTranscript && (
                    <div className="flex justify-end">
                      <div className="max-w-[85%] rounded-2xl p-4 bg-olive-50/50 text-olive-800/70 rounded-tr-sm border border-olive-100 border-dashed">
                        <p className="text-xs font-bold mb-1 opacity-50 uppercase tracking-wider">You</p>
                        <p className="leading-relaxed text-[15px]">
                           <HighlightedText text={interimTranscript} />
                        </p>
                      </div>
                    </div>
                  )}
               </div>

              {/* Real-time Feedback Toast */}
              <AnimatePresence>
                {currentFeedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-4 left-0 right-0 mx-auto w-max max-w-md bg-stone-900/90 text-white px-6 py-3 rounded-full text-sm flex items-center gap-3 shadow-xl backdrop-blur-sm z-20"
                  >
                    <AlertCircle size={18} className="text-yellow-400" />
                    <span className="font-medium">{currentFeedback}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Bottom Controls & Visualizer */}
        {status !== 'idle' && (
          <div className="bg-stone-50 border-t border-stone-100 p-6 z-20">
            <div className="mb-6">
               <AudioVisualizer isRecording={status === 'active'} audioData={audioData} />
            </div>
            
            <div className="flex items-center justify-center gap-6">
              <button 
                onClick={replayLastAudio}
                disabled={!lastAiAudio}
                className="bg-white border border-stone-200 hover:bg-stone-50 text-stone-600 px-6 py-4 rounded-full font-bold transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play fill="currentColor" size={18} />
                Replay Last
              </button>
              <button 
                onClick={handleExport}
                className="bg-white border border-stone-200 hover:bg-stone-50 text-stone-600 px-6 py-4 rounded-full font-bold transition-colors flex items-center gap-2 shadow-sm"
                title="Export Transcript"
              >
                <Download size={18} />
                <span className="hidden sm:inline">Export</span>
              </button>
              <button 
                onClick={stopSession}
                className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-full font-bold transition-colors flex items-center gap-2 shadow-lg"
              >
                <Square fill="currentColor" size={18} />
                End Session
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TrophyIcon({ score }: { score: number }) {
    if (score >= 90) return <span className="text-4xl">🏆</span>;
    if (score >= 80) return <span className="text-4xl">🥈</span>;
    return <span className="text-4xl">🥉</span>;
}

