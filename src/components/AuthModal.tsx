import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: { name: string; email: string }) => void;
}

export function AuthModal({ isOpen, onClose, onLogin }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  if (!isSupabaseConfigured && isOpen) {
    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400 hover:text-stone-600"
            >
              <X size={20} />
            </button>
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-600">
                <Lock size={32} />
              </div>
              <h2 className="text-2xl font-bold text-stone-900 mb-2">Setup Required</h2>
              <p className="text-stone-500 mb-6">
                Supabase is not configured. Please add your Supabase URL and Anon Key to the environment variables to enable authentication.
              </p>
              <button
                onClick={onClose}
                className="w-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold py-3 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    );
  }

  const handleResendConfirmation = async () => {
    setResendLoading(true);
    setResendSuccess(false);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: formData.email,
      });
      if (error) throw error;
      setResendSuccess(true);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setResendSuccess(false);
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.name,
            },
          },
        });

        if (error) throw error;

        if (data.session) {
          // User is logged in immediately (email confirmation disabled)
          onLogin({
            name: formData.name,
            email: formData.email,
          });
        } else if (data.user) {
          // User created but needs email verification
          setSuccessMessage("Account created successfully! Please check your email to confirm your registration before logging in.");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;

        if (data.user) {
          onLogin({
            name: data.user.user_metadata.full_name || 'User',
            email: data.user.email || '',
          });
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden relative"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400 hover:text-stone-600 z-10"
            >
              <X size={20} />
            </button>

            <div className="p-8">
              <div className="text-center mb-8">
                <div className="w-12 h-12 bg-olive-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-olive-600">
                  <User size={24} />
                </div>
                <h2 className="text-2xl font-serif font-bold text-stone-900">
                  {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-stone-500 mt-2">
                  {mode === 'login' 
                    ? 'Enter your details to access your progress.' 
                    : 'Start your journey to better pronunciation.'}
                </p>
              </div>

              {successMessage ? (
                <div className="text-center space-y-6">
                  <div className="p-4 bg-green-50 text-green-700 rounded-xl border border-green-100">
                    {successMessage}
                  </div>
                  <button
                    onClick={() => {
                        setMode('login');
                        setSuccessMessage(null);
                    }}
                    className="w-full bg-olive-500 hover:bg-olive-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-olive-500/20"
                  >
                    Go to Login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wide text-stone-500 ml-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-olive-500/20 focus:border-olive-500 transition-all"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wide text-stone-500 ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-olive-500/20 focus:border-olive-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wide text-stone-500 ml-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-olive-500/20 focus:border-olive-500 transition-all"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 text-center">
                    {error.toLowerCase().includes("email not confirmed") ? (
                      <div className="space-y-2">
                        <p>Please verify your email address.</p>
                        {resendSuccess ? (
                          <p className="text-green-600 font-medium">Confirmation email sent!</p>
                        ) : (
                          <button
                            type="button"
                            onClick={handleResendConfirmation}
                            disabled={resendLoading}
                            className="text-olive-600 hover:text-olive-700 font-bold underline text-xs"
                          >
                            {resendLoading ? 'Sending...' : 'Resend Confirmation Email'}
                          </button>
                        )}
                      </div>
                    ) : (
                      error
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-olive-500 hover:bg-olive-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-olive-500/20 flex items-center justify-center gap-2 mt-2"
                >
                  {isLoading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      {mode === 'login' ? 'Sign In' : 'Create Account'}
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
              )}

              <div className="mt-6 text-center">
                <p className="text-stone-500 text-sm">
                  {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                  <button
                    onClick={() => {
                        setMode(mode === 'login' ? 'signup' : 'login');
                        setError(null);
                        setFormData({ name: '', email: '', password: '' });
                    }}
                    className="text-olive-600 font-bold hover:underline"
                  >
                    {mode === 'login' ? 'Sign up' : 'Log in'}
                  </button>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
