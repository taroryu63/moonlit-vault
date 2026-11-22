// main.js — Moonlit Vault: game state, the detection meter, and the loop.
// States: title -> playing -> clear (between levels) -> win, or caught.
// Query parameters exist for screenshots and testing:
//   ?level=2      start playing on that level
//   ?screen=title|caught|win   show that screen over level 1

import { LEVELS, STAGE_W, STAGE_H } from './levels.js';
import { Player, PLAYER_RADIUS } from './player.js';
import { Guard } from './guards.js';
import { drawScene } from './render.js';
import { ensureAudio, playStep, playSuspicion, playCaught, playPickup, playEscape } from './audio.js';

const canvas = document.getElementById('stage');
const ctx = canvas.getContext('2d');

const params = new URLSearchParams(location.search);
const keys = new Set();

const state = {
  screen: 'title',
  levelIndex: 0,
  level: null,
  player: null,
  guards: [],
  shards: [],
  detection: 0,
  time: 0,
  levelTime: 0,
  totalShards: 0,
  clearTimer: 0,
  wasSeen: false,
};

function loadLevel(index) {
  const level = LEVELS[index];
  state.levelIndex = index;
  state.level = level;
  state.player = new Player(level.playerStart);
  state.guards = level.guards.map((def) => new Guard(def));
  state.shards = level.shards.map((s) => ({ x: s.x, y: s.y, taken: false }));
  state.detection = 0;
  state.levelTime = 0;
  state.wasSeen = false;
}

function startGame(fromLevel = 0) {
  state.totalShards = 0;
  loadLevel(fromLevel);
  state.screen = 'playing';
}

function applyQueryParams() {
  const levelParam = parseInt(params.get('level') || '', 10);
  const screenParam = params.get('screen');
  if (Number.isFinite(levelParam) && levelParam >= 1 && levelParam <= LEVELS.length) {
    startGame(levelParam - 1);
  } else if (screenParam === 'caught' || screenParam === 'win') {
    loadLevel(0);
    state.screen = screenParam;
    if (screenParam === 'caught') state.detection = 100;
  } else {
    loadLevel(0);
    state.screen = 'title';
  }
}

function updateDetection(dt) {
  let nearest = Infinity;
  for (const guard of state.guards) {
    if (guard.seesPlayer) {
      const d = Math.hypot(guard.x - state.player.x, guard.y - state.player.y);
      if (d < nearest) nearest = d;
    }
  }
  if (nearest !== Infinity) {
    // Closer is faster; sneaking and shadow pools buy precious seconds.
    let rate = 88 - Math.min(48, nearest * 0.22);
    if (state.player.sneaking) rate *= 0.5;
    if (state.player.inShadow(state.level.shadows)) rate *= 0.45;
    if (state.player.moving && !state.player.sneaking) rate *= 1.2;
    state.detection = Math.min(100, state.detection + rate * dt);
    if (!state.wasSeen && state.detection > 25) playSuspicion();
    state.wasSeen = true;
  } else {
    state.detection = Math.max(0, state.detection - 30 * dt);
    if (state.detection <= 0) state.wasSeen = false;
  }
  if (state.detection >= 100) {
    state.screen = 'caught';
    playCaught();
  }
}

function updatePlaying(dt) {
  state.levelTime += dt;
  if (state.player.update(dt, keys, state.level.walls)) {
    playStep(state.player.sneaking);
  }
  for (const guard of state.guards) guard.update(dt, state.level.walls, state.player);
  updateDetection(dt);
  if (state.screen !== 'playing') return;

  for (const shard of state.shards) {
    if (!shard.taken && Math.hypot(shard.x - state.player.x, shard.y - state.player.y) < PLAYER_RADIUS + 12) {
      shard.taken = true;
      state.totalShards += 1;
      playPickup();
    }
  }

  const exit = state.level.exit;
  const insideExit =
    state.player.x > exit.x && state.player.x < exit.x + exit.w &&
    state.player.y > exit.y && state.player.y < exit.y + exit.h;
  if (insideExit) {
    playEscape();
    if (state.levelIndex + 1 >= LEVELS.length) {
      state.screen = 'win';
    } else {
      state.screen = 'clear';
      state.clearTimer = 1.8;
    }
  }
}

function update(dt) {
  state.time += dt;
  if (state.screen === 'playing') updatePlaying(dt);
  else if (state.screen === 'clear') {
    state.clearTimer -= dt;
    if (state.clearTimer <= 0) {
      loadLevel(state.levelIndex + 1);
      state.screen = 'playing';
    }
  }
}

// ---------- drawing the frame, HUD and screens ----------

function drawHud() {
  ctx.fillStyle = 'rgba(6, 9, 20, 0.82)';
  ctx.fillRect(0, 0, STAGE_W, 44);
  ctx.fillStyle = '#dfe7ff';
  ctx.font = 'bold 16px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(state.level.name, 14, 28);

  // Detection meter: fills amber, then red.
  const meterW = 220;
  const meterX = STAGE_W - meterW - 150;
  ctx.fillStyle = '#2a3352';
  ctx.fillRect(meterX, 14, meterW, 16);
  const frac = state.detection / 100;
  ctx.fillStyle = frac > 0.66 ? '#ff5347' : frac > 0.33 ? '#ffb84d' : '#ffe9a8';
  ctx.fillRect(meterX, 14, meterW * frac, 16);
  ctx.strokeStyle = '#5d6fa3';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(meterX, 14, meterW, 16);
  ctx.fillStyle = '#dfe7ff';
  ctx.font = '12px system-ui, sans-serif';
  ctx.fillText('SPOTTED', meterX, 10 + 2);

  ctx.textAlign = 'right';
  ctx.font = 'bold 16px system-ui, sans-serif';
  ctx.fillText(`◆ ${state.totalShards}`, STAGE_W - 78, 28);
  ctx.fillText(`${state.levelTime.toFixed(1)}s`, STAGE_W - 14, 28);
}

function veil(alpha) {
  ctx.fillStyle = `rgba(4, 6, 16, ${alpha})`;
  ctx.fillRect(0, 0, STAGE_W, STAGE_H);
}

function centerText(text, y, font, color) {
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.fillStyle = color;
  ctx.fillText(text, STAGE_W / 2, y);
}

function drawScreens() {
  if (state.screen === 'title') {
    veil(0.55);
    centerText('MOONLIT VAULT', 218, 'bold 64px Georgia, serif', '#ffd94d');
    centerText('A tiny tale of shadows and wardens', 262, '20px system-ui, sans-serif', '#c9d6ff');
    centerText('Slip past the lantern cones, hide behind stone and shadow,', 330, '18px system-ui, sans-serif', '#e8eeff');
    centerText('gather moon shards if you dare, and reach the EXIT unseen.', 358, '18px system-ui, sans-serif', '#e8eeff');
    centerText('Move: WASD / arrows · Sneak: Shift · Start: Enter or click', 420, 'bold 17px system-ui, sans-serif', '#7df0dd');
    centerText('Three levels. One vault. No second chances.', 470, '15px system-ui, sans-serif', '#8fa1cc');
  } else if (state.screen === 'caught') {
    veil(0.45);
    centerText('SPOTTED!', 280, 'bold 58px Georgia, serif', '#ff5347');
    centerText('The wardens drag you back to the gate.', 330, '19px system-ui, sans-serif', '#ffd9d4');
    centerText('Press R or click to try the level again', 386, 'bold 17px system-ui, sans-serif', '#7df0dd');
  } else if (state.screen === 'clear') {
    veil(0.35);
    centerText('UNSEEN!', 290, 'bold 48px Georgia, serif', '#7dffce');
    centerText('You melt into the dark…', 336, '18px system-ui, sans-serif', '#d8ffef');
  } else if (state.screen === 'win') {
    veil(0.55);
    centerText('THE VAULT IS YOURS', 240, 'bold 52px Georgia, serif', '#ffd94d');
    centerText(`You escaped all three levels with ◆ ${state.totalShards} moon shards.`, 300, '19px system-ui, sans-serif', '#e8eeff');
    centerText('Press Enter or click to play again', 366, 'bold 17px system-ui, sans-serif', '#7df0dd');
  }
}

function draw() {
  drawScene(ctx, state);
  drawHud();
  if (state.screen !== 'playing') drawScreens();
  if (state.screen === 'playing' && state.levelTime < 4) {
    ctx.textAlign = 'center';
    ctx.font = '15px system-ui, sans-serif';
    ctx.fillStyle = 'rgba(223, 231, 255, 0.85)';
    ctx.fillText(state.level.hint, STAGE_W / 2, STAGE_H - 14);
  }
}

// ---------- input ----------

window.addEventListener('keydown', (event) => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) {
    event.preventDefault();
  }
  ensureAudio();
  keys.add(event.code);
  if (state.screen === 'title' && (event.code === 'Enter' || event.code === 'Space')) startGame(0);
  else if (state.screen === 'caught' && event.code === 'KeyR') {
    loadLevel(state.levelIndex);
    state.screen = 'playing';
  }
  else if (state.screen === 'win' && event.code === 'Enter') startGame(0);
});
window.addEventListener('keyup', (event) => keys.delete(event.code));
window.addEventListener('blur', () => keys.clear());
canvas.addEventListener('pointerdown', () => {
  ensureAudio();
  if (state.screen === 'title') startGame(0);
  else if (state.screen === 'caught') {
    loadLevel(state.levelIndex);
    state.screen = 'playing';
  } else if (state.screen === 'win') startGame(0);
});

// ---------- boot & loop ----------

applyQueryParams();

let lastStamp = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - lastStamp) / 1000);
  lastStamp = now;
  update(dt);
  draw();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
