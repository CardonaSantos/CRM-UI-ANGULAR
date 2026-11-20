import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormField, form, required } from '@angular/forms/signals';
import { AppButton } from './primitives/app-button';
import { AppField } from './form/app-field';
import { AppInput } from './form/app-input';

@Component({
  imports: [AppButton],
  template: `<app-button [loading]="loading()" (click)="clicks = clicks + 1">Guardar</app-button>`,
})
class ButtonHost {
  loading = signal(false);
  clicks = 0;
}

@Component({
  imports: [FormField, AppField, AppInput],
  template: `
    <app-field label="Nombre" for="n" [field]="f.nombre">
      <app-input inputId="n" [formField]="f.nombre" />
    </app-field>
  `,
})
class FieldHost {
  model = signal({ nombre: '' });
  f = form(this.model, (p) => required(p.nombre, { message: 'Obligatorio' }));
}

describe('app-button', () => {
  it('deshabilita y marca aria-busy mientras carga', async () => {
    const fixture = TestBed.createComponent(ButtonHost);
    fixture.componentInstance.loading.set(true);
    await fixture.whenStable();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.disabled).toBe(true);
    expect(button.getAttribute('aria-busy')).toBe('true');
  });
});

describe('app-input + app-field', () => {
  it('enlaza el valor con [formField]', async () => {
    const fixture = TestBed.createComponent(FieldHost);
    await fixture.whenStable();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.value = 'Ana';
    input.dispatchEvent(new Event('input'));
    expect(fixture.componentInstance.model().nombre).toBe('Ana');
  });

  it('muestra el error solo cuando el campo fue tocado', async () => {
    const fixture = TestBed.createComponent(FieldHost);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).not.toContain('Obligatorio');
    expect(el.textContent).toContain('*');

    el.querySelector('input')?.dispatchEvent(new Event('blur'));
    await fixture.whenStable();
    expect(el.querySelector('[role="alert"]')?.textContent).toContain('Obligatorio');
  });
});
