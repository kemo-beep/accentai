import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Play, 
  CheckCircle2, 
  Lock, 
  Clock, 
  FileText, 
  Award,
  BookOpen,
  Brain,
  ListChecks,
  Dumbbell
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CLEAR_THINKING_COURSE } from '@/data/courses';

interface CourseDetailProps {
  courseId: string;
  onBack: () => void;
  onStartLesson: (lessonId: string) => void;
}

export function CourseDetail({ courseId, onBack, onStartLesson }: CourseDetailProps) {
  // In a real app, fetch course data based on courseId
  // For now, we only have Clear Thinking
  const course = CLEAR_THINKING_COURSE;

  if (courseId !== 'clear-thinking') {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-stone-900">Course not found</h2>
        <button onClick={onBack} className="mt-4 text-olive-600 hover:underline">Go back</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Header / Hero */}
      <div className="relative mb-8">
        <button 
          onClick={onBack}
          className="absolute top-0 left-0 -mt-12 md:-mt-0 md:-left-16 p-2 text-stone-400 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn("rounded-3xl p-8 md:p-12 text-white shadow-lg bg-gradient-to-br", course.imageGradient)}
        >
          <div className="flex flex-col md:flex-row gap-8 items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                  {course.level}
                </span>
                <span className="flex items-center gap-1 text-white/80 text-xs font-bold uppercase tracking-wide">
                  <Clock size={14} /> {course.duration}
                </span>
                <span className="flex items-center gap-1 text-white/80 text-xs font-bold uppercase tracking-wide">
                  <Award size={14} /> {course.xp} XP
                </span>
              </div>
              
              <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4">{course.title}</h1>
              <p className="text-white/90 text-lg leading-relaxed max-w-2xl">
                {course.longDescription}
              </p>
              
              <div className="mt-8 flex flex-wrap gap-4">
                <button 
                  onClick={() => onStartLesson(course.modules[0].lessons[0].id)}
                  className="bg-white text-stone-900 px-8 py-3 rounded-xl font-bold hover:bg-stone-100 transition-colors flex items-center gap-2 shadow-lg"
                >
                  <Play size={20} fill="currentColor" />
                  Start Course
                </button>
              </div>
            </div>
            
            <div className="hidden md:block">
              <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20">
                <Brain size={64} className="text-white" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content: Syllabus */}
        <div className="lg:col-span-2 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-2xl font-serif font-bold text-stone-900 mb-6 flex items-center gap-2">
              <ListChecks className="text-olive-500" />
              Course Curriculum
            </h2>

            <div className="space-y-6">
              {course.modules.map((module, moduleIndex) => (
                <div key={moduleIndex} className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
                  <div className="bg-stone-50 px-6 py-4 border-b border-stone-100 flex justify-between items-center">
                    <h3 className="font-bold text-stone-800">{module.title}</h3>
                    <span className="text-xs text-stone-500 font-medium">{module.lessons.length} Lessons</span>
                  </div>
                  <div className="divide-y divide-stone-100">
                    {module.lessons.map((lesson, lessonIndex) => (
                      <button
                        key={lesson.id}
                        disabled={lesson.isLocked}
                        onClick={() => !lesson.isLocked && onStartLesson(lesson.id)}
                        className={cn(
                          "w-full px-6 py-4 flex items-center gap-4 text-left transition-colors hover:bg-stone-50",
                          lesson.isLocked && "opacity-60 cursor-not-allowed hover:bg-white"
                        )}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                          lesson.isCompleted ? "bg-olive-100 text-olive-600" : 
                          lesson.isLocked ? "bg-stone-100 text-stone-400" : "bg-blue-100 text-blue-600"
                        )}>
                          {lesson.isCompleted ? <CheckCircle2 size={16} /> : 
                           lesson.isLocked ? <Lock size={16} /> : <Play size={16} fill="currentColor" />}
                        </div>
                        
                        <div className="flex-1">
                          <h4 className={cn("font-medium", lesson.isLocked ? "text-stone-400" : "text-stone-900")}>
                            {lesson.title}
                          </h4>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-stone-400 flex items-center gap-1">
                              {lesson.type === 'video' ? <Play size={12} /> : 
                               lesson.type === 'quiz' ? <FileText size={12} /> : 
                               lesson.type === 'exercise' ? <Dumbbell size={12} /> : <BookOpen size={12} />}
                              {lesson.type.charAt(0).toUpperCase() + lesson.type.slice(1)}
                            </span>
                            <span className="text-xs text-stone-400 flex items-center gap-1">
                              <Clock size={12} /> {lesson.duration}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Sidebar: Stats & Info */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm"
          >
            <h3 className="font-bold text-stone-900 mb-4">Your Progress</h3>
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-stone-500">0% Complete</span>
              <span className="text-stone-900 font-medium">0/{course.lessonsCount} Lessons</span>
            </div>
            <div className="w-full bg-stone-100 rounded-full h-2 mb-6">
              <div className="bg-olive-500 h-2 rounded-full w-0" />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-stone-600">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Brain size={18} />
                </div>
                <div>
                  <p className="font-bold text-stone-900">Logic & Structure</p>
                  <p className="text-xs">Primary Skill</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-stone-600">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Award size={18} />
                </div>
                <div>
                  <p className="font-bold text-stone-900">Certificate</p>
                  <p className="text-xs">Upon Completion</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-stone-900 rounded-2xl p-6 text-white"
          >
            <h3 className="font-bold mb-2">Why this course?</h3>
            <p className="text-stone-300 text-sm leading-relaxed mb-4">
              Clear thinking is the precursor to clear speaking. This course is designed to help you organize your mental models so your words land with impact every time.
            </p>
            <div className="flex -space-x-2">
              {[1,2,3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-stone-900 bg-stone-700 flex items-center justify-center text-xs font-bold">
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
              <div className="w-8 h-8 rounded-full border-2 border-stone-900 bg-stone-800 flex items-center justify-center text-[10px] text-stone-400">
                +2k
              </div>
            </div>
            <p className="text-xs text-stone-500 mt-2">Join 2,000+ learners</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
