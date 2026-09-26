// Bygger dist/ki-claude.js fra src/screens/*.dc.html (Claude Design-filer) + runtime.
//   node tools/build.mjs          → én build
//   node tools/build.mjs --watch  → bygg på nytt ved endringer
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SCREEN_DIR = join(ROOT, 'src/screens');
const GEN_DIR = join(ROOT, 'src/generated');
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));

// Designs imported by an older name inside the project → the version we ship.
const REDIRECTS = { 'Vanning v3': 'Vanning v4' };

export function parseDc(src, file) {
  const open = /<x-dc(?:\s[^>]*)?>/.exec(src);
  const close = src.lastIndexOf('</x-dc>');
  if (!open || close < 0) throw new Error(file + ': mangler <x-dc>');
  const html = src.slice(open.index + open[0].length, close);
  const m = /<script\b[^>]*\bdata-dc-script\b[^>]*>([\s\S]*?)<\/script>/.exec(src.slice(close));
  return { html, js: m ? m[1] : '' };
}

const alias = name => name.toLowerCase().replace(/\s+v\d+$/, '').normalize('NFC');

function generate() {
  mkdirSync(GEN_DIR, { recursive: true });
  const files = readdirSync(SCREEN_DIR).filter(f => f.endsWith('.dc.html')).sort();
  const out = ['// GENERERT av tools/build.mjs – ikke rediger. Kilde: src/screens/*.dc.html', 'export const SCREENS = {};'];
  const aliases = {};
  for (const f of files) {
    const name = f.replace(/\.dc\.html$/, '').normalize('NFC');
    const { html, js } = parseDc(readFileSync(join(SCREEN_DIR, f), 'utf8'), f);
    out.push(`SCREENS[${JSON.stringify(name)}] = { html: ${JSON.stringify(html)}, factory: (DCLogic, React, ha) => {\n${js}\n;return typeof Component !== 'undefined' ? Component : undefined;\n} };`);
    aliases[alias(name)] = name;
  }
  for (const [from, to] of Object.entries(REDIRECTS)) out.push(`SCREENS[${JSON.stringify(from)}] = SCREENS[${JSON.stringify(to)}];`);
  out.push(`export const ALIASES = ${JSON.stringify(aliases, null, 1)};`);
  writeFileSync(join(GEN_DIR, 'screens.js'), out.join('\n') + '\n');
  writeFileSync(join(GEN_DIR, 'version.js'), `export const VERSION = ${JSON.stringify(pkg.version)};\n`);
  return files.length;
}

const opts = {
  entryPoints: [join(ROOT, 'src/card.js')],
  bundle: true,
  format: 'iife',
  target: ['es2022', 'safari15'],
  minify: true,
  legalComments: 'none',
  loader: { '.webp': 'dataurl' },
  define: { 'process.env.NODE_ENV': '"production"' },
  outfile: join(ROOT, 'dist/ki-claude.js'),
  logLevel: 'info',
};

const n = generate();
console.log(`ki-claude ${pkg.version}: ${n} skjermer`);
if (process.argv.includes('--watch')) {
  const ctx = await esbuild.context(opts);
  await ctx.watch();
} else {
  await esbuild.build(opts);
}
