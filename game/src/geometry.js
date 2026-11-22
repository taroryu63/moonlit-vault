// geometry.js — small spatial helpers shared by guards, the player and the renderer.
// Everything works in plain world pixels on a 960x640 stage.

export function clamp(value, low, high) {
  return value < low ? low : value > high ? high : value;
}

export function distanceBetween(ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  return Math.sqrt(dx * dx + dy * dy);
}

// Smallest signed difference between two headings, in radians, in (-PI, PI].
export function angleDifference(from, to) {
  let d = (to - from) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}

export function pointInsideRect(px, py, rect) {
  return px >= rect.x && px <= rect.x + rect.w && py >= rect.y && py <= rect.y + rect.h;
}

// Does a circle overlap any solid rectangle? Used for movement collision.
export function circleHitsRect(cx, cy, radius, rect) {
  const nearestX = clamp(cx, rect.x, rect.x + rect.w);
  const nearestY = clamp(cy, rect.y, rect.y + rect.h);
  const dx = cx - nearestX;
  const dy = cy - nearestY;
  return dx * dx + dy * dy < radius * radius;
}

export function circleHitsAnyRect(cx, cy, radius, rects) {
  for (const rect of rects) {
    if (circleHitsRect(cx, cy, radius, rect)) return true;
  }
  return false;
}

// Line of sight: walk the segment in small steps and report whether a solid
// rectangle blocks the view. Step sampling keeps the code tiny and is exact
// enough at these scales because walls are chunky.
export function segmentBlocked(x1, y1, x2, y2, rects) {
  const dist = distanceBetween(x1, y1, x2, y2);
  const steps = Math.max(1, Math.ceil(dist / 6));
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const px = x1 + (x2 - x1) * t;
    const py = y1 + (y2 - y1) * t;
    for (const rect of rects) {
      if (pointInsideRect(px, py, rect)) return true;
    }
  }
  return false;
}

// How far a ray travels before it meets a wall or reaches maxRange.
// The renderer uses this to clip vision cones so they hug the cover.
export function rayLength(x, y, angle, maxRange, rects) {
  const step = 6;
  let travelled = 0;
  let px = x;
  let py = y;
  while (travelled < maxRange) {
    px += Math.cos(angle) * step;
    py += Math.sin(angle) * step;
    travelled += step;
    for (const rect of rects) {
      if (pointInsideRect(px, py, rect)) return travelled;
    }
    if (px < 0 || py < 0 || px > 960 || py > 640) return travelled;
  }
  return maxRange;
}
