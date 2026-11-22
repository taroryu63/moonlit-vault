// player.js — the infiltrator: keyboard movement with wall collision,
// a sneak mode that trades speed for quiet, and a facing direction.

import { circleHitsAnyRect, clamp } from './geometry.js';
import { STAGE_W, STAGE_H } from './levels.js';

export const PLAYER_RADIUS = 13;
const WALK_SPEED = 165;
const SNEAK_SPEED = 82;

export class Player {
  constructor(start) {
    this.x = start.x;
    this.y = start.y;
    this.facing = 0; // radians, 0 = east
    this.moving = false;
    this.sneaking = false;
    this.stepTimer = 0;
  }

  // keys: a Set of codes like 'KeyW' / 'ArrowUp'. Returns true on a step beat
  // so the caller can play a footstep sound.
  update(dt, keys, walls) {
    let dx = 0;
    let dy = 0;
    if (keys.has('KeyA') || keys.has('ArrowLeft')) dx -= 1;
    if (keys.has('KeyD') || keys.has('ArrowRight')) dx += 1;
    if (keys.has('KeyW') || keys.has('ArrowUp')) dy -= 1;
    if (keys.has('KeyS') || keys.has('ArrowDown')) dy += 1;
    this.sneaking = keys.has('ShiftLeft') || keys.has('ShiftRight');
    this.moving = dx !== 0 || dy !== 0;
    if (!this.moving) return false;

    const len = Math.sqrt(dx * dx + dy * dy);
    const speed = this.sneaking ? SNEAK_SPEED : WALK_SPEED;
    const vx = (dx / len) * speed * dt;
    const vy = (dy / len) * speed * dt;
    this.facing = Math.atan2(dy, dx);

    // Move one axis at a time so the player slides along cover.
    const nextX = clamp(this.x + vx, PLAYER_RADIUS, STAGE_W - PLAYER_RADIUS);
    if (!circleHitsAnyRect(nextX, this.y, PLAYER_RADIUS, walls)) this.x = nextX;
    const nextY = clamp(this.y + vy, PLAYER_RADIUS, STAGE_H - PLAYER_RADIUS);
    if (!circleHitsAnyRect(this.x, nextY, PLAYER_RADIUS, walls)) this.y = nextY;

    this.stepTimer -= dt;
    if (this.stepTimer <= 0) {
      this.stepTimer = this.sneaking ? 0.42 : 0.27;
      return true;
    }
    return false;
  }

  inShadow(shadows) {
    for (const s of shadows) {
      if (this.x >= s.x && this.x <= s.x + s.w && this.y >= s.y && this.y <= s.y + s.h) return true;
    }
    return false;
  }
}
