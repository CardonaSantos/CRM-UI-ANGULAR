import { formatDate, formatMoney, formatMonthYear, initials, parseDate, toDate } from './format';
import { toCsv } from '../table/table-export';

describe('formato del CRM', () => {
  it('moneda en quetzales con dos decimales', () => {
    expect(formatMoney(1234.5)).toMatch(/^Q\s?1,234\.50$/);
    expect(formatMoney('250')).toMatch(/^Q\s?250\.00$/);
    expect(formatMoney(null)).toBe('—');
    expect(formatMoney('abc')).toBe('—');
  });

  it('fechas dd/MM/yyyy', () => {
    expect(formatDate(new Date(2026, 10, 3))).toBe('03/11/2026');
    expect(formatDate('no-es-fecha')).toBe('—');
    expect(formatMonthYear(new Date(2026, 0, 1))).toMatch(/^Enero/);
  });

  it('parsea lo que escribe un usuario y rechaza fechas imposibles', () => {
    expect(parseDate('3/11/2026')?.getMonth()).toBe(10);
    expect(parseDate('31/02/2026')).toBeNull();
    expect(toDate('')).toBeNull();
  });

  it('iniciales para avatares', () => {
    expect(initials('Ana María López')).toBe('AL');
    expect(initials('carlos')).toBe('CA');
    expect(initials(null)).toBe('?');
  });
});

describe('exportación CSV', () => {
  it('incluye BOM, escapa comas/comillas y omite acciones', () => {
    const columns = [
      { id: 'nombre', columnDef: { header: 'Nombre', accessorKey: 'nombre' } },
      { id: 'saldo', columnDef: { header: 'Saldo', accessorFn: (r: { saldo: number }) => r.saldo, meta: { kind: 'money' } } },
    ];
    const csv = toCsv(columns as never, [{ nombre: 'López, "Ana"', saldo: 250.5 }]);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(csv).toContain('Nombre,Saldo');
    expect(csv).toContain('"López, ""Ana""",250.5');
  });
});
