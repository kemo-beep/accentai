import {
  BookOpen,
  Mic,
  BarChart3,
  Trophy,
  Settings,
  User,
  Menu,
  X,
  GraduationCap
} from 'lucide-react';
import { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  isLoggedIn: boolean;
  user: { name: string; email: string } | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
}

export function Layout({ children, activeTab, onTabChange, isLoggedIn, user, onLoginClick, onLogoutClick }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BookOpen },
    { id: 'learn', label: 'Learn', icon: GraduationCap },
    { id: 'practice', label: 'Practice', icon: Mic },
    { id: 'stats', label: 'Progress', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-cream-50 text-stone-900">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-stone-200 bg-cream-50 sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-olive-500 flex items-center justify-center text-white font-serif font-bold">
            A
          </div>
          <span className="font-serif font-bold text-lg">Accent AI</span>
        </div>
        <div className="flex items-center gap-3">
            {!isLoggedIn && (
                <button 
                    onClick={onLoginClick}
                    className="text-sm font-bold text-olive-600 hover:text-olive-700"
                >
                    Sign In
                </button>
            )}
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-16 left-0 right-0 bg-cream-50 border-b border-stone-200 z-10 shadow-lg"
          >
            <nav className="p-4 flex flex-col gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl transition-colors",
                    activeTab === item.id
                      ? "bg-olive-500 text-white"
                      : "hover:bg-cream-100 text-stone-600"
                  )}
                >
                  <item.icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-stone-200 p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 rounded-full bg-olive-500 flex items-center justify-center text-white font-serif font-bold text-xl shadow-sm">
            A
          </div>
          <span className="font-serif font-bold text-xl">Accent AI</span>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl transition-all duration-200",
                activeTab === item.id
                  ? "bg-olive-500 text-white shadow-md"
                  : "hover:bg-cream-100 text-stone-600 hover:pl-4"
              )}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-stone-200">
          {isLoggedIn ? (
              <div className="p-4 bg-cream-100 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="text-terracotta-500" size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Daily Streak</span>
                </div>
                <div className="flex items-end gap-1">
                  <span className="text-2xl font-serif font-bold text-stone-900">12</span>
                  <span className="text-sm text-stone-500 mb-1">days</span>
                </div>
              </div>
          ) : (
              <button 
                onClick={onLoginClick}
                className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <User size={18} />
                Sign In
              </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-[calc(100vh-64px)] md:h-screen">
        <div className="max-w-5xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
