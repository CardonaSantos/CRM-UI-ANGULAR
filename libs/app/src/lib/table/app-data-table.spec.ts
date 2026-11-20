import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideIcons } from '@ng-icons/core';
import { Breakpoints } from '../core/breakpoints';
import { KIT_ICONS } from '../icons';
import { AppDataTable } from './app-data-table';
import { AppCellDef } from './app-table-cell';
import { actionsColumn, appColumns, moneyColumn, statusColumn } from './table-features';

interface Fila {
  id: number;
  nombre: string;
  saldo: number;
  estado: string;
}

const FILAS: Fila[] = Array.from({ length: 23 }, (_, i) => ({
  id: i + 1,
  nombre: i === 0 ? 'Zoila Méndez' : `Cliente ${String(i + 1).padStart(2, '0')}`,
  saldo: i * 10,
  estado: i % 2 ? 'MOROSO' : 'ACTIVO',
}));

const col = appColumns<Fila>();
const COLUMNS = [
  col.accessor('nombre', { header: 'Nombre', meta: { priority: 1 } }),
  moneyColumn<Fila>('saldo', 'Saldo', (f) => f.saldo),
  statusColumn<Fila>('estado', 'Estado', (f) => f.estado, {
    ACTIVO: { label: 'Activo', tone: 'success' },
    MOROSO: { label: 'Moroso', tone: 'warning' },
  }),
  actionsColumn<Fila>(() => [{ label: 'Editar', run: () => undefined }]),
];

@Component({
  imports: [AppDataTable, AppCellDef],
  template: `
    <app-data-table
      [data]="data()"
      [columns]="columns"
      [getRowId]="rowId"
      [loading]="loading()"
      [searchable]="true"
      [selectable]="true"
      [bulkActions]="bulk"
      emptyTitle="Nada por aquí"
    >
      <ng-template appCell="nombre" let-row><strong class="nombre">{{ row.nombre }}</strong></ng-template>
    </app-data-table>
  `,
})
class Host {
  data = signal<Fila[]>(FILAS);
  loading = signal(false);
  columns = COLUMNS;
  rowId = (f: Fila) => String(f.id);
  selected: Fila[] = [];
  bulk = [{ label: 'Suspender', run: (rows: Fila[]) => (this.selected = rows) }];
}

function setup(mobile = false) {
  TestBed.configureTestingModule({
    providers: [
      provideIcons(KIT_ICONS),
      { provide: Breakpoints, useValue: { isMobile: signal(mobile), isDesktop: signal(!mobile) } },
    ],
  });
  const fixture = TestBed.createComponent(Host);
  const el: HTMLElement = fixture.nativeElement;
  const bodyRows = () => el.querySelectorAll('tbody tr');
  return { fixture, el, bodyRows };
}

describe('app-data-table', () => {
  it('pagina en el cliente (10 por página) y muestra el rango', async () => {
    const { fixture, el, bodyRows } = setup();
    await fixture.whenStable();
    expect(bodyRows().length).toBe(10);
    expect(el.textContent).toContain('1–10 de 23');

    (el.querySelector('[aria-label="Página siguiente"] button, button[aria-label="Página siguiente"]') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(el.textContent).toContain('11–20 de 23');
  });

  it('formatea moneda y estado, y usa la celda personalizada', async () => {
    const { fixture, el } = setup();
    await fixture.whenStable();
    const first = el.querySelector('tbody tr') as HTMLElement;
    expect(first.querySelector('.nombre')?.textContent).toBe('Zoila Méndez');
    expect(first.textContent).toMatch(/Q\s?0\.00/);
    expect(first.textContent).toContain('Activo');
  });

  it('ordena al pulsar el encabezado', async () => {
    const { fixture, el } = setup();
    await fixture.whenStable();
    const header = [...el.querySelectorAll('th button')].find((b) => b.textContent?.includes('Nombre')) as HTMLButtonElement;
    header.click();
    await fixture.whenStable();
    expect(el.querySelector('thead th[aria-sort]')?.getAttribute('aria-sort')).toBe('ascending');
    expect(el.querySelector('tbody tr .nombre')?.textContent).toBe('Cliente 02');
  });

  it('busca sin distinguir mayúsculas', async () => {
    const { fixture, el, bodyRows } = setup();
    await fixture.whenStable();
    const input = el.querySelector('input[type="search"]') as HTMLInputElement;
    input.value = 'zoila';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    await fixture.whenStable();
    expect(bodyRows().length).toBe(1);
  });

  it('selecciona filas y ejecuta la acción masiva con los registros', async () => {
    const { fixture, el } = setup();
    await fixture.whenStable();
    const boxes = el.querySelectorAll('tbody [role="checkbox"]');
    (boxes[0] as HTMLElement).click();
    (boxes[1] as HTMLElement).click();
    await fixture.whenStable();
    expect(el.textContent).toContain('2 seleccionados');
    const suspender = [...el.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Suspender') as HTMLButtonElement;
    suspender.click();
    expect(fixture.componentInstance.selected.map((f) => f.id)).toEqual([1, 2]);
  });

  it('muestra skeleton al cargar y el estado vacío sin datos', async () => {
    const { fixture, el } = setup();
    fixture.componentInstance.loading.set(true);
    await fixture.whenStable();
    expect(el.querySelector('[aria-busy="true"]')).not.toBeNull();

    fixture.componentInstance.loading.set(false);
    fixture.componentInstance.data.set([]);
    await fixture.whenStable();
    expect(el.textContent).toContain('Nada por aquí');
  });

  it('en móvil muestra cards con la columna prioritaria como título', async () => {
    const { fixture, el } = setup(true);
    await fixture.whenStable();
    expect(el.querySelector('table')).toBeNull();
    const card = el.querySelector('app-table-cards li') as HTMLElement;
    expect(card.querySelector('.nombre')?.textContent).toBe('Zoila Méndez');
    expect(card.querySelector('dt')?.textContent).toBe('Saldo');
  });
});
