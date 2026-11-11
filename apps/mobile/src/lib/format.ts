/**
 * Formatters for Ethiopian Birr (ETB), agricultural units (Quintals, Kg, Hectares),
 * and dates.
 */

export function formatETB(amount: number): string {
  if (isNaN(amount)) return '0.00 ETB';
  return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB`;
}

export function formatQuintals(amount: number): string {
  if (isNaN(amount)) return '0.00 Qt';
  return `${amount.toFixed(2)} Qt`;
}

export function formatKg(amount: number): string {
  if (isNaN(amount)) return '0 kg';
  return `${amount.toLocaleString('en-US', { maximumFractionDigits: 1 })} kg`;
}

export function formatHectares(ha: number): string {
  if (isNaN(ha)) return '0.00 ha';
  return `${ha.toFixed(2)} ha`;
}

export function formatDate(date: string | number | Date): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

