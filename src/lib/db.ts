import { supabase } from './supabase';

export interface PracticeSessionData {
  industry: string;
  score: number;
  duration: number; // in seconds
  tempo: number;
  filler_count: number;
  feedback: string[];
  transcript: any[];
}

export interface UserBadge {
  badge_id: string;
  earned_at: string;
}

export const db = {
  // Practice Sessions
  async savePracticeSession(userId: string, session: PracticeSessionData) {
    const { data, error } = await supabase
      .from('practice_sessions')
      .insert({
        user_id: userId,
        industry: session.industry,
        score: session.score,
        duration: session.duration,
        feedback: session.feedback,
        tempo: session.tempo,
        filler_count: session.filler_count,
        // Store extra stats in the transcript JSONB for flexibility
        transcript: {
          messages: session.transcript,
          stats: {
            tempo: session.tempo,
            filler_count: session.filler_count
          }
        }
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getPracticeSessions(userId: string) {
    const { data, error } = await supabase
      .from('practice_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Badges
  async getUserBadges(userId: string) {
    const { data, error } = await supabase
      .from('user_badges')
      .select('badge_id, earned_at')
      .eq('user_id', userId);

    if (error) throw error;
    return data as UserBadge[];
  },

  async saveUserBadge(userId: string, badgeId: string) {
    const { data, error } = await supabase
      .from('user_badges')
      .insert({
        user_id: userId,
        badge_id: badgeId
      })
      .select()
      .single();

    if (error) {
      // Ignore duplicate key errors (badge already earned)
      if (error.code === '23505') return null;
      throw error;
    }
    return data;
  },

  // Profile
  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  }
};
