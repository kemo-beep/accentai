export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export const BADGES: Badge[] = [
  { id: 'first_step', name: 'First Step', description: 'Complete your first practice session', icon: '🚀', color: 'bg-blue-100 text-blue-700' },
  { id: 'high_flyer', name: 'High Flyer', description: 'Achieve a pronunciation score of 90% or higher', icon: '🏆', color: 'bg-yellow-100 text-yellow-700' },
  { id: 'speedster', name: 'Speedster', description: 'Maintain a tempo of 130+ wpm', icon: '⚡', color: 'bg-emerald-100 text-emerald-700' },
  { id: 'smooth_talker', name: 'Smooth Talker', description: 'Less than 3 filler words in a session', icon: '🌊', color: 'bg-cyan-100 text-cyan-700' },
  { id: 'master_speaker', name: 'Master Speaker', description: 'Complete 10 total sessions', icon: '👑', color: 'bg-purple-100 text-purple-700' },
];

export const getEarnedBadges = (): string[] => {
  const saved = localStorage.getItem('user_badges');
  return saved ? JSON.parse(saved) : [];
};

export const checkNewBadges = (
  sessionStats: { pronunciationScore: number; tempo: number; fillerWordCount: number }, 
  totalSessions: number,
  earnedBadgeIds: string[] = []
): Badge[] => {
  const newBadges: Badge[] = [];

  // Check First Step
  if (!earnedBadgeIds.includes('first_step') && totalSessions >= 1) {
    newBadges.push(BADGES.find(b => b.id === 'first_step')!);
  }

  // Check High Flyer
  if (!earnedBadgeIds.includes('high_flyer') && sessionStats.pronunciationScore >= 90) {
    newBadges.push(BADGES.find(b => b.id === 'high_flyer')!);
  }

  // Check Speedster
  if (!earnedBadgeIds.includes('speedster') && sessionStats.tempo >= 130) {
    newBadges.push(BADGES.find(b => b.id === 'speedster')!);
  }

  // Check Smooth Talker
  if (!earnedBadgeIds.includes('smooth_talker') && sessionStats.fillerWordCount < 3) {
    newBadges.push(BADGES.find(b => b.id === 'smooth_talker')!);
  }

  // Check Master Speaker
  if (!earnedBadgeIds.includes('master_speaker') && totalSessions >= 10) {
    newBadges.push(BADGES.find(b => b.id === 'master_speaker')!);
  }

  return newBadges;
};
