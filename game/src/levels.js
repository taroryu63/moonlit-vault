// levels.js — the three infiltration maps of Moonlit Vault.
// Coordinates are world pixels on a 960x640 stage. `walls` are solid cover:
// they block movement and sight. `shadows` are dark pools that slow detection.
// Guards patrol between `path` waypoints, pausing `pause` seconds at each.

export const STAGE_W = 960;
export const STAGE_H = 640;

export const LEVELS = [
  {
    name: 'Level 1 — Courtyard of Lanterns',
    hint: 'Cross the courtyard. Stay out of the lantern light cones.',
    playerStart: { x: 60, y: 560 },
    exit: { x: 872, y: 40, w: 56, h: 56 },
    walls: [
      { x: 180, y: 120, w: 150, h: 34 },
      { x: 180, y: 120, w: 34, h: 170 },
      { x: 430, y: 250, w: 120, h: 34 },
      { x: 620, y: 110, w: 34, h: 190 },
      { x: 620, y: 420, w: 190, h: 34 },
      { x: 300, y: 470, w: 150, h: 34 },
      { x: 760, y: 250, w: 120, h: 34 },
    ],
    shadows: [
      { x: 60, y: 300, w: 130, h: 110 },
      { x: 470, y: 60, w: 120, h: 90 },
      { x: 700, y: 500, w: 150, h: 100 },
    ],
    shards: [
      { x: 250, y: 200 },
      { x: 660, y: 360 },
    ],
    guards: [
      { path: [{ x: 250, y: 380 }, { x: 560, y: 380 }], speed: 62, pause: 1.2 },
      { path: [{ x: 830, y: 520 }, { x: 830, y: 180 }, { x: 520, y: 180 }], speed: 70, pause: 1.0 },
    ],
  },
  {
    name: 'Level 2 — Warehouse of Echoes',
    hint: 'Crates make good cover. Running feet echo — sneak with Shift.',
    playerStart: { x: 56, y: 70 },
    exit: { x: 872, y: 520, w: 56, h: 56 },
    walls: [
      { x: 150, y: 150, w: 90, h: 90 },
      { x: 150, y: 330, w: 90, h: 90 },
      { x: 330, y: 60, w: 34, h: 220 },
      { x: 330, y: 380, w: 34, h: 200 },
      { x: 470, y: 200, w: 110, h: 90 },
      { x: 470, y: 420, w: 110, h: 34 },
      { x: 660, y: 120, w: 90, h: 90 },
      { x: 660, y: 330, w: 90, h: 90 },
      { x: 820, y: 250, w: 34, h: 160 },
    ],
    shadows: [
      { x: 250, y: 480, w: 140, h: 100 },
      { x: 590, y: 40, w: 130, h: 80 },
      { x: 60, y: 470, w: 110, h: 110 },
    ],
    shards: [
      { x: 285, y: 285 },
      { x: 525, y: 130 },
      { x: 705, y: 480 },
    ],
    guards: [
      { path: [{ x: 120, y: 285 }, { x: 420, y: 285 }], speed: 74, pause: 0.8 },
      { path: [{ x: 620, y: 560 }, { x: 620, y: 90 }, { x: 880, y: 90 }], speed: 78, pause: 1.0 },
      { path: [{ x: 880, y: 460 }, { x: 430, y: 460 }, { x: 430, y: 540 }], speed: 70, pause: 1.4 },
    ],
  },
  {
    name: 'Level 3 — The Vault Roof',
    hint: 'Four wardens guard the vault door. Patience opens every lock.',
    playerStart: { x: 60, y: 320 },
    exit: { x: 880, y: 292, w: 56, h: 56 },
    walls: [
      { x: 170, y: 90, w: 130, h: 34 },
      { x: 170, y: 516, w: 130, h: 34 },
      { x: 380, y: 200, w: 34, h: 240 },
      { x: 380, y: 90, w: 200, h: 34 },
      { x: 380, y: 516, w: 200, h: 34 },
      { x: 560, y: 200, w: 34, h: 240 },
      { x: 680, y: 90, w: 34, h: 190 },
      { x: 680, y: 360, w: 34, h: 190 },
      { x: 770, y: 292, w: 60, h: 56 },
    ],
    shadows: [
      { x: 230, y: 260, w: 120, h: 120 },
      { x: 440, y: 380, w: 90, h: 110 },
      { x: 730, y: 480, w: 140, h: 90 },
      { x: 60, y: 60, w: 90, h: 90 },
    ],
    shards: [
      { x: 480, y: 320 },
      { x: 240, y: 180 },
      { x: 800, y: 120 },
    ],
    guards: [
      { path: [{ x: 240, y: 430 }, { x: 240, y: 210 }], speed: 80, pause: 0.7 },
      { path: [{ x: 480, y: 150 }, { x: 480, y: 490 }], speed: 84, pause: 0.6 },
      { path: [{ x: 640, y: 320 }, { x: 860, y: 320 }, { x: 860, y: 120 }], speed: 76, pause: 1.0 },
      { path: [{ x: 850, y: 540 }, { x: 620, y: 540 }, { x: 620, y: 420 }], speed: 82, pause: 0.9 },
    ],
  },
];
