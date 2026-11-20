import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormField, form, required } from '@angular/forms/signals';
import { provideIcons } from '@ng-icons/core';
import { KIT_ICONS } from '../icons';
import { AppCheckbox, AppSwitch } from './app-checkbox';
import { AppField } from './app-field';
import { AppMoneyInput, AppPhoneInput, AppSearchInput } from './app-special-inputs';
import { AppTextarea } from './app-textarea';

@Component({
  imports: [FormField, AppField, AppTextarea, AppCheckbox, AppSwitch, AppMoneyInput, AppPhoneInput],
  template: `
    <app-field label="Notas" for="n" [field]="f.notas"><app-textarea inputId="n" [formField]="f.notas" /></app-field>
    <app-checkbox label="Acepto" [formField]="f.acepta" />
    <app-switch label="Activo" [formField]="f.activo" />
    <app-money-input inputId="m" [formField]="f.monto" />
    <app-phone-input inputId="t" [formField]="f.telefono" />
  `,
})
class FormHost {
  model = signal({ notas: '', acepta: false, activo: true, monto: null as number | null, telefono: '' });
  f = form(this.model, (p) => required(p.notas, { message: 'Escribe algo' }));
}

function type(el: HTMLInputElement | HTMLTextAreaElement, value: string) {
  el.value = value;
  el.dispatchEvent(new Event('input'));
}

describe('controles de formulario del kit', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideIcons(KIT_ICONS)] }));

  it('app-textarea enlaza el valor y app-field muestra el error al tocarlo', async () => {
    const fixture = TestBed.createComponent(FormHost);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    const textarea = el.querySelector('textarea') as HTMLTextAreaElement;
    textarea.dispatchEvent(new Event('blur'));
    await fixture.whenStable();
    expect(el.querySelector('[role="alert"]')?.textContent).toContain('Escribe algo');

    type(textarea, 'Portón negro');
    await fixture.whenStable();
    expect(fixture.componentInstance.model().notas).toBe('Portón negro');
    expect(el.querySelector('[role="alert"]')).toBeNull();
  });

  it('app-checkbox y app-switch implementan FormCheckboxControl', async () => {
    const fixture = TestBed.createComponent(FormHost);
    await fixture.whenStable();
    const [checkbox, sw] = fixture.nativeElement.querySelectorAll('[role="checkbox"], [role="switch"]');
    (checkbox as HTMLElement).click();
    (sw as HTMLElement).click();
    await fixture.whenStable();
    expect(fixture.componentInstance.model().acepta).toBe(true);
    expect(fixture.componentInstance.model().activo).toBe(false);
  });

  it('app-money-input guarda número y muestra separadores al salir', async () => {
    const fixture = TestBed.createComponent(FormHost);
    await fixture.whenStable();
    const input = fixture.nativeElement.querySelector('#m') as HTMLInputElement;
    type(input, '1250.456');
    input.dispatchEvent(new Event('blur'));
    await fixture.whenStable();
    expect(fixture.componentInstance.model().monto).toBe(1250.46);
    expect(input.value).toBe('1,250.46');
  });

  it('app-phone-input guarda solo 8 dígitos y muestra 5555-1234', async () => {
    const fixture = TestBed.createComponent(FormHost);
    await fixture.whenStable();
    const input = fixture.nativeElement.querySelector('#t') as HTMLInputElement;
    type(input, '(502) 5555 12345');
    await fixture.whenStable();
    expect(fixture.componentInstance.model().telefono).toBe('50255551');
    expect(input.value).toBe('5025-5551');
  });
});

@Component({
  imports: [AppSearchInput],
  template: `<app-search-input [debounce]="200" (searched)="last = $event" />`,
})
class SearchHost {
  last = '';
}

describe('app-search-input', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideIcons(KIT_ICONS)] }));

  it('emite el texto después del debounce, y de inmediato con Enter', async () => {
    vi.useFakeTimers();
    const fixture = TestBed.createComponent(SearchHost);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    type(input, ' fibra ');
    expect(fixture.componentInstance.last).toBe('');
    vi.advanceTimersByTime(250);
    expect(fixture.componentInstance.last).toBe('fibra');

    type(input, 'olt');
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(fixture.componentInstance.last).toBe('olt');
    vi.useRealTimers();
  });
});
