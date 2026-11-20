// Kit NOVA — API pública de UI. Las features solo importan desde aquí (guía §5).

// Configuración y utilidades
export * from './lib/icons';
export * from './lib/core/tone';
export * from './lib/core/format';
export * from './lib/core/breakpoints';

// Layout
export * from './lib/layout/app-stack';
export * from './lib/layout/app-split';
export * from './lib/layout/app-container';
export * from './lib/layout/app-centered-screen';

// Página
export * from './lib/page/app-page';
export * from './lib/page/app-section';
export * from './lib/page/app-crud-page';

// Acciones
export * from './lib/primitives/app-button';
export * from './lib/primitives/app-dropdown-menu';

// Superficies
export * from './lib/surfaces/app-card';
export * from './lib/surfaces/app-tabs';

// Overlays
export * from './lib/overlay/app-drawer';
export * from './lib/overlay/app-dialog';
export * from './lib/overlay/app-confirm';
export * from './lib/overlay/app-popover';

// Feedback
export * from './lib/feedback/app-toast';
export * from './lib/feedback/app-alert';
export * from './lib/feedback/app-badge';
export * from './lib/feedback/app-loader';
export * from './lib/feedback/app-empty-state';
export * from './lib/feedback/app-data-state';

// Formulario
export * from './lib/form/control-base';
export * from './lib/form/app-field';
export * from './lib/form/app-input';
export * from './lib/form/app-textarea';
export * from './lib/form/app-select';
export * from './lib/form/app-combobox';
export * from './lib/form/app-checkbox';
export * from './lib/form/app-radio-group';
export * from './lib/form/app-date-picker';
export * from './lib/form/app-special-inputs';
export * from './lib/form/app-file-upload';
export * from './lib/form/app-form-actions';

// Tabla
export * from './lib/table/table-features';
export * from './lib/table/app-data-table';
export * from './lib/table/app-table-cell';
export * from './lib/table/app-table-bulk-actions';
export * from './lib/table/app-table-controls';
export * from './lib/table/app-table-pagination';
export * from './lib/table/app-table-cards';
export { toCsv, downloadText } from './lib/table/table-export';
export type { PaginationState, SortingState, RowSelectionState } from '@tanstack/angular-table';

// Dominio visual
export * from './lib/display/app-stat-card';
export * from './lib/display/app-display';
export * from './lib/chart/app-chart';

// Tema
export * from './lib/theme/app-appearance-panel';
