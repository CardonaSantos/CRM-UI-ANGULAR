import { Component, computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { Breakpoints } from '../core/breakpoints';
import { AppDataReady, AppDataState } from '../feedback/app-data-state';
import { KIT_ICONS } from '../icons';
import { AppTab, AppTabs } from '../surfaces/app-tabs';
import { AppPage, type AppPageAction } from './app-page';

@Component({
  imports: [AppPage],
  template: `<app-page title="Clientes" [actions]="actions" [breadcrumbs]="[{ label: 'Inicio', link: '/' }, { label: 'Clientes' }]" />`,
})
class PageHost {
  actions: AppPageAction[] = [
    { label: 'Nuevo cliente', primary: true, run: () => undefined },
    { label: 'Importar', run: () => undefined },
    { label: 'Sin permiso', hidden: true, run: () => undefined },
  ];
}

function setup(mobile: boolean) {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      provideIcons(KIT_ICONS),
      { provide: Breakpoints, useValue: { isMobile: signal(mobile), isDesktop: signal(!mobile) } },
    ],
  });
}

const buttonLabels = (el: HTMLElement) =>
  [...el.querySelectorAll('header button')].map((b) => (b.textContent ?? '').trim() || b.getAttribute('aria-label'));

describe('app-page', () => {
  it('en escritorio muestra todas las acciones visibles como botones', async () => {
    setup(false);
    const fixture = TestBed.createComponent(PageHost);
    await fixture.whenStable();
    expect(buttonLabels(fixture.nativeElement)).toEqual(['Nuevo cliente', 'Importar']);
    expect(fixture.nativeElement.querySelector('nav[aria-label]')?.textContent).toContain('Inicio');
  });

  it('en móvil deja la acción principal y manda el resto al menú "⋯"', async () => {
    setup(true);
    const fixture = TestBed.createComponent(PageHost);
    await fixture.whenStable();
    expect(buttonLabels(fixture.nativeElement)).toEqual(['Nuevo cliente', 'Más acciones']);
  });
});

@Component({
  imports: [AppTabs, AppTab],
  template: `
    <app-tabs [tabs]="tabs" [(value)]="tab">
      <ng-template appTab="a"><p class="panel">Panel A</p></ng-template>
      <ng-template appTab="b"><p class="panel">Panel B</p></ng-template>
    </app-tabs>
  `,
})
class TabsHost {
  tab = signal<string | undefined>(undefined);
  tabs = [
    { id: 'a', label: 'A' },
    { id: 'b', label: 'B' },
    { id: 'c', label: 'C', hidden: true },
  ];
}

describe('app-tabs', () => {
  it('activa la primera pestaña, oculta las `hidden` y crea solo el panel activo', async () => {
    const fixture = TestBed.createComponent(TabsHost);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelectorAll('[role="tab"]').length).toBe(2);
    expect([...el.querySelectorAll('.panel')].map((p) => p.textContent)).toEqual(['Panel A']);

    fixture.componentInstance.tab.set('b');
    await fixture.whenStable();
    expect([...el.querySelectorAll('.panel')].map((p) => p.textContent)).toEqual(['Panel B']);
  });
});

@Component({
  imports: [AppDataState, AppDataReady],
  template: `
    <app-data-state [query]="query" emptyTitle="Sin pagos">
      <ng-template appDataReady let-data><p class="ok">{{ data.length }} pagos</p></ng-template>
    </app-data-state>
  `,
})
class DataStateHost {
  state = signal<'loading' | 'error' | 'empty' | 'ready'>('loading');
  refetched = 0;
  query = {
    isPending: computed(() => this.state() === 'loading'),
    isError: computed(() => this.state() === 'error'),
    error: () => ({ error: { message: ['Campo inválido', 'Otro error'] } }),
    data: computed(() => (this.state() === 'ready' ? [1, 2] : this.state() === 'empty' ? [] : undefined)),
    refetch: () => this.refetched++,
  };
}

describe('app-data-state', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideIcons(KIT_ICONS)] }));

  it('pasa por carga, error (mensaje de NestJS + reintentar), vacío y listo', async () => {
    const fixture = TestBed.createComponent(DataStateHost);
    const host = fixture.componentInstance;
    const el: HTMLElement = fixture.nativeElement;
    await fixture.whenStable();
    expect(el.querySelector('app-data-state')?.getAttribute('aria-busy')).toBe('true');

    host.state.set('error');
    await fixture.whenStable();
    expect(el.textContent).toContain('Campo inválido, Otro error');
    ([...el.querySelectorAll('button')].find((b) => b.textContent?.includes('Reintentar')) as HTMLButtonElement).click();
    expect(host.refetched).toBe(1);

    host.state.set('empty');
    await fixture.whenStable();
    expect(el.textContent).toContain('Sin pagos');

    host.state.set('ready');
    await fixture.whenStable();
    expect(el.querySelector('.ok')?.textContent).toBe('2 pagos');
  });
});
