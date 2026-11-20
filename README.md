# CRM-UI-ANGULAR

Interfaz gráfica del CRM NOVA, migrada a Angular. Monorepo Nx con Angular 22, Tailwind v4 y spartan/ui.
La fuente de verdad de decisiones técnicas es la guía de migración (`guia-migracion-angular-crm-nova - copia.md`).

## Requisitos

- Node 24 y npm 11
- SERVER_CRM_NOVA corriendo en `http://localhost:3000` para usar el login en desarrollo

## Comandos

| Comando | Qué hace |
|---|---|
| `npm start` | Dev-server en `http://localhost:4200` (proxy `/api` → `localhost:3000`) |
| `npm run build` | Build de producción de `apps/crm` |
| `npm test` | Tests unitarios (Vitest) de todos los proyectos |
| `npm run lint` | ESLint, incluidos los límites entre módulos |
| `npm run e2e` | Playwright (escritorio y móvil 360 px) |
| `npm run check` | Lo mismo que el CI: checks de templates y tamaño + lint + test + build |

## Estructura

```
apps/crm            shell: app.config.ts, app.routes.ts
apps/crm-e2e        Playwright
libs/core/auth      AuthStore, Authorization, guards, permisos y roles (migrados de React)
libs/core/http      API_BASE_URL e interceptores (token, errores → toast, logging seguro)
libs/core/theme     ThemeService (apariencia, acento, escala, densidad, radio)
libs/core/layout    ShellLayout, NAV única + filterNav, páginas de estado
libs/ui/*           helm de spartan (@nova/ui/*) — PRIVADO del kit
libs/app            kit NOVA (@nova/app) + tokens CSS (src/theme)
libs/shared/*       util y models compartidos
libs/features/*     un módulo por carpeta: data-access/, pages/, ui/
tools/scripts       checks de CI (templates de features, tamaño de componentes)
```

## Reglas que hace cumplir el tooling (guía §13)

- **Límites por tags** (`eslint.config.mjs`): las features no importan otras features, `@nova/ui` ni `@spartan-ng/*`; `libs/ui` solo lo usa el kit.
- `pages/` y `ui/` de las features no importan `@angular/common/http`.
- `check:templates`: sin `<button>`/`<input>`/`<table>` nativos, sin colores de la paleta Tailwind, hex ni valores arbitrarios, y sin `ngClass`/`*ngIf`/`@Input` en `libs/features`.
- La paleta libre de Tailwind está desactivada: `bg-red-500` no genera CSS.
- `check:size`: aviso desde 250 líneas por componente (ts + html), error desde 400.

## Kit `@nova/app`

El catálogo vivo está en `/_design` (pestañas por categoría, `?tab=tabla`). Resumen:

| Categoría | Componentes |
|---|---|
| Layout | `app-stack`, `app-inline`, `app-grid`, `app-split`, `app-container`, `app-separator`, `app-button-group` |
| Página | `app-page` (breadcrumbs, acciones → menú "⋯" en móvil, filtros → drawer), `app-crud-page`, `app-section`, `app-detail-layout` |
| Acciones | `app-button`, `app-icon-button`, `app-dropdown-menu`, `appTooltip` |
| Superficies | `app-card`, `app-tabs`, `app-accordion` |
| Overlays | `app-dialog` (hoja inferior en móvil), `AppConfirm.ask()`, `app-drawer`, `app-popover` |
| Feedback | `app-alert`, `app-badge`, `app-status-dot`, `app-loader`, `app-skeleton`, `app-progress`, `app-empty-state`, `app-data-state`, `AppToast` |
| Formulario | `app-field`, `app-input`, `app-textarea`, `app-select`, `app-combobox`, `app-combobox-multi`, `app-checkbox`, `app-switch`, `app-radio-group`, `app-date-picker`, `app-date-range`, `app-month-picker`, `app-search-input`, `app-money-input`, `app-phone-input`, `app-file-upload`, `app-form-actions` |
| Tabla | `app-data-table` + helpers `appColumns`, `moneyColumn`, `dateColumn`, `statusColumn`, `actionsColumn`, celdas `appCell` |
| Dominio visual | `app-stat-card`, `app-chart` (ECharts, diferido), `app-avatar`, `app-timeline`, `app-key-value`, `app-code` |

Todos los controles implementan `FormValueControl` / `FormCheckboxControl` y se enlazan con `[formField]`.
Moneda (GTQ) y fechas (dd/MM/yyyy) salen siempre de `formatMoney` / `formatDate`.

```ts
// clientes.columns.ts
const col = appColumns<Cliente>();
export const clienteColumns = [
  col.accessor('nombre', { header: 'Cliente', meta: { priority: 1 } }),
  statusColumn<Cliente>('estado', 'Estado', (c) => c.estado, ESTADO_CLIENTE),
  moneyColumn<Cliente>('saldo', 'Saldo', (c) => c.saldo),
];
```

## Agregar una feature

```bash
npx nx g @nx/angular:library libs/features/<modulo> --name=feature-<modulo> \
  --importPath=@nova/features/<modulo> --tags=type:feature,scope:<modulo> \
  --unitTestRunner=vitest-analog --prefix=nv --skipModule
```

Agregar un primitivo de spartan al kit: `npx nx g @spartan-ng/cli:ui --name=<primitivo> --directory=libs/ui --tags=type:ui`
y envolverlo en `libs/app` antes de usarlo.
