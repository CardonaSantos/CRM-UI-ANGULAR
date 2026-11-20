#!/usr/bin/env node
/**
 * Guía §4.3 y §13.4 — tamaño de componentes (ts + html).
 * Aviso desde 250 líneas, error desde 400. No revisa libs/ui (helm generado
 * por spartan) ni specs.
 *
 * Uso: node tools/scripts/check-file-size.mjs
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const WARN = 250;
const ERROR = 400;
const ROOTS = ['apps', 'libs'];
const SKIP = [/[\\/]node_modules[\\/]/, /^libs[\\/]ui[\\/]/, /[\\/]dist[\\/]/, /-e2e[\\/]/];

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (SKIP.some((re) => re.test(path))) continue;
    if (statSync(path).isDirectory()) yield* walk(path);
    else yield path;
  }
}

const countLines = (text) => text.split('\n').length;

const warnings = [];
const errors = [];

for (const root of ROOTS.filter(existsSync)) {
  for (const file of walk(root)) {
    if (!file.endsWith('.ts') || file.endsWith('.spec.ts')) continue;
    const source = readFileSync(file, 'utf8');
    if (!source.includes('@Component(')) continue;

    let lines = countLines(source);
    const templateUrl = source.match(/templateUrl:\s*'([^']+)'/)?.[1];
    if (templateUrl) {
      const html = join(file, '..', templateUrl);
      if (existsSync(html)) lines += countLines(readFileSync(html, 'utf8'));
    }

    const entry = `${relative(process.cwd(), file)}  (${lines} líneas, ts + html)`;
    if (lines > ERROR) errors.push(entry);
    else if (lines > WARN) warnings.push(entry);
  }
}

for (const w of warnings) console.warn(`⚠ más de ${WARN} líneas: ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`✖ más de ${ERROR} líneas: ${e}`);
  console.error('\nDivide el componente (guía §4.3).');
  process.exit(1);
}
console.log(`✔ check-file-size: ningún componente pasa de ${ERROR} líneas`);
