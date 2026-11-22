// Moonlit Vault — hand-in program (Node 22, standard library only).
//
// The game itself is the static site in game/ (open game/index.html in a
// desktop browser, no build step, no network). This program packages it for
// the judges: it copies game/ and screenshots/ into the output directory and
// writes dossier.json there with buildDossier from the vendored library, so
// the dossier is exactly the bytes the kit's own builder produces.
//
// Locally:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// In the grader MAKEFUN_OUTPUT_DIR is unset and the output goes to /output.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoDir = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Copy the playable game first, then the screenshots beside it.
mkdirSync(outDir, { recursive: true });
cpSync(join(repoDir, 'game'), join(outDir, 'game'), { recursive: true });
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoDir, 'screenshots'))) {
  cpSync(join(repoDir, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });
}

// The dossier carries the gate's caps so an oversized entry fails here, at
// packaging time, instead of at the scorer: at most 4 screenshots of at most
// 256 KiB each, at most 993 entries and 48 MiB under game/, paths under
// 1000 bytes, and the dossier text capped at 160 KiB.
const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);

// A one-line receipt for whoever runs this by hand; the grader ignores it.
console.log(`Moonlit Vault packaged into ${outDir} (dossier ${dossier.length} bytes)`);
