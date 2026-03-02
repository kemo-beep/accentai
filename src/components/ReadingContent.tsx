import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { Quote } from 'lucide-react';

interface ReadingContentProps {
  content: string;
  className?: string;
}

export function ReadingContent({ content, className }: ReadingContentProps) {
  return (
    <div className={cn("max-w-none font-sans", className)}>
      <ReactMarkdown
        components={{
          h1: ({ ...props }) => (
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 mt-12 mb-6 first:mt-0 tracking-tight leading-tight" {...props} />
          ),
          h2: ({ ...props }) => (
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 mt-12 mb-5 tracking-tight leading-snug relative" {...props} />
          ),
          h3: ({ ...props }) => (
            <h3 className="text-xl md:text-2xl font-serif font-bold text-stone-800 mt-8 mb-4 leading-snug" {...props} />
          ),
          h4: ({ ...props }) => (
            <h4 className="text-lg md:text-xl font-bold text-stone-800 mt-6 mb-3 uppercase tracking-wide text-sm" {...props} />
          ),
          p: ({ ...props }) => (
            <p className="text-stone-700 leading-relaxed mb-6 text-lg md:text-xl" {...props} />
          ),
          ul: ({ ...props }) => (
            <ul className="space-y-3 mb-8 ml-6 list-disc marker:text-stone-400" {...props} />
          ),
          ol: ({ ...props }) => (
            <ol className="space-y-3 mb-8 ml-6 list-decimal marker:text-stone-900 marker:font-bold" {...props} />
          ),
          li: ({ children, ...props }) => (
            <li className="text-stone-700 leading-relaxed text-lg md:text-xl pl-2" {...props}>
              {children}
            </li>
          ),
          blockquote: ({ ...props }) => (
            <div className="my-10 pl-6 md:pl-8 border-l-4 border-olive-500 py-2 relative">
              <Quote className="absolute -top-2 -left-3 text-olive-500 bg-white p-1 w-6 h-6" fill="currentColor" />
              <blockquote className="font-serif text-xl md:text-2xl text-stone-800 italic leading-relaxed" {...props} />
            </div>
          ),
          img: ({ src, alt, ...props }) => (
            <figure className="my-10">
              <div className="rounded-2xl overflow-hidden shadow-sm border border-stone-100 bg-stone-50">
                <img 
                  src={src} 
                  alt={alt} 
                  className="w-full h-auto object-cover" 
                  referrerPolicy="no-referrer"
                  {...props} 
                />
              </div>
              {alt && <figcaption className="text-center text-sm text-stone-500 mt-3 font-medium uppercase tracking-wide">{alt}</figcaption>}
            </figure>
          ),
          hr: ({ ...props }) => (
            <hr className="my-12 border-stone-200 border-t-2 border-dashed" {...props} />
          ),
          strong: ({ ...props }) => (
            <strong className="font-bold text-stone-900" {...props} />
          ),
          a: ({ ...props }) => (
            <a className="text-olive-600 underline decoration-olive-300 underline-offset-4 hover:text-olive-700 hover:decoration-olive-500 transition-colors font-medium" {...props} />
          ),
          code: ({ className, children, ...props }) => {
            // @ts-ignore - ReactMarkdown types are tricky with children
            const isInline = !String(children).includes('\n');
            if (isInline) {
              return (
                <code className="bg-stone-100 text-stone-800 px-1.5 py-0.5 rounded-md font-mono text-sm border border-stone-200" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <div className="my-8 rounded-xl overflow-hidden bg-stone-900 text-stone-50 p-6 shadow-lg border border-stone-800">
                <code className="font-mono text-sm leading-relaxed block overflow-x-auto" {...props}>
                  {children}
                </code>
              </div>
            );
          },
          table: ({ ...props }) => (
            <div className="overflow-x-auto my-8 rounded-xl border border-stone-200 shadow-sm">
              <table className="w-full text-left border-collapse" {...props} />
            </div>
          ),
          thead: ({ ...props }) => (
            <thead className="bg-stone-50 border-b border-stone-200" {...props} />
          ),
          th: ({ ...props }) => (
            <th className="px-6 py-4 font-bold text-stone-900 text-sm uppercase tracking-wider" {...props} />
          ),
          td: ({ ...props }) => (
            <td className="px-6 py-4 border-b border-stone-100 text-stone-700" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
