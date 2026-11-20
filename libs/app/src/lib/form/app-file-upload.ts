import { ChangeDetectionStrategy, Component, computed, inject, input, model, signal } from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { NgIcon } from '@ng-icons/core';
import { HlmButton } from '@nova/ui/button';
import { AppToast } from '../feedback/app-toast';
import { AppControlBase } from './control-base';

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * Carga de archivos con arrastrar y soltar. Valor `File[]`; subirlos es
 * trabajo del `data-access` del módulo. Valida tipo y tamaño en el cliente.
 */
@Component({
  selector: 'app-file-upload',
  imports: [NgIcon, HlmButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex w-full flex-col gap-2' },
  template: `
    <label
      [for]="controlId()"
      class="border-input hover:bg-muted/50 flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed p-6 text-center transition-colors"
      [class.bg-muted]="dragging()"
      [class.border-primary]="dragging()"
      [class.border-danger]="showInvalid()"
      [class.pointer-events-none]="disabled()"
      [class.opacity-50]="disabled()"
      (dragover)="$event.preventDefault(); dragging.set(true)"
      (dragleave)="dragging.set(false)"
      (drop)="onDrop($event)"
    >
      <ng-icon name="lucideUpload" size="1.5rem" class="text-muted-foreground" />
      <span class="text-sm font-medium">{{ label() }}</span>
      <span class="text-muted-foreground text-xs">{{ hintText() }}</span>
      <input
        type="file"
        class="sr-only"
        [id]="controlId()"
        [accept]="accept()"
        [multiple]="multiple()"
        [disabled]="disabled()"
        (change)="onPick($event)"
        (blur)="touch.emit()"
      />
    </label>
    @if (value().length) {
      <ul class="flex flex-col gap-1" aria-label="Archivos seleccionados">
        @for (file of value(); track $index) {
          <li class="bg-muted/50 flex items-center gap-2 rounded-md px-3 py-2 text-sm">
            <ng-icon name="lucideFileText" class="text-muted-foreground shrink-0" />
            <span class="min-w-0 flex-1 truncate">{{ file.name }}</span>
            <span class="text-muted-foreground text-xs tabular-nums">{{ size(file.size) }}</span>
            <button hlmBtn variant="ghost" size="icon-xs" type="button" [attr.aria-label]="'Quitar ' + file.name" (click)="remove($index)">
              <ng-icon name="lucideX" />
            </button>
          </li>
        }
      </ul>
    }
  `,
})
export class AppFileUpload extends AppControlBase implements FormValueControl<File[]> {
  private readonly toast = inject(AppToast);

  readonly value = model<File[]>([]);
  /** Tipos aceptados, como en `<input accept>`: "image/*,.pdf". */
  readonly accept = input('');
  readonly multiple = input(false);
  readonly maxSizeMb = input(10);
  readonly maxFiles = input(10);
  readonly label = input('Arrastra un archivo o haz clic para elegirlo');

  protected readonly dragging = signal(false);
  protected readonly size = formatSize;
  protected readonly hintText = computed(() => {
    const parts = [`Máximo ${this.maxSizeMb()} MB`];
    if (this.accept()) parts.unshift(this.accept().replaceAll(',', ', '));
    return parts.join(' · ');
  });

  protected onPick(event: Event): void {
    const el = event.target as HTMLInputElement;
    this.add(Array.from(el.files ?? []));
    el.value = '';
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    if (!this.disabled()) this.add(Array.from(event.dataTransfer?.files ?? []));
  }

  protected remove(index: number): void {
    this.value.update((files) => files.filter((_, i) => i !== index));
    this.touch.emit();
  }

  private add(files: File[]): void {
    const max = this.maxSizeMb() * 1024 * 1024;
    const ok = files.filter((f) => {
      if (f.size > max) this.toast.error(`"${f.name}" pesa más de ${this.maxSizeMb()} MB`);
      else if (!this.accepts(f)) this.toast.error(`"${f.name}" no es un tipo permitido`);
      else return true;
      return false;
    });
    if (!ok.length) return;
    const next = this.multiple() ? [...this.value(), ...ok].slice(0, this.maxFiles()) : ok.slice(0, 1);
    this.value.set(next);
    this.touch.emit();
  }

  private accepts(file: File): boolean {
    const rules = this.accept().split(',').map((r) => r.trim().toLowerCase()).filter(Boolean);
    if (!rules.length) return true;
    const name = file.name.toLowerCase();
    return rules.some((r) =>
      r.startsWith('.') ? name.endsWith(r) : r.endsWith('/*') ? file.type.startsWith(r.slice(0, -1)) : file.type === r,
    );
  }
}
