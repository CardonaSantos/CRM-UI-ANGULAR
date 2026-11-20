import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormField, email, form, maxLength, minLength, required, submit } from '@angular/forms/signals';
import {
  AppCheckbox,
  AppCode,
  AppCombobox,
  AppComboboxMulti,
  AppDatePicker,
  AppDateRange,
  type AppDateRangeValue,
  AppField,
  AppFileUpload,
  AppFormActions,
  AppGrid,
  AppInput,
  AppMoneyInput,
  AppMonthPicker,
  type AppOption,
  AppPhoneInput,
  AppRadioGroup,
  AppSearchInput,
  AppSection,
  AppSelect,
  AppStack,
  AppSwitch,
  AppTextarea,
  AppToast,
} from '@nova/app';
import { CLIENTES_DEMO, PLAN_OPTIONS, SECTOR_OPTIONS } from './catalog-data';

interface FormDemo {
  nombre: string;
  correo: string;
  telefono: string;
  sector: string | null;
  plan: string | null;
  servicios: string[];
  tipo: string | null;
  monto: number | null;
  fechaInstalacion: Date | null;
  periodo: AppDateRangeValue;
  mesFacturacion: Date | null;
  notas: string;
  activo: boolean;
  acepta: boolean;
  adjuntos: File[];
}

const EMPTY: FormDemo = {
  nombre: '', correo: '', telefono: '', sector: null, plan: null, servicios: [], tipo: null, monto: null,
  fechaInstalacion: null, periodo: null, mesFacturacion: null, notas: '', activo: true, acepta: false, adjuntos: [],
};

/** Catálogo: todos los controles con Signal Forms, validación y `app-form-actions`. */
@Component({
  selector: 'nv-catalog-forms',
  imports: [
    FormField, AppCode, AppSection, AppStack, AppGrid, AppField, AppInput, AppTextarea, AppSelect, AppCombobox,
    AppComboboxMulti, AppCheckbox, AppSwitch, AppRadioGroup, AppDatePicker, AppDateRange, AppMonthPicker,
    AppSearchInput, AppMoneyInput, AppPhoneInput, AppFileUpload, AppFormActions,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './catalog-forms.html',
})
export class CatalogForms {
  private readonly toast = inject(AppToast);

  protected readonly model = signal<FormDemo>({ ...EMPTY });
  protected readonly f = form(this.model, (p) => {
    required(p.nombre, { message: 'El nombre es obligatorio' });
    minLength(p.nombre, 3, { message: 'Mínimo 3 caracteres' });
    required(p.correo, { message: 'El correo es obligatorio' });
    email(p.correo, { message: 'Correo no válido' });
    required(p.sector, { message: 'Elige un sector' });
    required(p.plan, { message: 'Elige un plan' });
    required(p.monto, { message: 'Ingresa el monto' });
    required(p.fechaInstalacion, { message: 'Elige la fecha' });
    // maxLength llega solo al control (contador en app-textarea).
    maxLength(p.notas, 300, { message: 'Máximo 300 caracteres' });
  });
  protected readonly saving = signal(false);

  protected readonly servicios: AppOption<string>[] = [
    { value: 'tv', label: 'Televisión' },
    { value: 'ip', label: 'IP fija' },
    { value: 'router', label: 'Router adicional' },
    { value: 'soporte', label: 'Soporte premium' },
  ];
  protected readonly tipos: AppOption<string>[] = [
    { value: 'residencial', label: 'Residencial', description: 'Casa de habitación' },
    { value: 'empresarial', label: 'Empresarial', description: 'Negocio o empresa' },
  ];
  protected readonly sectores = SECTOR_OPTIONS;
  protected readonly planes = PLAN_OPTIONS;

  // Búsqueda "en servidor" simulada para el combobox.
  protected readonly clienteSearch = signal('');
  protected readonly clienteId = signal<number | null>(null);
  protected readonly clienteOptions = computed<AppOption<number>[]>(() => {
    const q = this.clienteSearch().toLowerCase();
    return CLIENTES_DEMO.filter((c) => c.nombre.toLowerCase().includes(q))
      .slice(0, 8)
      .map((c) => ({ value: c.id, label: c.nombre, description: c.sector }));
  });
  protected readonly lastSearch = signal('');

  protected onSubmit(event: Event): void {
    event.preventDefault();
    submit(this.f, async () => {
      this.saving.set(true);
      await new Promise((r) => setTimeout(r, 1000));
      this.saving.set(false);
      this.toast.success('Formulario válido', 'Así se ve un guardado correcto.');
      return undefined;
    });
  }

  protected reset(): void {
    this.model.set({ ...EMPTY });
    this.f().reset();
  }
}
