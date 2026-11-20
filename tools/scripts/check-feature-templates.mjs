#!/usr/bin/env node
/**
 * Guía §13.3 — check de templates en features.
 * Falla si en libs/features/** encuentra:
 *  - HTML interactivo nativo: <button <input <select <textarea <table
 *  - clases de la paleta Tailwind (bg-red-500, text-slate-700, …)
 *  - colores hex y valores arbitrarios (w-[340px], text-[11px], …)
 *  - APIs legacy: ngClass, ngStyle, *ngIf, *ngFor, @Input/@Output, @HostBinding/@HostListener
 *
 * Uso: node tools/scripts/check-feature-templates.mjs [dir]
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.argv[2] ?? 'libs/features';

const PALETTE =
  'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose';

/** Reglas para templates (.html y templates inline en .ts). */
const TEMPLATE_RULES = [
  { re: /<(button|input|select|textarea|table)\b/g, msg: 'HTML interactivo nativo: usa el componente de @nova/app' },
  {
    re: new RegExp(`\\b(bg|text|border|ring|outline|fill|stroke|from|via|to|divide|shadow|accent|caret|decoration)-(${PALETTE})-\\d{2,3}\\b`, 'g'),
    msg: 'Color de la paleta Tailwind: usa tokens/variantes del kit',
  },
  { re: /#[0-9a-fA-F]{3,8}\b/g, msg: 'Color hex: usa tokens --app-*' },
  { re: /-\[[^\]]*\d(px|rem|em|%|vh|vw)?\]/g, msg: 'Valor arbitrario de Tailwind: usa variantes del kit' },
  { re: /\b(ngClass|ngStyle)\b|\*ng(If|For|Switch)\b/g, msg: 'API legacy: usa [class]/[style] y @if/@for/@switch' },
];

/** Reglas solo para TypeScript. */
const TS_RULES = [
  { re: /@(Input|Output)\(/g, msg: 'Decorador legacy: usa input()/output()/model()' },
  { re: /@Host(Binding|Listener)\(/g, msg: 'Decorador legacy: usa la propiedad host del decorador' },
];

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) yield* walk(path);
    else yield path;
  }
}

/** Extrae el contenido de `template: \`...\`` de un componente. */
function inlineTemplates(source) {
  return [...source.matchAll(/template:\s*`([\s\S]*?)`/g)].map((m) => ({ text: m[1], offset: m.index }));
}

function lineOf(source, index) {
  return source.slice(0, index).split('\n').length;
}

const problems = [];

function check(file, source, text, offset, rules) {
  for (const { re, msg } of rules) {
    for (const m of text.matchAll(re)) {
      problems.push(`${relative(process.cwd(), file)}:${lineOf(source, offset + m.index)}  ${msg}  →  ${m[0]}`);
    }
  }
}

let exists = true;
try {
  statSync(root);
} catch {
  exists = false;
}

if (exists) {
  for (const file of walk(root)) {
    if (file.endsWith('.spec.ts')) continue;
    if (file.endsWith('.html')) {
      const source = readFileSync(file, 'utf8');
      check(file, source, source, 0, TEMPLATE_RULES);
    } else if (file.endsWith('.ts')) {
      const source = readFileSync(file, 'utf8');
      check(file, source, source, 0, TS_RULES);
      for (const t of inlineTemplates(source)) check(file, source, t.text, t.offset, TEMPLATE_RULES);
    }
  }
}

if (problems.length) {
  console.error(`✖ check-feature-templates: ${problems.length} problema(s)\n`);
  for (const p of problems) console.error('  ' + p);
  process.exit(1);
}
console.log(`✔ check-feature-templates: sin problemas en ${root}`);
