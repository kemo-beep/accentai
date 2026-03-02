import React from 'react';
import { 
  Triangle, 
  Brain, 
  Puzzle, 
  Scale, 
  CloudFog, 
  Sun, 
  Search, 
  ListOrdered, 
  LayoutGrid, 
  GitFork, 
  Target, 
  ClipboardCheck, 
  Mail, 
  CheckCircle2, 
  XCircle, 
  ArrowUp, 
  ArrowDown, 
  Repeat, 
  Clock, 
  PauseCircle,
  Layers,
  Footprints,
  MessageSquare
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Slide } from '../data/courses';

interface SlideVisualProps {
  type: Slide['visualType'];
  className?: string;
}

export const SlideVisual: React.FC<SlideVisualProps> = ({ type, className }) => {
  if (!type) return null;

  const containerClass = cn(
    "w-full h-full flex items-center justify-center bg-stone-100/50 rounded-2xl p-8",
    className
  );

  switch (type) {
    case 'pyramid-intro':
      return (
        <div className={containerClass}>
          <div className="relative w-64 h-64 flex flex-col items-center justify-end">
            <div className="absolute inset-0 flex items-center justify-center">
              <Triangle size={240} className="text-olive-500 fill-olive-100" strokeWidth={1.5} />
            </div>
            <div className="z-10 text-center mb-8">
              <div className="font-bold text-olive-800 text-lg">Main Idea</div>
              <div className="text-olive-600 text-sm mt-2">Supporting Points</div>
              <div className="text-olive-400 text-xs mt-2">Data & Evidence</div>
            </div>
          </div>
        </div>
      );

    case 'pyramid-levels':
      return (
        <div className={containerClass}>
          <div className="flex flex-col w-64 gap-1">
            <div className="h-16 bg-olive-500 rounded-t-3xl flex items-center justify-center text-white font-bold shadow-sm">
              1. Answer
            </div>
            <div className="h-24 bg-olive-400 flex items-center justify-center text-white font-bold shadow-sm mx-4">
              2. Arguments
            </div>
            <div className="h-32 bg-olive-300 rounded-b-lg flex items-center justify-center text-white font-bold shadow-sm mx-8">
              3. Evidence
            </div>
          </div>
        </div>
      );

    case 'brain-cognitive':
      return (
        <div className={containerClass}>
          <div className="relative">
            <Brain size={180} className="text-stone-400" strokeWidth={1} />
            <div className="absolute top-0 right-0 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold border border-green-200 shadow-sm animate-bounce">
              Low Load
            </div>
            <div className="absolute bottom-10 left-10 text-stone-600 font-medium text-center w-40">
              Clear Structure =<br/>Less Effort
            </div>
          </div>
        </div>
      );

    case 'puzzle-mece':
      return (
        <div className={containerClass}>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-blue-100 p-6 rounded-tl-2xl rounded-br-2xl flex items-center justify-center">
              <Puzzle className="text-blue-500" size={48} />
            </div>
            <div className="bg-indigo-100 p-6 rounded-tr-2xl rounded-bl-2xl flex items-center justify-center">
              <Puzzle className="text-indigo-500" size={48} />
            </div>
            <div className="bg-indigo-100 p-6 rounded-tr-2xl rounded-bl-2xl flex items-center justify-center">
              <Puzzle className="text-indigo-500" size={48} />
            </div>
            <div className="bg-blue-100 p-6 rounded-tl-2xl rounded-br-2xl flex items-center justify-center">
              <Puzzle className="text-blue-500" size={48} />
            </div>
          </div>
          <div className="absolute bottom-6 font-mono text-xs text-stone-500 uppercase tracking-widest">
            No Gaps • No Overlaps
          </div>
        </div>
      );

    case 'scale-fact-opinion':
      return (
        <div className={containerClass}>
          <div className="relative w-full max-w-xs h-40 border-b-4 border-stone-800 flex items-end justify-between px-8">
            <div className="flex flex-col items-center mb-4 animate-pulse">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center border-2 border-blue-200 mb-2">
                <span className="font-bold text-blue-800">FACT</span>
              </div>
              <div className="w-4 h-12 bg-stone-400"></div>
            </div>
            
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-20 bg-stone-800"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <Scale size={48} className="text-stone-600" />
            </div>

            <div className="flex flex-col items-center mb-12 opacity-70">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center border-2 border-orange-200 mb-2 border-dashed">
                <span className="font-bold text-orange-800">OPINION</span>
              </div>
              <div className="w-4 h-12 bg-stone-400"></div>
            </div>
          </div>
        </div>
      );

    case 'fog-clarity':
      return (
        <div className={containerClass}>
          <div className="flex items-center gap-8">
            <div className="flex flex-col items-center opacity-50 blur-sm">
              <CloudFog size={80} className="text-stone-400" />
              <span className="mt-2 font-serif italic text-stone-500">Confusion</span>
            </div>
            <div className="h-24 w-px bg-stone-300"></div>
            <div className="flex flex-col items-center">
              <Sun size={80} className="text-amber-500 fill-amber-100" />
              <span className="mt-2 font-bold text-stone-800">Clarity</span>
            </div>
          </div>
        </div>
      );

    case 'magnifying-glass':
      return (
        <div className={containerClass}>
          <div className="relative">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200 w-48 text-xs text-stone-400 space-y-2">
              <div className="h-2 bg-stone-100 rounded w-3/4"></div>
              <div className="h-2 bg-stone-100 rounded w-full"></div>
              <div className="h-2 bg-stone-100 rounded w-5/6"></div>
              <div className="h-2 bg-stone-100 rounded w-4/5"></div>
            </div>
            <div className="absolute -top-4 -right-8 text-blue-600">
              <Search size={80} strokeWidth={2.5} />
            </div>
            <div className="absolute -bottom-6 right-0 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
              Where is the proof?
            </div>
          </div>
        </div>
      );

    case 'rule-of-three':
      return (
        <div className={containerClass}>
          <div className="flex gap-6">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-stone-900 text-white flex items-center justify-center text-3xl font-bold shadow-lg transform transition-transform hover:-translate-y-2">
                  {num}
                </div>
                <div className="w-12 h-2 bg-stone-200 rounded-full"></div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'pattern-three':
      return (
        <div className={containerClass}>
          <div className="grid grid-cols-3 gap-4">
            <div className="w-20 h-20 border-4 border-stone-300 rounded-full flex items-center justify-center">
              <div className="w-10 h-10 bg-stone-300 rounded-full"></div>
            </div>
            <div className="w-20 h-20 border-4 border-stone-300 rounded-full flex items-center justify-center">
              <div className="w-10 h-10 bg-stone-300 rounded-full"></div>
            </div>
            <div className="w-20 h-20 border-4 border-olive-500 rounded-full flex items-center justify-center shadow-lg bg-white">
              <div className="w-10 h-10 bg-olive-500 rounded-full"></div>
            </div>
          </div>
          <div className="absolute bottom-8 text-stone-500 font-mono text-sm">
            1... 2... Pattern!
          </div>
        </div>
      );

    case 'path-options':
      return (
        <div className={containerClass}>
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 bg-stone-800 rounded-full flex items-center justify-center text-white">
              <GitFork className="rotate-90" />
            </div>
            <div className="flex flex-col gap-4 ml-4">
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-stone-200 rounded"></div>
                <div className="w-8 h-8 rounded-full bg-stone-100 border-2 border-stone-200 flex items-center justify-center text-xs text-stone-400">A</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-stone-200 rounded"></div>
                <div className="w-8 h-8 rounded-full bg-stone-100 border-2 border-stone-200 flex items-center justify-center text-xs text-stone-400">B</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-olive-500 rounded shadow-sm"></div>
                <div className="w-8 h-8 rounded-full bg-olive-100 border-2 border-olive-500 flex items-center justify-center text-xs text-olive-700 font-bold">C</div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'target-arrow':
      return (
        <div className={containerClass}>
          <div className="relative">
            <Target size={160} className="text-red-100" />
            <Target size={100} className="text-red-200 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            <Target size={40} className="text-red-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
               <div className="w-1 h-32 bg-stone-800 absolute bottom-0 left-1/2 -translate-x-1/2 origin-bottom rotate-45"></div>
            </div>
            <div className="absolute -right-20 top-0 bg-stone-900 text-white px-3 py-1 rounded text-sm font-bold">
              BLUF
            </div>
          </div>
        </div>
      );

    case 'checklist':
      return (
        <div className={containerClass}>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-stone-100 w-64">
            <div className="flex items-center gap-3 mb-4 border-b pb-2">
              <ClipboardCheck className="text-olive-600" />
              <span className="font-bold text-stone-800">BLUF Checklist</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-stone-600">
                <div className="w-4 h-4 rounded border border-olive-500 bg-olive-500 flex items-center justify-center">
                  <CheckCircle2 size={12} className="text-white" />
                </div>
                <span>Core message first</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-stone-600">
                <div className="w-4 h-4 rounded border border-olive-500 bg-olive-500 flex items-center justify-center">
                  <CheckCircle2 size={12} className="text-white" />
                </div>
                <span>No buried lead</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-stone-600">
                <div className="w-4 h-4 rounded border border-olive-500 bg-olive-500 flex items-center justify-center">
                  <CheckCircle2 size={12} className="text-white" />
                </div>
                <span>Context follows</span>
              </div>
            </div>
          </div>
        </div>
      );

    case 'email-comparison':
      return (
        <div className={containerClass}>
          <div className="flex gap-4 w-full">
            <div className="flex-1 bg-red-50 border border-red-100 rounded-lg p-4 relative opacity-70">
              <div className="absolute -top-3 left-4 bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs font-bold uppercase">Bad</div>
              <div className="space-y-2">
                <div className="h-2 bg-red-200 rounded w-full"></div>
                <div className="h-2 bg-red-200 rounded w-full"></div>
                <div className="h-2 bg-red-200 rounded w-3/4"></div>
                <div className="h-2 bg-red-200 rounded w-1/2"></div>
              </div>
              <XCircle className="absolute bottom-2 right-2 text-red-300" size={20} />
            </div>
            <div className="flex-1 bg-green-50 border border-green-100 rounded-lg p-4 relative shadow-md">
              <div className="absolute -top-3 left-4 bg-green-100 text-green-600 px-2 py-0.5 rounded text-xs font-bold uppercase">Good (BLUF)</div>
              <div className="space-y-2">
                <div className="h-3 bg-green-600 rounded w-full mb-4"></div>
                <div className="h-2 bg-green-200 rounded w-full"></div>
                <div className="h-2 bg-green-200 rounded w-5/6"></div>
              </div>
              <CheckCircle2 className="absolute bottom-2 right-2 text-green-500" size={20} />
            </div>
          </div>
        </div>
      );

    case 'ladder-abstraction':
      return (
        <div className={containerClass}>
          <div className="relative h-64 w-40 flex flex-col justify-between items-center py-4">
            {/* Ladder rails */}
            <div className="absolute left-8 top-0 bottom-0 w-2 bg-stone-300 rounded-full"></div>
            <div className="absolute right-8 top-0 bottom-0 w-2 bg-stone-300 rounded-full"></div>
            
            {/* Rungs */}
            <div className="w-full h-2 bg-stone-300 rounded relative z-10"></div>
            <div className="w-full h-2 bg-stone-300 rounded relative z-10"></div>
            <div className="w-full h-2 bg-stone-300 rounded relative z-10"></div>
            <div className="w-full h-2 bg-stone-300 rounded relative z-10"></div>
            <div className="w-full h-2 bg-stone-300 rounded relative z-10"></div>

            {/* Labels */}
            <div className="absolute -top-2 -right-24 bg-blue-100 text-blue-800 px-3 py-1 rounded-lg text-sm font-bold shadow-sm">
              Abstract
            </div>
            <div className="absolute -bottom-2 -right-24 bg-green-100 text-green-800 px-3 py-1 rounded-lg text-sm font-bold shadow-sm">
              Concrete
            </div>
          </div>
        </div>
      );

    case 'velcro-teflon':
      return (
        <div className={containerClass}>
          <div className="flex gap-8">
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full shadow-inner flex items-center justify-center mb-2 border border-gray-300">
                <span className="text-gray-400 italic">Slips off...</span>
              </div>
              <span className="font-bold text-gray-500">Abstract (Teflon)</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 bg-stone-800 rounded-lg shadow-lg flex items-center justify-center mb-2 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:8px_8px]"></div>
                <span className="text-white font-bold text-lg z-10">STICKS!</span>
              </div>
              <span className="font-bold text-stone-800">Concrete (Velcro)</span>
            </div>
          </div>
        </div>
      );

    case 'dance-abstract-concrete':
      return (
        <div className={containerClass}>
          <div className="flex flex-col items-center gap-4">
            <div className="bg-blue-50 text-blue-800 px-6 py-3 rounded-lg font-bold border border-blue-100 w-48 text-center">
              Principle
            </div>
            <div className="flex gap-4">
              <ArrowDown className="text-stone-400 animate-bounce" />
              <ArrowUp className="text-stone-400 animate-bounce delay-100" />
            </div>
            <div className="bg-green-50 text-green-800 px-6 py-3 rounded-lg font-bold border border-green-100 w-48 text-center">
              Example
            </div>
          </div>
        </div>
      );

    case 'prep-framework':
      return (
        <div className={containerClass}>
          <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
            <div className="bg-stone-900 text-white p-4 rounded-xl flex flex-col items-center justify-center aspect-square shadow-lg">
              <span className="text-4xl font-black text-olive-500">P</span>
              <span className="text-xs uppercase tracking-widest mt-1">Point</span>
            </div>
            <div className="bg-white border-2 border-stone-100 p-4 rounded-xl flex flex-col items-center justify-center aspect-square text-stone-400">
              <span className="text-4xl font-black">R</span>
              <span className="text-xs uppercase tracking-widest mt-1">Reason</span>
            </div>
            <div className="bg-white border-2 border-stone-100 p-4 rounded-xl flex flex-col items-center justify-center aspect-square text-stone-400">
              <span className="text-4xl font-black">E</span>
              <span className="text-xs uppercase tracking-widest mt-1">Example</span>
            </div>
            <div className="bg-stone-900 text-white p-4 rounded-xl flex flex-col items-center justify-center aspect-square shadow-lg">
              <span className="text-4xl font-black text-olive-500">P</span>
              <span className="text-xs uppercase tracking-widest mt-1">Point</span>
            </div>
          </div>
        </div>
      );

    case 'timeline-ppf':
      return (
        <div className={containerClass}>
          <div className="relative w-full max-w-md flex items-center justify-between px-8">
            <div className="absolute left-0 right-0 h-1 bg-stone-200 top-1/2 -translate-y-1/2 z-0"></div>
            
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="w-4 h-4 bg-stone-400 rounded-full border-4 border-white shadow-sm"></div>
              <span className="text-xs font-bold text-stone-400 uppercase">Past</span>
            </div>
            
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="w-8 h-8 bg-olive-500 rounded-full border-4 border-white shadow-md flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </div>
              <span className="text-sm font-bold text-olive-600 uppercase">Present</span>
            </div>

            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="w-4 h-4 bg-stone-300 rounded-full border-4 border-white shadow-sm border-dashed"></div>
              <span className="text-xs font-bold text-stone-400 uppercase">Future</span>
            </div>
          </div>
        </div>
      );

    case 'pause-button':
      return (
        <div className={containerClass}>
          <div className="relative flex items-center justify-center">
            <div className="absolute w-32 h-32 bg-olive-100 rounded-full animate-ping opacity-20"></div>
            <PauseCircle size={80} className="text-olive-600 relative z-10" />
            <div className="absolute -bottom-12 text-center">
              <div className="text-sm font-bold text-stone-600">Breathe</div>
              <div className="text-xs text-stone-400">Don't say "Um"</div>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
};
