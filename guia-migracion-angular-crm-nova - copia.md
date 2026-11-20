# Guía de refactorización y migración — CRM NOVA UI → Angular

> Documento de referencia vivo. Úsalo como la fuente de verdad para cualquier vista, componente o decisión técnica del nuevo repositorio Angular.
> Origen analizado: `CardonaSantos/POS-UI` (main, PR #26, 24-sep-2026). Fecha del análisis: 18-nov-2026.

---

## 0. Reglas de oro (léelas antes de cualquier cosa)

1. **Ninguna página construye UI desde cero.** Las vistas solo componen componentes del kit `@nova/app`. Si falta algo, se agrega primero al kit y luego se usa.
2. **Cero valores visuales en las features.** Prohibido usar colores (`bg-red-500`, hex), tamaños arbitrarios (`text-[11px]`, `w-[340px]`) y radios o sombras sueltos. Todo sale de los tokens `--app-*` y de las variantes del kit.
3. **Cada módulo es dueño de sus datos.** No hay carpeta global de hooks ni de servicios de negocio. `features/<modulo>/data-access` contiene su API, queries y modelos.
4. **Angular idiomático, no "React traducido".** Componentes standalone, signals, `inject()`, `input()/output()/model()`, control flow `@if/@for`, OnPush y zoneless.
5. **Mobile-first siempre.** Toda vista debe funcionar desde 360 px de ancho. Los técnicos y cobradores trabajan desde el celular.
6. **Permisos declarativos.** Se usan rutas con `data.permission` y una sola configuración de navegación. Nunca se escriben listas de menú por rol.
7. **Si no lo valida el CI, no existe.** Las reglas de este documento se hacen cumplir con lint, límites entre módulos y checks del pipeline.

---

## 1. Diagnóstico de la UI actual (React) — qué NO repetir

### 1.1 Lo que sí está bien y se conserva como concepto
- Hay un **sistema de diseño propio** (`components/app`) con 33 primitivas, wrappers de formulario, `AppDataTable` y variantes CVA por componente.
- Los tokens CSS están en `app-theme.css` (1,525 líneas, `--app-*`): tipografía, radios, paleta de marca y semánticos, y aliases de shadcn.
- El theming en runtime incluye color de acento (hex → HSL), modo claro/oscuro/sistema y persistencia en localStorage.
- Los permisos son granulares (`clientes.crear`, `pppoe.suspender`, …) y están mapeados por rol, con `can/canAny/canAll`.
- TanStack Query maneja el estado del servidor y TanStack Table las tablas.

### 1.2 Problemas medidos (523 archivos `.tsx` en `src/Crm`)

| Problema | Medición |
|---|---|
| Importan shadcn directo, saltándose el kit | 109 archivos (button 75, input 37, card 32, select 24, dialog 22) |
| HTML nativo en vez de componentes | `<button>` 37 · `<input>` 16 · `<table>` 10 |
| `react-select` usado directo | 18 |
| Colores Tailwind fijos | 69 archivos |
| Hex en línea | 11 |
| Anchos fijos en px | 69 archivos |
| Tablas TanStack que no usan `AppDataTable` | 18 de 40 |
| Archivos de más de 500 líneas | 37 (el mayor tiene 1,272) |
| Archivos con algún breakpoint responsive | solo 224 de 523 |
| Componentes que hacen fetch en `useEffect` | 9 |
| Carpetas de hooks globales | 47 (`CrmHooks/hooks/*`), sin pertenencia a un módulo |
| Rutas | un solo `Routes.tsx` de 773 líneas |
| Sidebar | 7 archivos, uno por rol, que duplican la matriz de permisos |
| Theme providers | 3 (`app/config`, `app/theme` y `components/theme-provider`) |
| Tamaños fijos dentro del propio kit | p. ej. `text-[11px]` en `AppButton`, que impide escalar la UI |
| Densidad | solo existe en la tabla; no hay escala ni densidad global |

**Conclusión:** alrededor del 40 % de la UI no responde a cambios de tema, tamaño o densidad, y la responsividad es inconsistente. El nuevo repo debe hacer imposible (vía tooling) volver a este estado.

---

## 2. Stack y versiones

| Área | Elección | Notas |
|---|---|---|
| Framework | **Angular 22** | Signal Forms, `resource/httpResource` y Angular Aria son estables. Zoneless y OnPush por defecto |
| Primitivas UI | **spartan/ui 1.0**: brain (npm) + helm (copiado al repo) | Equivalente a shadcn + Radix, construido sobre Angular CDK. Usa Tailwind + CVA |
| Estilos | Tailwind CSS + variables CSS `--app-*` + `class-variance-authority` | Los tokens y variantes actuales se migran casi literal |
| Estado del servidor | **TanStack Query para Angular** (`injectQuery`, `injectMutation`) | Basado en signals y compatible con zoneless. Verifica el nombre actual del paquete al instalar (históricamente `@tanstack/angular-query-experimental`) |
| Tablas | **TanStack Table para Angular** envuelto en `<app-data-table>` | |
| Formularios | **Signal Forms** (`@angular/forms/signals`): `form()`, `[formField]`, `FormValueControl` | Validación con Zod vía `validateStandardSchema` |
| Estado de cliente | Servicios con signals (o NgRx SignalStore si el estado crece) | Reemplaza a Zustand |
| HTTP | `HttpClient` + interceptores funcionales | Reemplaza a axios |
| Iconos | Lucide (vía ng-icons, el estándar de spartan) | |
| Toasts | ngx-sonner | |
| Mapas | `@angular/google-maps` (oficial) | |
| Gráficas | **Una sola librería**: ECharts (`ngx-echarts`) recomendado | Hoy hay dos (nivo y recharts). Decisión pendiente, ver §16 |
| Editor rich text | ngx-tiptap | |
| PDF | pdfmake / jspdf (no dependen del framework) | `@react-pdf/renderer` no tiene equivalente: generar con pdfmake o en el backend |
| Tiempo real | `socket.io-client` dentro de un servicio que expone signals | |
| Tests | Vitest (default del CLI moderno) + Testing Library para Angular | |
| Monorepo | **Nx** (recomendado) o Angular CLI con path aliases | Nx habilita `enforce-module-boundaries` (§13) |

---

## 3. Arquitectura del repositorio

```
apps/
  crm/                          → shell: app.config.ts, app.routes.ts, layout raíz
libs/
  core/                         → singleton, se carga una vez
    auth/                       → AuthStore, authGuard, permissionGuard, permisos, roles
    http/                       → interceptores (token, errores→toast, logging seguro), API_BASE_URL
    theme/                      → ThemeService, tokens, panel de preferencias
    realtime/                   → SocketService
    layout/                     → shell, sidebar, topbar, NAV_ITEMS
  ui/                           → helm de spartan (PRIVADO; solo lo importa libs/app)
  app/                          → KIT NOVA (API pública de UI)
    primitives/  form/  table/  overlay/  feedback/  layout/  page/
    theme/                      → app-theme.css + *.variants.ts
  shared/
    util/                       → formatters (moneda GTQ, fechas), pipes puros, helpers
    models/                     → tipos compartidos reales (no meter todo aquí)
  features/
    clientes/
      clientes.routes.ts
      data-access/              → clientes.api.ts, clientes.queries.ts, clientes.models.ts
      pages/                    → componentes enrutables (contenedores)
      ui/                       → componentes presentacionales propios del módulo
    tickets/  instalaciones/  facturacion/  rutas-cobro/  pppoe/  whatsapp/ …
```

### 3.1 Reglas de dependencia (enforced, §13)

| Desde \ Hacia | core | ui | app | shared | features/x |
|---|---|---|---|---|---|
| **features/y** | ✅ | ❌ | ✅ | ✅ | ❌ (nunca entre features) |
| **app** | ❌ (salvo `core/theme`) | ✅ | ✅ | ✅ util | ❌ |
| **ui** | ❌ | ✅ | ❌ | ❌ | ❌ |
| **core** | ✅ | ❌ | ✅ | ✅ | ❌ |

Si dos features necesitan lo mismo, se mueve a `shared/` (lógica) o a `app/` (UI). Nunca se importa entre features.

---

## 4. Convenciones Angular idiomáticas

### 4.1 Componentes
- Standalone siempre. OnPush (default). Sin `NgModule`.
- Las dependencias se obtienen con `inject()`, no con el constructor.
- Entradas y salidas con `input()`, `input.required()`, `output()` y `model()`. Nada de `@Input/@Output`.
- Estado local con `signal()` y derivados con `computed()`. `effect()` solo para sincronizar con el exterior (DOM, storage, sockets), nunca para derivar estado.
- Templates con `@if`, `@for (… ; track id)`, `@switch` y `@defer` para lo pesado (mapas, gráficas, editor).
- Clases y estilos con `[class.x]` / `[class]` / `[style.x]`. No usar `ngClass` ni `ngStyle`.
- Bindings del host en la propiedad `host: {}` del decorador. No usar `@HostBinding` ni `@HostListener`.
- Nombres de archivo según el style guide moderno: `cliente-list.ts`, `cliente-list.html`, `clientes.api.ts`, `permission.guard.ts`. Selector `app-*` para el kit y `nv-<modulo>-*` para componentes de feature (o el prefijo que se acuerde, pero uno solo).
- Templates en archivo `.html` aparte si pasan de ~15 líneas.

### 4.2 Contenedor vs. presentacional
- **Página (contenedor)** en `pages/`: inyecta queries y servicios, maneja la navegación y coordina. Casi no tiene markup propio: usa `<app-page>` y componentes del kit o de `ui/` del módulo.
- **Presentacional** en `ui/` del módulo o en `libs/app`: solo `input()` y `output()`, sin inyectar servicios de datos y fácil de testear.

### 4.3 Límites de tamaño (revisión en PR)
- Un componente (ts + html) no debe pasar de **~250 líneas**. Si pasa, se divide.
- Una función no debe pasar de ~40 líneas.
- Las columnas de tabla van en un archivo `*.columns.ts` aparte.

### 4.4 Idioma
- **Dominio en español** (`Cliente`, `Ticket`, `RutaCobro`) para alinearse con el backend.
- **Términos técnicos en inglés** (`api`, `queries`, `page`, `list`, `detail`, `form`).
- Mezclar está bien, pero siempre con el mismo patrón: `cliente-list.page.ts`, `clientes.api.ts`.

---

## 5. Capas de UI y catálogo del kit `@nova/app`

### 5.1 Capas
```
spartan brain (npm, headless, a11y)
   └─ libs/ui  → helm (Tailwind + CVA), copiado; solo lo ajusta quien mantiene el kit
        └─ libs/app → componentes NOVA con API estable, variantes y tokens
             └─ features → solo consumen libs/app
```
**Por qué hay una capa `app` encima de helm:** así una actualización de spartan, o un cambio de librería, toca solo `libs/app`. Las features nunca se enteran.

### 5.2 Catálogo obligatorio (equivalencias con el kit React actual)

| Categoría | Componentes Angular (`libs/app`) | Reemplaza en React |
|---|---|---|
| Layout | `app-stack`, `app-inline`, `app-grid`, `app-split`, `app-container`, `app-separator` | AppStack, AppInline, AppGrid, AppSplit, AppContainer |
| Página | **`app-page`** (header, breadcrumbs, acciones, filtros, contenido), **`app-crud-page`**, `app-section`, `app-detail-layout` (resumen + tabs) | — (nuevo: es lo que garantiza la consistencia) |
| Acciones | `app-button` (variantes y loading), `app-icon-button`, `app-dropdown-menu`, `app-button-group` | AppButton, AppDropdownMenu |
| Superficies | `app-card`, `app-tabs`, `app-accordion` | AppCard, AppTabs |
| Overlays | `app-dialog`, `app-confirm-dialog`, `app-drawer` / `app-sheet`, `app-popover`, `app-tooltip` | AppDialog, AppConfirmDialog, AppDrawer |
| Feedback | `app-alert`, `app-badge`, `app-status-dot`, `app-empty-state`, `app-loader`, `app-skeleton`, **`app-data-state`** (loading/error/empty/success) | AppAlert, AppBadge, AppEmptyState, AppDataState |
| Formulario | `app-field` (label, hint, error), `app-input`, `app-textarea`, `app-select`, `app-combobox` (búsqueda y multi), `app-checkbox`, `app-switch`, `app-radio-group`, `app-date-picker`, `app-date-range`, `app-month-picker`, `app-search-input`, `app-money-input`, `app-phone-input`, `app-file-upload` | AppForm*, react-select |
| Tabla | `app-data-table` + `app-table-toolbar`, `app-table-pagination`, `app-table-row-actions`, `app-table-column-visibility`, `app-table-density`, `app-table-export`, `app-table-bulk-actions` | AppDataTable y compañía |
| Dominio visual | `app-stat-card` / KPI, `app-timeline`, `app-avatar`, `app-key-value` (lista de datos) | componentes repetidos en varias pages |

Cada componente del kit:
- Expone solo `variant`, `size`, `radius`, `width` y lo que sea propio de su función. **No acepta `class` libre para cambiar colores ni tamaños.** Si hace falta, se agrega una variante.
- Usa únicamente tokens `--app-*`.
- Tiene una entrada en el catálogo `/_design` y su test.

### 5.3 Ejemplo: una página correcta
```html
<app-page title="Clientes" [breadcrumbs]="breadcrumbs">
  <ng-container appPageActions>
    @if (auth.can(P.CLIENTES_CREAR)) {
      <app-button variant="primary" leftIcon="lucidePlus" routerLink="nuevo">Nuevo cliente</app-button>
    }
  </ng-container>

  <app-cliente-filters appPageFilters [value]="filters()" (valueChange)="filters.set($event)" />

  <app-data-table
    [data]="clientes.data()?.items ?? []"
    [columns]="columns"
    [state]="clientes"
    paginationMode="server"
    [pagination]="pagination()"
    (paginationChange)="pagination.set($event)"
    responsiveMode="cards" />
</app-page>
```
No contiene ningún `div` con clases de diseño, ningún color y ningún HTML nativo interactivo.

---

## 6. Tokens y personalización

### 6.1 Tokens
- Se migra `app-theme.css` **tal cual** como punto de partida, unificando en un solo `:root` y un solo `.dark`.
- Se agregan los tokens que hoy faltan:

```css
:root {
  --app-scale: 1;                       /* 0.875 | 1 | 1.125 | 1.25 */
  --app-density: 1;                     /* compact .85 | comfortable 1 | spacious 1.2 */
  --app-radius-base: 0.5rem;

  --app-space-1: calc(0.25rem * var(--app-density));
  --app-space-2: calc(0.5rem  * var(--app-density));
  /* … */
  --app-control-h-sm: calc(2rem   * var(--app-density));
  --app-control-h-md: calc(2.25rem * var(--app-density));
  --app-text-sm: 0.75rem;               /* en rem: escalan con el root */
}
html { font-size: calc(16px * var(--app-scale)); }
html[data-density='compact']  { --app-density: .85; }
html[data-density='spacious'] { --app-density: 1.2; }
```
- **Regla:** todo en `rem` o en tokens. **Nunca** px arbitrarios dentro del kit (corrige el `text-[11px]` actual).
- Tailwind se configura para leer los tokens (colores `hsl(var(--app-*))`, radios, espaciados), así las utilidades permitidas ya son "de marca".

### 6.2 ThemeService (core/theme)
```ts
export type Appearance = 'light' | 'dark' | 'system';
export type Density = 'compact' | 'comfortable' | 'spacious';

export interface UiPreferences {
  appearance: Appearance;
  accent: string;        // hex
  density: Density;
  scale: 0.875 | 1 | 1.125 | 1.25;
  radius: 'none' | 'sm' | 'md' | 'lg';
}

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly doc = inject(DOCUMENT);
  private readonly storage = inject(PreferencesStorage); // localStorage + (opcional) backend

  readonly prefs = signal<UiPreferences>(this.storage.load() ?? DEFAULT_PREFS);

  constructor() {
    effect(() => {
      const p = this.prefs();
      const root = this.doc.documentElement;
      root.dataset['density'] = p.density;
      root.style.setProperty('--app-scale', String(p.scale));
      root.classList.toggle('dark', resolveDark(p.appearance));
      applyAccent(root, p.accent);           // migrar lógica hex→HSL de app-theme-runtime.ts
      this.storage.save(p);
    });
  }

  update(patch: Partial<UiPreferences>) { this.prefs.update(p => ({ ...p, ...patch })); }
  reset() { this.prefs.set(DEFAULT_PREFS); }
}
```
- Hay **un solo** servicio de tema (hoy existen tres providers).
- El panel "Apariencia" en el perfil ofrece acento (presets NOVA, Azul, Morado, …), claro/oscuro/sistema, tamaño S/M/L/XL, densidad y radio.
- Opcional: persistir las preferencias por usuario en el backend para que lo acompañen entre dispositivos.
- Para evitar el parpadeo del tema, un script pequeño en `index.html` aplica las preferencias guardadas antes del bootstrap.

---

## 7. Responsividad (antes inconsistente: solo 224 de 523 archivos tenían breakpoints)

### 7.1 Principios
- **Mobile-first:** el estilo base es el móvil y los breakpoints agregan columnas o espacio.
- Breakpoints únicos definidos en tokens/Tailwind: `sm 640`, `md 768`, `lg 1024`, `xl 1280`, `2xl 1536`.
- **Container queries** (`@container`) en componentes del kit que viven en espacios variables (cards, KPIs, formularios dentro de drawers).
- **Prohibido** usar anchos fijos en px en features (hoy hay 69 archivos). Se usa `app-grid` / `app-split` con props responsivas.
- Objetivos táctiles ≥ 44 px en móvil (`size="md"` mínimo en acciones primarias táctiles).

### 7.2 Responsabilidad del kit, no de cada página
| Componente | Comportamiento móvil (< md) |
|---|---|
| `app-page` | Las acciones pasan a un menú "⋯" y los filtros se mueven a un `app-drawer` |
| `app-data-table` | `responsiveMode="cards"` por defecto: cada fila se muestra como card con columnas priorizadas (`meta.priority`) |
| `app-dialog` | Se convierte en hoja inferior (sheet) a pantalla completa |
| `app-grid` | `[cols]="{ base: 1, md: 2, xl: 3 }"` |
| `app-split` | Se apila en vertical |
| Sidebar | Off-canvas con overlay; en `lg` es colapsable a iconos |
| `app-tabs` | Scroll horizontal o select |

### 7.3 Detección en TS (solo cuando CSS no alcanza)
```ts
@Injectable({ providedIn: 'root' })
export class Breakpoints {
  private readonly bo = inject(BreakpointObserver);
  readonly isMobile = toSignal(
    this.bo.observe('(max-width: 767.98px)').pipe(map(r => r.matches)),
    { initialValue: false },
  );
}
```

### 7.4 Matriz de prueba obligatoria por vista
360×640 (técnico/cobrador en campo) · 768×1024 · 1366×768 · 1920×1080, en claro y oscuro, con escala 0.875 y 1.25.

---

## 8. Datos: cada módulo es dueño de sus peticiones

En el repo React había 47 carpetas de hooks globales y 9 componentes con fetch en `useEffect`. En Angular **no hay "hooks"**: cada feature tiene una capa `data-access`.

### 8.1 Estructura por módulo
```
features/clientes/data-access/
  clientes.models.ts     → DTOs e interfaces del dominio (tipos del backend)
  clientes.api.ts        → HttpClient puro; devuelve Observables; sin estado
  clientes.queries.ts    → query keys + factories injectQuery/injectMutation; invalidaciones
```

### 8.2 API (sin estado)
```ts
@Injectable({ providedIn: 'root' })
export class ClientesApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${inject(API_BASE_URL)}/clientes`;

  list(params: ClientesQuery) { return this.http.get<Paginated<ClienteListItem>>(this.base, { params: toHttpParams(params) }); }
  get(id: number)            { return this.http.get<ClienteDetalle>(`${this.base}/${id}`); }
  create(dto: CrearClienteDto) { return this.http.post<ClienteDetalle>(this.base, dto); }
  update(id: number, dto: EditarClienteDto) { return this.http.patch<ClienteDetalle>(`${this.base}/${id}`, dto); }
}
```

### 8.3 Queries (estado del servidor, caché e invalidación)
```ts
export const clientesKeys = {
  all: ['clientes'] as const,
  list: (q: ClientesQuery) => [...clientesKeys.all, 'list', q] as const,
  detail: (id: number) => [...clientesKeys.all, 'detail', id] as const,
};

export function injectClientesList(query: () => ClientesQuery) {
  const api = inject(ClientesApi);
  return injectQuery(() => ({
    queryKey: clientesKeys.list(query()),
    queryFn: () => lastValueFrom(api.list(query())),
    placeholderData: keepPreviousData,
  }));
}

export function injectCrearCliente() {
  const api = inject(ClientesApi);
  const qc = inject(QueryClient);
  return injectMutation(() => ({
    mutationFn: (dto: CrearClienteDto) => lastValueFrom(api.create(dto)),
    onSuccess: () => qc.invalidateQueries({ queryKey: clientesKeys.all }),
  }));
}
```
Uso en la página: `readonly clientes = injectClientesList(() => ({ ...this.filters(), ...this.pagination() }));`

### 8.4 Reglas
- **Una sola estrategia de estado del servidor: TanStack Query.** `httpResource` solo para lecturas triviales sin invalidación (catálogos estáticos), o no usarlo, para no mezclar paradigmas.
- Los componentes **nunca** inyectan `HttpClient`.
- Las query keys siempre pasan por la factory `xxxKeys`; no se escriben arrays a mano.
- Los errores HTTP van a un interceptor global que muestra un toast con el mensaje de NestJS. Solo se maneja localmente lo que cambia la UI.
- Los estados de carga, error y vacío siempre se muestran con `app-data-state` o con la tabla, nunca con un `@if` hecho a mano.
- El interceptor de logging registra solo método, endpoint relativo, status y duración; nunca headers, body ni tokens (mismo criterio que el `axiosClientCrm.ts` actual de producción).
- Los modelos del dominio se alinean con los DTOs del backend (`SERVER_CRM_NOVA`). A futuro conviene generar los tipos desde OpenAPI.

---

## 9. Formularios (Signal Forms)

- El modelo es un `signal<T>()`. El formulario se crea con `form(model, schema)`. Los controles se enlazan con `[formField]`.
- La validación usa los mismos esquemas Zod del backend o del front, a través de `validateStandardSchema`.
- **Todos** los inputs del kit implementan `FormValueControl<T>` (o `FormCheckboxControl` para checkbox y switch), así funcionan con `[formField]` igual que un input nativo.
- `app-field` muestra label, hint, required y el primer error, leyendo el estado del campo. Las páginas no muestran errores manualmente.

```ts
@Component({
  selector: 'app-input',
  host: { class: 'contents' },
  template: `<input hlmInput [value]="value()" (input)="value.set($any($event.target).value)"
                    [disabled]="disabled()" [attr.aria-invalid]="invalid() || null" />`,
})
export class AppInput implements FormValueControl<string> {
  readonly value = model('');
  readonly disabled = input(false);
  readonly invalid = input(false);
}
```
```ts
export class ClienteForm {
  readonly model = signal<ClienteFormModel>(EMPTY_CLIENTE);
  readonly f = form(this.model, p => { validateStandardSchema(p, clienteSchema); });
}
```
```html
<app-field label="Nombre" [field]="f.nombre"><app-input [formField]="f.nombre" /></app-field>
```
- `app-form-actions` contiene los botones "Guardar" y "Cancelar" con loading y deshabilitado según el estado del form y de la mutación.
- Los formularios largos se dividen en secciones; cada sección es un componente con `FormValueControl<Seccion>`.
- Revisa las firmas exactas de los inputs opcionales del contrato (`disabled`, `invalid`, `errors`, `touched`, …) en la guía oficial "Custom controls" antes de construir el kit.

---

## 10. Tablas

`app-data-table` es **la única forma** de mostrar datos tabulares. Hoy, 18 de 40 tablas no usaban el wrapper y 10 archivos tenían `<table>` nativo.

API mínima (calcada del `AppDataTableProps` actual):
- `data`, `columns` (`ColumnDef<T>[]` definidas en `*.columns.ts`), `getRowId`
- `state` (o `isLoading`, `isFetching`, `error`): integra skeleton, error con reintento y vacío
- `paginationMode: 'client' | 'server' | 'none'`, `pagination`, `(paginationChange)`, `totalRows`
- `sorting` y `filters` (server o client)
- `density: 'xs' | 'sm' | 'md'` (por defecto toma la densidad global)
- `responsiveMode: 'cards' | 'scroll'` y `meta.priority` por columna para las cards móviles
- selección + `app-table-bulk-actions`, `app-table-row-actions` (menú por fila, con permisos)
- visibilidad de columnas persistida por tabla (`tableId`) y exportar a Excel o CSV
- celdas personalizadas con `ng-template` y helpers de columna (`moneyColumn`, `dateColumn`, `statusColumn`, `actionsColumn`)

Los helpers de columna garantizan que moneda (GTQ), fechas y estados se vean igual en todo el CRM.

---

## 11. Autenticación, roles, permisos, rutas y navegación

### 11.1 Se migran literal (TypeScript puro)
- `crm-permissions.ts` → `core/auth/permissions.ts` (`CRM_PERMISSION`, tipo `CrmPermission`)
- `crm-role-permissions.ts` → `core/auth/role-permissions.ts` (`ROLE_PERMISSIONS`)
- `RolUsuario` → `core/auth/roles.ts`

### 11.2 AuthStore y AuthorizationService
```ts
@Injectable({ providedIn: 'root' })
export class AuthStore {
  readonly user = signal<SessionUser | null>(null);
  readonly status = signal<'loading' | 'authenticated' | 'anonymous'>('loading');
  readonly role = computed(() => this.user()?.rol ?? null);
}

@Injectable({ providedIn: 'root' })
export class Authorization {
  private readonly auth = inject(AuthStore);
  private readonly perms = computed(() => new Set(this.auth.role() ? ROLE_PERMISSIONS[this.auth.role()!] : []));
  can = (p: CrmPermission) => this.perms().has(p);
  canAny = (ps: readonly CrmPermission[]) => ps.some(this.can);
  canAll = (ps: readonly CrmPermission[]) => ps.every(this.can);
}
```

### 11.3 Guards funcionales
```ts
export const authGuard: CanMatchFn = () => {
  const auth = inject(AuthStore);
  return auth.status() === 'authenticated' || inject(Router).createUrlTree(['/login']);
};

export const permissionGuard: CanMatchFn = route => {
  const needed = route.data?.['permission'] as CrmPermission | undefined;
  return !needed || inject(Authorization).can(needed) || inject(Router).createUrlTree(['/forbidden']);
};
```
La sesión se resuelve con `provideAppInitializer` antes de evaluar los guards, para no mostrar parpadeos de "Cargando".

### 11.4 Rutas por feature (adiós al Routes.tsx de 773 líneas)
```ts
// app.routes.ts
export const routes: Routes = [
  { path: 'login', loadComponent: () => import('@nova/features/auth').then(m => m.LoginPage) },
  {
    path: '', component: ShellLayout, canMatch: [authGuard],
    children: [
      { path: 'clientes', loadChildren: () => import('@nova/features/clientes').then(m => m.CLIENTES_ROUTES) },
      { path: 'tickets',  loadChildren: () => import('@nova/features/tickets').then(m => m.TICKETS_ROUTES) },
      { path: 'forbidden', loadComponent: () => import('./forbidden').then(m => m.ForbiddenPage) },
      { path: '', pathMatch: 'full', redirectTo: 'inicio' },
    ],
  },
  { path: '**', loadComponent: () => import('./not-found').then(m => m.NotFoundPage) },
];

// features/clientes/clientes.routes.ts
export const CLIENTES_ROUTES: Routes = [
  { path: '', canMatch: [permissionGuard], data: { permission: P.CLIENTES_VER }, loadComponent: () => import('./pages/cliente-list.page') },
  { path: 'nuevo', canMatch: [permissionGuard], data: { permission: P.CLIENTES_CREAR }, loadComponent: () => import('./pages/cliente-create.page') },
  { path: ':id', canMatch: [permissionGuard], data: { permission: P.CLIENTES_VER }, loadComponent: () => import('./pages/cliente-detail.page') },
];
```
- Los parámetros de ruta se reciben como `input()` (`withComponentInputBinding()`).
- Las URLs se normalizan en español y en kebab-case, sin la mezcla actual (`/crm-clientes` vs `/crm/cliente/:id`). Se recomienda mantener redirects desde las rutas viejas mientras convivan ambas apps.

### 11.5 Navegación: una sola config (adiós a los 7 archivos por rol)
```ts
export const NAV: NavItem[] = [
  { label: 'Inicio', icon: 'lucideHome', path: '/inicio', permission: P.DASHBOARD_VER },
  { label: 'Clientes', icon: 'lucideUsers', path: '/clientes', permission: P.CLIENTES_VER },
  { label: 'PPPoE', icon: 'lucideCable', children: [
      { label: 'Homologaciones', path: '/pppoe/homologaciones', permission: P.PPPOE_HOMOLOGACIONES_VER },
  ]},
];
// sidebar: computed(() => filterNav(NAV, authz.can))  → oculta grupos vacíos
```
Para cambiar lo que ve un rol solo se toca `ROLE_PERMISSIONS`. El menú y las rutas se actualizan solos.

### 11.6 En templates
- `@if (authz.can(P.PPPOE_SUSPENDER)) { … }` es la opción idiomática.
- `app-table-row-actions` y `app-dropdown-menu` aceptan `permission` por item y ocultan lo que no corresponde.
- **El backend sigue siendo la autoridad.** El front solo oculta; el servidor debe validar el mismo permiso.

---

## 12. Módulos especiales

| Necesidad | Enfoque |
|---|---|
| Tiempo real (socket.io) | `SocketService` en `core/realtime`. Expone `on<T>(event)` como signal u Observable. Los eventos tipados se migran desde `socket-events.ts`. Las features se suscriben y, al recibir un evento, **invalidan queries** en lugar de mutar estado a mano |
| Notificaciones del navegador | Servicio en core (migrar `browserNotifications.ts`) |
| Mapas y tracking | `@angular/google-maps` envuelto en `app-map` / `app-map-marker` del kit. Carga con `@defer (on viewport)` |
| Gráficas | `app-chart` wrapper con paleta tomada de los tokens (respeta tema y acento). Una sola librería |
| Editor de plantillas y contratos | ngx-tiptap envuelto en `app-rich-editor` (también es un `FormValueControl<string>`) |
| PDF (boletas, contratos, recibos) | Servicio `PdfService` con pdfmake. Plantillas en `features/<x>/pdf/` |
| Firma | `signature_pad` envuelto en `app-signature-pad` (`FormValueControl<string>`) |
| Recorte de imágenes | Wrapper `app-image-cropper` (hoy `ImageCropper.tsx` tiene 738 líneas: se divide) |
| Paleta de comandos (kbar) | `app-command` (spartan command) + atajos con `host` listeners |

---

## 13. Cómo se hace cumplir (CI)

1. **Límites entre módulos** (Nx `@nx/enforce-module-boundaries` con tags `type:feature`, `type:app-ui`, `type:ui`, `type:core`, `type:util`) según la tabla de §3.1. Si un feature importa `@nova/ui`, el build falla.
2. **ESLint** con `@angular-eslint` (TS y templates) y `no-restricted-imports` para `@spartan-ng/*`, `@nova/ui` y `@angular/common/http` dentro de `features/**/pages|ui`.
3. **Check de templates en `features/**`** (script en CI; puede empezar como grep y luego ser una regla de ESLint propia). Falla si encuentra:
   - `<button`, `<input`, `<select`, `<textarea`, `<table` nativos
   - clases de color de la paleta Tailwind (`(bg|text|border|ring)-(red|blue|…)-\d{2,3}`)
   - hex (`#[0-9a-f]{3,6}`) y valores arbitrarios (`-\[\d+px\]`, `text-\[`)
   - `ngClass`, `ngStyle`, `*ngIf`, `*ngFor`
4. **Tamaño de archivos:** un aviso a partir de 250 líneas por componente y error a partir de 400.
5. **Catálogo `/_design`** (o Storybook) con todos los componentes y controles de tema, escala y densidad. Pruebas visuales opcionales con Playwright.
6. **Tests:** unitarios del kit y de los guards; tests de componente para las pages críticas (login, clientes, pagos).

### Checklist de PR
- [ ] Solo usa componentes de `@nova/app` (cero HTML interactivo nativo ni helm directo)
- [ ] Cero colores, hex o px arbitrarios
- [ ] Probado a 360 px, en tablet y en desktop, en claro y oscuro, con escala S y XL
- [ ] Datos vía `data-access` del módulo; loading, error y vacío con `app-data-state` o la tabla
- [ ] Rutas con `permissionGuard`; acciones con `authz.can`
- [ ] Componentes de menos de 250 líneas; columnas en `*.columns.ts`
- [ ] Si se agregó algo al kit: entrada en `/_design` + test

---

## 14. Plan de migración por fases

Estrategia: repo nuevo que convive con la UI React (mismo backend) y migra módulo por módulo. Cada fase termina desplegable.

| Fase | Contenido | Criterio de salida |
|---|---|---|
| **0. Fundaciones** | Nx + Angular 22, Tailwind, spartan CLI, tokens, ThemeService + panel de apariencia, interceptores, AuthStore, guards, shell (sidebar NAV, topbar), `/_design`, CI con las reglas de §13 | Login funcional, menú filtrado por rol, tema/escala/densidad cambiando en vivo en `/_design` |
| **1. Kit completo** | Catálogo §5.2: primitivas, overlays, form controls (`FormValueControl`), `app-data-table` completo, `app-page` / `app-crud-page` | Todos los componentes en `/_design`, responsive y con tests |
| **2. CRUDs simples** (validan el kit) | Sectores, servicios, servicios de internet, facturación por zona, tags/categorías de soporte, empresa, usuarios, perfil | Sin ningún componente ad-hoc; si algo faltó, se agregó al kit |
| **3. Clientes** | Lista, perfil (detail-layout + tabs), alta, edición | Paridad funcional con React |
| **4. Operación** | Tickets (dashboard, detalle, boleta, firma), instalaciones, desinstalaciones, metas técnicos, dashboard técnico | Probado en móvil real por un técnico |
| **5. Cobranza** | Facturación, pagos, facturas eliminadas, rutas de cobro (asignadas y edición), créditos y contratos | Paridad + PDFs correctos |
| **6. Red** | PPPoE (cuentas, homologaciones, auditoría, operaciones), MikroTik/routers, OLT | Acciones sensibles detrás de permisos |
| **7. Comunicación y especiales** | WhatsApp (chats, plantillas, campañas, galería), bot, tracking en tiempo real y mapas, reportes y dashboards con gráficas | Sockets estables, mapas con `@defer` |
| **8. Corte** | Redirects de rutas viejas, apagado de la UI React | Todas las vistas migradas |

### Definition of Done por vista migrada
Paridad funcional con la vista React, checklist de PR completo, matriz responsive de §7.4 pasada, permisos verificados con cada rol que la ve, y sin `TODO` de UI pendientes.

### Cómo migrar una vista (receta)
1. Leer la vista React y anotar endpoints, permisos, estados, acciones y variantes responsive.
2. Crear o ampliar `data-access` del módulo (api, keys, queries y mutations).
3. Identificar los componentes del kit necesarios; si falta alguno, crearlo en `libs/app` primero.
4. Armar la página con `app-page` + kit; la lógica de presentación va a `ui/` del módulo.
5. Agregar la ruta con `permissionGuard` y el item en `NAV`.
6. Probar la matriz responsive y los roles; abrir el PR con el checklist.

---

## 15. Mapa rápido React → Angular

| React (POS-UI) | Angular (nuevo repo) |
|---|---|
| `components/ui/*` (shadcn) | `libs/ui` helm de spartan (privado) |
| `components/app/*` | `libs/app` kit NOVA |
| `theme/*.variants.ts` (CVA) | Mismos archivos CVA en `libs/app/theme` |
| `app-theme.css` | Igual, unificado y con los tokens nuevos de escala y densidad |
| `AppThemeProvider` / `useAppTheme` | `ThemeService` (signals + effect) |
| Zustand `useStoreCrm` | `AuthStore` (signals) |
| `useAuthorization` / `<Can>` | `Authorization.can()` + `@if` |
| `RequirePermission` / `ProtectRouteCrmUser` | `permissionGuard` / `authGuard` (`CanMatchFn`) |
| `Routes.tsx` | `app.routes.ts` + `<feature>.routes.ts` con lazy loading |
| `crm-sidebar-routes/routes-<rol>.ts` ×7 | `NAV` única + `filterNav(can)` |
| `CrmHooks/hooks/*` (47) | `features/<x>/data-access/*.queries.ts` |
| `axiosClientCrm` + `createApiClient` | `HttpClient` + `HttpInterceptorFn` + `API_BASE_URL` |
| `useQuery` / `useMutation` | `injectQuery` / `injectMutation` |
| react-hook-form + zodResolver | Signal Forms + `validateStandardSchema` |
| `AppForm*` (useController) | Controles `FormValueControl` + `[formField]` |
| `AppDataTable` (@tanstack/react-table) | `app-data-table` (TanStack Table Angular) |
| react-select | `app-combobox` (spartan) |
| sonner | ngx-sonner (`app-toast` service) |
| lucide-react | Lucide vía ng-icons |
| @react-google-maps / @vis.gl | `@angular/google-maps` |
| nivo + recharts | Una sola librería (ECharts recomendado) |
| tiptap/react, react-quill | ngx-tiptap (eliminar quill) |
| framer-motion / motion | Animaciones nativas de Angular + CSS (`@starting-style`, transiciones) |
| `useEffect` + fetch | Prohibido: siempre `data-access` |
| `useMemo` / `useCallback` | `computed()` / no hace falta |
| Context providers | Servicios `providedIn: 'root'` o `providers` de ruta |

---

## 16. Decisiones abiertas / pendientes

- [ ] **Proyecto "gastro":** no se encontró entre los repos de GitHub de `CardonaSantos`. Pasar la URL para comparar su kit y documentar qué páginas lo ignoraron.
- [ ] **Librería de gráficas única:** ECharts (recomendado: tematizable con tokens, buen rendimiento) vs. ApexCharts.
- [ ] **Nx vs. Angular CLI puro:** se recomienda Nx por los límites entre módulos. Con CLI puro, replicar con `eslint-plugin-boundaries`.
- [ ] **Prefijo de selectores de features** (`nv-` u otro).
- [ ] **Persistencia de preferencias de UI en el backend** (requiere un endpoint en `SERVER_CRM_NOVA`).
- [ ] **Generar tipos desde OpenAPI** del backend NestJS para `*.models.ts`.
- [ ] **Confirmar versiones exactas al iniciar el repo:** Angular, spartan (`@spartan-ng/brain`, `@spartan-ng/cli`), el paquete de TanStack Query Angular (puede seguir con sufijo `-experimental`), TanStack Table Angular y Tailwind.
- [ ] **Estrategia de despliegue en convivencia:** subdominio nuevo vs. proxy por rutas en Railway.
