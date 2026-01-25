/**
 * Notification sound utilities using Web Audio API
 * Generates pleasant notification chimes without external audio files
 */

const SOUND_SETTINGS_KEY = 'admin-notification-sound-settings';

interface SoundSettings {
  enabled: boolean;
  volume: number;
}

const DEFAULT_SETTINGS: SoundSettings = {
  enabled: true,
  volume: 0.5,
};

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioContext;
}

export function getSoundSettings(): SoundSettings {
  try {
    const stored = localStorage.getItem(SOUND_SETTINGS_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch {
    // Ignore storage errors
  }
  return DEFAULT_SETTINGS;
}

export function saveSoundSettings(settings: Partial<SoundSettings>): void {
  try {
    const current = getSoundSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(SOUND_SETTINGS_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Play a pleasant notification chime using Web Audio API
 * Creates a two-tone ascending chime sound
 */
export function playNotificationSound(): void {
  const settings = getSoundSettings();
  if (!settings.enabled) return;

  try {
    const ctx = getAudioContext();
    
    // Resume audio context if suspended (required for autoplay policies)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;
    const volume = settings.volume * 0.3; // Scale down for comfortable listening

    // Create a pleasant two-note chime (C5 and E5)
    const frequencies = [523.25, 659.25]; // C5, E5
    
    frequencies.forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, now);
      
      // Add slight vibrato for warmth
      const vibrato = ctx.createOscillator();
      const vibratoGain = ctx.createGain();
      vibrato.frequency.setValueAtTime(5, now);
      vibratoGain.gain.setValueAtTime(2, now);
      vibrato.connect(vibratoGain);
      vibratoGain.connect(oscillator.frequency);
      vibrato.start(now + index * 0.15);
      vibrato.stop(now + index * 0.15 + 0.4);
      
      // Envelope: quick attack, medium decay
      gainNode.gain.setValueAtTime(0, now + index * 0.15);
      gainNode.gain.linearRampToValueAtTime(volume, now + index * 0.15 + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + index * 0.15 + 0.4);
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.start(now + index * 0.15);
      oscillator.stop(now + index * 0.15 + 0.5);
    });

    // Add a subtle "ding" overtone for richness
    const dingOsc = ctx.createOscillator();
    const dingGain = ctx.createGain();
    dingOsc.type = 'triangle';
    dingOsc.frequency.setValueAtTime(1046.5, now); // C6
    dingGain.gain.setValueAtTime(0, now);
    dingGain.gain.linearRampToValueAtTime(volume * 0.3, now + 0.01);
    dingGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    dingOsc.connect(dingGain);
    dingGain.connect(ctx.destination);
    dingOsc.start(now);
    dingOsc.stop(now + 0.4);

  } catch (error) {
    console.warn('Failed to play notification sound:', error);
  }
}

/**
 * Play a cash register "ka-ching" sound for order notifications
 */
export function playOrderSound(): void {
  const settings = getSoundSettings();
  if (!settings.enabled) return;

  try {
    const ctx = getAudioContext();
    
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;
    const volume = settings.volume * 0.25;

    // First: metallic "ka" sound
    const noise = ctx.createBufferSource();
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseData.length; i++) {
      noiseData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (noiseData.length * 0.3));
    }
    noise.buffer = noiseBuffer;
    
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(3000, now);
    
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(volume * 0.5, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(now);

    // Second: bell-like "ching" (ascending arpeggio)
    const notes = [784, 988, 1175, 1480]; // G5, B5, D6, F#6
    
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(4000, now);
      filter.Q.setValueAtTime(1, now);
      
      const startTime = now + 0.03 + i * 0.03;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(volume * (1 - i * 0.15), startTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + 0.5);
    });

  } catch (error) {
    console.warn('Failed to play order sound:', error);
  }
}

/**
 * Test the notification sound (for settings preview)
 */
export function testNotificationSound(): void {
  const originalSettings = getSoundSettings();
  // Temporarily enable sound for testing
  const testSettings = { ...originalSettings, enabled: true };
  localStorage.setItem(SOUND_SETTINGS_KEY, JSON.stringify(testSettings));
  
  playOrderSound();
  
  // Restore original settings
  localStorage.setItem(SOUND_SETTINGS_KEY, JSON.stringify(originalSettings));
}
