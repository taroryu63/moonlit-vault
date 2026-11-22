// audio.js — every sound in Moonlit Vault is synthesised with WebAudio.
// No audio files, no network: short oscillator envelopes shaped by hand.

let ctx = null;
let master = null;

export function ensureAudio() {
  if (ctx) {
    if (ctx.state === 'suspended') ctx.resume();
    return;
  }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0.22;
  master.connect(ctx.destination);
}

function tone(freqFrom, freqTo, duration, type, volume, when = 0) {
  if (!ctx || !master) return;
  const t0 = ctx.currentTime + when;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freqFrom, t0);
  osc.frequency.exponentialRampToValueAtTime(Math.max(30, freqTo), t0 + duration);
  gain.gain.setValueAtTime(volume, t0);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
  osc.connect(gain);
  gain.connect(master);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

// A soft padded footstep; pitch drops a little when sneaking.
export function playStep(sneaking) {
  tone(sneaking ? 140 : 190, 70, 0.07, 'triangle', sneaking ? 0.25 : 0.5);
}

// Two rising notes: a guard has noticed something.
export function playSuspicion() {
  tone(520, 660, 0.1, 'square', 0.25);
  tone(660, 880, 0.12, 'square', 0.25, 0.09);
}

// Hard alarm sting when the detection meter fills.
export function playCaught() {
  tone(320, 90, 0.5, 'sawtooth', 0.6);
  tone(210, 60, 0.6, 'sawtooth', 0.5, 0.08);
}

// Bright little arpeggio for picking up a moon shard.
export function playPickup() {
  tone(880, 880, 0.07, 'sine', 0.5);
  tone(1174, 1174, 0.07, 'sine', 0.5, 0.07);
  tone(1568, 1568, 0.1, 'sine', 0.5, 0.14);
}

// Warm chord for slipping through the exit unseen.
export function playEscape() {
  tone(392, 392, 0.35, 'sine', 0.45);
  tone(494, 494, 0.35, 'sine', 0.4, 0.1);
  tone(587, 587, 0.5, 'sine', 0.45, 0.2);
}
