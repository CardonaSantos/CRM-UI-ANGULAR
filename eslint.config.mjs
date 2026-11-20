import nx from '@nx/eslint-plugin';

/**
 * Límites entre módulos (guía §3.1 y §13.1). Tags:
 *   type:app      apps/crm (shell de la aplicación)
 *   type:feature  libs/features/*  — nunca importan otra feature
 *   type:app-ui   libs/app (kit NOVA) — puede usar core/theme (scope:theme)
 *   type:ui       libs/ui/* (helm de spartan, privado del kit)
 *   type:core     libs/core/*
 *   type:util     libs/shared/*
 *   type:e2e      apps/crm-e2e
 */
const depConstraints = [
  { sourceTag: 'type:app', onlyDependOnLibsWithTags: ['type:feature', 'type:core', 'type:app-ui', 'type:util'] },
  {
    sourceTag: 'type:feature',
    onlyDependOnLibsWithTags: ['type:core', 'type:app-ui', 'type:util'],
    bannedExternalImports: ['@spartan-ng/*'],
  },
  { sourceTag: 'type:app-ui', onlyDependOnLibsWithTags: ['type:ui', 'type:app-ui', 'type:util', 'scope:theme'] },
  { sourceTag: 'type:ui', onlyDependOnLibsWithTags: ['type:ui'] },
  {
    sourceTag: 'type:core',
    onlyDependOnLibsWithTags: ['type:core', 'type:app-ui', 'type:util'],
    bannedExternalImports: ['@spartan-ng/*'],
  },
  { sourceTag: 'type:util', onlyDependOnLibsWithTags: ['type:util'] },
  { sourceTag: 'type:e2e', onlyDependOnLibsWithTags: [] },
];

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist', '**/out-tsc', '**/vitest.config.*.timestamp*', '**/vite.config.*.timestamp*'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints,
        },
      ],
    },
  },
  {
    // Páginas y componentes presentacionales de features: los datos van por data-access (guía §8.4).
    files: ['**/src/lib/pages/**/*.ts', '**/src/lib/ui/**/*.ts'],
    ignores: ['**/*.spec.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@angular/common/http',
              message: 'Las páginas y componentes no usan HttpClient: usa data-access del módulo.',
            },
          ],
          patterns: [
            { group: ['@spartan-ng/*'], message: 'Usa los componentes de @nova/app.' },
            { group: ['@nova/ui', '@nova/ui/*'], message: 'libs/ui es privado del kit: usa @nova/app.' },
          ],
        },
      ],
    },
  },
];
