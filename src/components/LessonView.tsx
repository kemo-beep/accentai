import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, CheckCircle2, Play, BookOpen, Dumbbell, FileText, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Lesson } from '@/data/courses';
import { SlideVisual } from './SlideVisual';
import { ReadingContent } from './ReadingContent';

interface LessonViewProps {
  lesson: Lesson;
  onBack: () => void;
  onComplete: () => void;
  onNext?: () => void;
  hasNext?: boolean;
}

export function LessonView({ lesson, onBack, onComplete, onNext, hasNext }: LessonViewProps) {
  const [answer, setAnswer] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Reset state when lesson changes
  useEffect(() => {
    setAnswer('');
    setIsCompleted(false);
    setCurrentSlide(0);
  }, [lesson.id]);

  const handleComplete = () => {
    setIsCompleted(true);
    onComplete();
  };

  const handleNextSlide = () => {
    if (lesson.slides && currentSlide < lesson.slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const hasSlides = lesson.slides && lesson.slides.length > 0;
  const activeSlide = hasSlides ? lesson.slides![currentSlide] : null;

  return (
    <div className="max-w-3xl mx-auto pb-20 pt-6 px-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-500 hover:text-stone-900"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm text-stone-500 mb-1">
            {lesson.type === 'video' && <Play size={14} />}
            {lesson.type === 'reading' && <BookOpen size={14} />}
            {lesson.type === 'exercise' && <Dumbbell size={14} />}
            {lesson.type === 'quiz' && <FileText size={14} />}
            <span className="uppercase font-bold tracking-wide text-xs">{lesson.type}</span>
            <span>•</span>
            <span>{lesson.duration}</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">{lesson.title}</h1>
        </div>
      </div>

      {/* Progress Bar for Slides */}
      {hasSlides && (
        <div className="mb-8 flex gap-2">
          {lesson.slides!.map((_, idx) => (
            <div 
              key={idx}
              className={cn(
                "h-1.5 rounded-full flex-1 transition-colors duration-300",
                idx <= currentSlide ? "bg-stone-900" : "bg-stone-200"
              )}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="relative min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={hasSlides ? currentSlide : 'content'}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl p-8 border border-stone-100 shadow-sm space-y-8"
          >
            {/* Slide Image or Visual */}
            {hasSlides && (activeSlide?.visualType || activeSlide?.image) && (
              <div className="rounded-2xl overflow-hidden mb-6 aspect-video bg-stone-100 border border-stone-200">
                {activeSlide?.visualType ? (
                  <SlideVisual type={activeSlide.visualType} />
                ) : (
                  <img 
                    src={activeSlide!.image} 
                    alt={activeSlide!.imageAlt || activeSlide!.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>
            )}

            {/* Slide Title */}
            {hasSlides && activeSlide?.title && (
              <h2 className="text-2xl font-bold text-stone-900 mb-4">{activeSlide.title}</h2>
            )}

            {/* Video Player Placeholder */}
            {lesson.type === 'video' && !hasSlides && (
              <div className="aspect-video bg-stone-900 rounded-2xl flex items-center justify-center relative overflow-hidden group cursor-pointer">
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/40 group-hover:scale-110 transition-transform">
                  <Play size={32} className="text-white ml-1" fill="currentColor" />
                </div>
                <p className="absolute bottom-4 left-4 text-white font-medium">Video Placeholder</p>
              </div>
            )}

            {/* Reading Content */}
            {(lesson.type === 'reading' || lesson.type === 'video') && (
              <ReadingContent 
                content={hasSlides ? activeSlide?.content || '' : lesson.content || ''} 
              />
            )}

            {/* Exercise Content */}
            {lesson.type === 'exercise' && (
              <div className="space-y-6">
                <div className="bg-olive-50 p-6 rounded-2xl border border-olive-100">
                  <h3 className="font-bold text-olive-900 mb-2 flex items-center gap-2">
                    <Dumbbell size={20} />
                    Exercise Prompt
                  </h3>
                  <p className="text-olive-800 text-lg">{lesson.exercisePrompt}</p>
                </div>

                <div className="space-y-2">
                  <label className="block font-medium text-stone-700">Your Answer</label>
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Type your response here..."
                    className="w-full h-48 p-4 rounded-xl border border-stone-200 focus:border-olive-500 focus:ring-2 focus:ring-olive-200 outline-none resize-none transition-all font-serif text-lg"
                  />
                  <p className="text-xs text-stone-400 text-right">
                    {answer.length} characters
                  </p>
                </div>
              </div>
            )}

            {/* Quiz Content (Placeholder) */}
            {lesson.type === 'quiz' && (
              <div className="text-center py-12 bg-stone-50 rounded-2xl border border-stone-100 border-dashed">
                <FileText size={48} className="mx-auto text-stone-300 mb-4" />
                <h3 className="font-bold text-stone-900 mb-2">Quiz Component</h3>
                <p className="text-stone-500">Quiz functionality coming soon.</p>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Actions */}
      <div className="mt-8 flex justify-between items-center">
        {hasSlides ? (
          <>
            <button
              onClick={handlePrevSlide}
              disabled={currentSlide === 0}
              className={cn(
                "px-6 py-3 rounded-xl font-bold transition-colors flex items-center gap-2",
                currentSlide === 0 
                  ? "text-stone-300 cursor-not-allowed" 
                  : "text-stone-600 hover:bg-stone-100"
              )}
            >
              <ChevronLeft size={20} />
              Previous
            </button>

            <div className="flex items-center gap-4">
              {isCompleted && (
                <div className="flex items-center gap-2 text-olive-600 font-bold bg-olive-50 px-4 py-2 rounded-lg">
                  <CheckCircle2 size={20} />
                  <span className="hidden sm:inline">Completed!</span>
                </div>
              )}

              {(!isCompleted || currentSlide < lesson.slides!.length - 1) ? (
                <button
                  onClick={handleNextSlide}
                  className="bg-stone-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-stone-800 transition-colors flex items-center gap-2 shadow-lg"
                >
                  {currentSlide === lesson.slides!.length - 1 ? (
                    <>
                      <CheckCircle2 size={20} />
                      Complete Lesson
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight size={20} />
                    </>
                  )}
                </button>
              ) : (
                hasNext && (
                  <button
                    onClick={onNext}
                    className="bg-olive-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-olive-600 transition-colors flex items-center gap-2 shadow-lg"
                  >
                    Next Lesson
                    <ChevronRight size={20} />
                  </button>
                )
              )}
            </div>
          </>
        ) : (
          /* Legacy Footer for non-slide lessons */
          <div className="w-full flex justify-end gap-4">
            {!isCompleted ? (
              <button
                onClick={handleComplete}
                disabled={lesson.type === 'exercise' && answer.length < 10}
                className={cn(
                  "bg-stone-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-stone-800 transition-colors flex items-center gap-2 shadow-lg",
                  lesson.type === 'exercise' && answer.length < 10 && "opacity-50 cursor-not-allowed"
                )}
              >
                <CheckCircle2 size={20} />
                Complete Lesson
              </button>
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-olive-600 font-bold bg-olive-50 px-4 py-2 rounded-lg">
                  <CheckCircle2 size={20} />
                  Completed!
                </div>
                {hasNext && (
                  <button
                    onClick={onNext}
                    className="bg-olive-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-olive-600 transition-colors flex items-center gap-2 shadow-lg"
                  >
                    Next Lesson
                    <ChevronRight size={20} />
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
