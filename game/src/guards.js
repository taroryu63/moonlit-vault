// guards.js — the wardens of the vault. Each guard walks a waypoint patrol,
// pauses to look around, and watches a vision cone that walls can block.
// A guard that sees the infiltrator turns alert: the shared detection meter
// (owned by main.js) rises, and the guard turns toward the intruder.

import { angleDifference, distanceBetween, segmentBlocked } from './geometry.js';

export const GUARD_RADIUS = 14;
export const VISION_RANGE = 185;
export const VISION_HALF_ANGLE = 0.62; // about 71 degrees of total cone

export class Guard {
  constructor(def) {
    this.path = def.path;
    this.speed = def.speed;
    this.pauseTime = def.pause;
    this.x = def.path[0].x;
    this.y = def.path[0].y;
    this.targetIndex = def.path.length > 1 ? 1 : 0;
    const next = def.path[this.targetIndex];
    this.facing = Math.atan2(next.y - this.y, next.x - this.x);
    this.waiting = 0;
    this.seesPlayer = false;
    this.alertLevel = 0; // 0 calm, rises while the player is in view
  }

  update(dt, walls, player) {
    if (this.waiting > 0) {
      this.waiting -= dt;
      // While paused, a suspicious guard slowly turns toward the player.
      if (this.seesPlayer) this.turnToward(player.x, player.y, dt * 2.2);
    } else {
      const target = this.path[this.targetIndex];
      const dx = target.x - this.x;
      const dy = target.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 4) {
        this.targetIndex = (this.targetIndex + 1) % this.path.length;
        this.waiting = this.pauseTime;
      } else {
        this.turnToward(target.x, target.y, dt * 3.2);
        const step = Math.min(dist, this.speed * dt);
        this.x += Math.cos(this.facing) * step;
        this.y += Math.sin(this.facing) * step;
      }
    }
    this.seesPlayer = this.canSee(player, walls);
    this.alertLevel = this.seesPlayer
      ? Math.min(1, this.alertLevel + dt * 1.6)
      : Math.max(0, this.alertLevel - dt * 0.7);
  }

  turnToward(tx, ty, maxTurn) {
    const wanted = Math.atan2(ty - this.y, tx - this.x);
    const diff = angleDifference(this.facing, wanted);
    const turn = Math.max(-maxTurn, Math.min(maxTurn, diff));
    this.facing += turn;
  }

  // In range, inside the cone, and no wall between the eyes and the player.
  canSee(player, walls) {
    const dist = distanceBetween(this.x, this.y, player.x, player.y);
    if (dist > VISION_RANGE) return false;
    const toPlayer = Math.atan2(player.y - this.y, player.x - this.x);
    if (Math.abs(angleDifference(this.facing, toPlayer)) > VISION_HALF_ANGLE) return false;
    return !segmentBlocked(this.x, this.y, player.x, player.y, walls);
  }
}
