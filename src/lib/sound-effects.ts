// Simple sound effects using Web Audio API
// This avoids external dependencies or assets

let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

const playTone = (freq: number, type: OscillatorType, duration: number, startTime: number, vol: number = 0.1) => {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);

  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(vol, startTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration);
};

export const playStartSound = () => {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  // Ascending major triad (C4, E4, G4)
  playTone(261.63, 'sine', 0.3, now, 0.1);
  playTone(329.63, 'sine', 0.3, now + 0.1, 0.1);
  playTone(392.00, 'sine', 0.6, now + 0.2, 0.1);
};

export const playEndSound = () => {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  // Descending tones
  playTone(392.00, 'sine', 0.3, now, 0.1);
  playTone(329.63, 'sine', 0.3, now + 0.1, 0.1);
  playTone(261.63, 'sine', 0.6, now + 0.2, 0.1);
};

export const playFeedbackSound = () => {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  // Gentle "pop" or notification sound (short, soft square wave with filter)
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(440, now);
  osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
  
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.05, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start(now);
  osc.stop(now + 0.15);
};

export const playSuccessSound = () => {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  // Bright major chord (C5, E5, G5, C6)
  playTone(523.25, 'sine', 0.4, now, 0.05);
  playTone(659.25, 'sine', 0.4, now + 0.05, 0.05);
  playTone(783.99, 'sine', 0.4, now + 0.1, 0.05);
  playTone(1046.50, 'sine', 0.8, now + 0.15, 0.05);
};
