// render.js — all drawing for Moonlit Vault. A moonlit blue stage, warm
// lantern vision cones clipped by the cover, and flat readable characters
// so a screenshot at a glance shows: level, guards, cones, cover, exit.

import { rayLength } from './geometry.js';
import { GUARD_RADIUS, VISION_HALF_ANGLE, VISION_RANGE } from './guards.js';
import { PLAYER_RADIUS } from './player.js';
import { STAGE_W, STAGE_H } from './levels.js';

const FLOOR_A = '#1b2440';
const FLOOR_B = '#202b4a';
const WALL_FILL = '#4a3b2a';
const WALL_EDGE = '#8a6f47';
const SHADOW_FILL = 'rgba(5, 8, 20, 0.55)';

export function drawScene(ctx, state) {
  drawFloor(ctx);
  for (const s of state.level.shadows) drawShadowPool(ctx, s);
  drawExit(ctx, state.level.exit, state.time);
  for (const w of state.level.walls) drawWall(ctx, w);
  for (const shard of state.shards) {
    if (!shard.taken) drawShard(ctx, shard, state.time);
  }
  // Cones first so the wardens and the infiltrator stand out on top of them.
  for (const guard of state.guards) drawVisionCone(ctx, guard, state.level.walls);
  for (const guard of state.guards) drawGuard(ctx, guard);
  drawPlayer(ctx, state.player);
}

function drawFloor(ctx) {
  ctx.fillStyle = FLOOR_A;
  ctx.fillRect(0, 0, STAGE_W, STAGE_H);
  const tile = 40;
  ctx.fillStyle = FLOOR_B;
  for (let y = 0; y < STAGE_H / tile; y++) {
    for (let x = 0; x < STAGE_W / tile; x++) {
      if ((x + y) % 2 === 0) ctx.fillRect(x * tile, y * tile, tile, tile);
    }
  }
  // Moonlit border of the stage.
  ctx.strokeStyle = '#5d6fa3';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, STAGE_W - 4, STAGE_H - 4);
}

function drawShadowPool(ctx, rect) {
  ctx.fillStyle = SHADOW_FILL;
  ctx.beginPath();
  ctx.roundRect(rect.x, rect.y, rect.w, rect.h, 18);
  ctx.fill();
}

function drawWall(ctx, rect) {
  ctx.fillStyle = WALL_FILL;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.strokeStyle = WALL_EDGE;
  ctx.lineWidth = 3;
  ctx.strokeRect(rect.x + 1.5, rect.y + 1.5, rect.w - 3, rect.h - 3);
  // Stone seams so cover reads as solid blocks, not UI panels.
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 1;
  const seam = 30;
  for (let x = rect.x + seam; x < rect.x + rect.w - 4; x += seam) {
    ctx.beginPath();
    ctx.moveTo(x, rect.y + 3);
    ctx.lineTo(x, rect.y + rect.h - 3);
    ctx.stroke();
  }
  for (let y = rect.y + seam; y < rect.y + rect.h - 4; y += seam) {
    ctx.beginPath();
    ctx.moveTo(rect.x + 3, y);
    ctx.lineTo(rect.x + rect.w - 3, y);
    ctx.stroke();
  }
}

function drawExit(ctx, exit, time) {
  const pulse = 0.75 + 0.25 * Math.sin(time * 3);
  ctx.save();
  ctx.shadowColor = '#39e6a3';
  ctx.shadowBlur = 22 * pulse;
  ctx.fillStyle = '#123f2e';
  ctx.fillRect(exit.x, exit.y, exit.w, exit.h);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#39e6a3';
  ctx.lineWidth = 3;
  ctx.strokeRect(exit.x + 2, exit.y + 2, exit.w - 4, exit.h - 4);
  ctx.fillStyle = '#7dffce';
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('EXIT', exit.x + exit.w / 2, exit.y + exit.h / 2 + 4);
  ctx.restore();
}

function drawShard(ctx, shard, time) {
  const bob = Math.sin(time * 2.4 + shard.x) * 3;
  ctx.save();
  ctx.translate(shard.x, shard.y + bob);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = '#ffd94d';
  ctx.shadowColor = '#ffd94d';
  ctx.shadowBlur = 12;
  ctx.fillRect(-7, -7, 14, 14);
  ctx.restore();
}

function drawVisionCone(ctx, guard, walls) {
  const steps = 26;
  ctx.beginPath();
  ctx.moveTo(guard.x, guard.y);
  for (let i = 0; i <= steps; i++) {
    const angle = guard.facing - VISION_HALF_ANGLE + (2 * VISION_HALF_ANGLE * i) / steps;
    const len = rayLength(guard.x, guard.y, angle, VISION_RANGE, walls);
    ctx.lineTo(guard.x + Math.cos(angle) * len, guard.y + Math.sin(angle) * len);
  }
  ctx.closePath();
  const alert = guard.alertLevel;
  const r = Math.round(255);
  const g = Math.round(198 - alert * 110);
  const b = Math.round(84 - alert * 50);
  ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.23 + alert * 0.14})`;
  ctx.fill();
}

function drawGuard(ctx, guard) {
  ctx.save();
  ctx.translate(guard.x, guard.y);
  // Lantern ring.
  ctx.beginPath();
  ctx.arc(0, 0, GUARD_RADIUS + 4, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 190, 90, 0.18)';
  ctx.fill();
  // Body: a rust-red warden with a brass helmet.
  ctx.beginPath();
  ctx.arc(0, 0, GUARD_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = '#b3402e';
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#5f1d12';
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, GUARD_RADIUS - 5, 0, Math.PI * 2);
  ctx.fillStyle = '#d9a441';
  ctx.fill();
  // Facing tick.
  ctx.rotate(guard.facing);
  ctx.fillStyle = '#fff2cf';
  ctx.beginPath();
  ctx.moveTo(GUARD_RADIUS + 7, 0);
  ctx.lineTo(GUARD_RADIUS - 2, -4.5);
  ctx.lineTo(GUARD_RADIUS - 2, 4.5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  if (guard.alertLevel > 0.25) {
    ctx.save();
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = guard.alertLevel > 0.75 ? '#ff5347' : '#ffd94d';
    ctx.fillText(guard.alertLevel > 0.75 ? '!' : '?', guard.x, guard.y - GUARD_RADIUS - 10);
    ctx.restore();
  }
}

function drawPlayer(ctx, player) {
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.beginPath();
  ctx.arc(0, 0, PLAYER_RADIUS + 5, 0, Math.PI * 2);
  ctx.fillStyle = player.sneaking ? 'rgba(64, 224, 208, 0.10)' : 'rgba(64, 224, 208, 0.2)';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, 0, PLAYER_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = '#1f8a80';
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#0c3f3a';
  ctx.stroke();
  // Hood point in the facing direction.
  ctx.rotate(player.facing);
  ctx.fillStyle = '#7df0dd';
  ctx.beginPath();
  ctx.moveTo(PLAYER_RADIUS + 6, 0);
  ctx.lineTo(PLAYER_RADIUS - 3, -4);
  ctx.lineTo(PLAYER_RADIUS - 3, 4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
