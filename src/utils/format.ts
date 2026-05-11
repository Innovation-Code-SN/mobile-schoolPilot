import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export function formatCurrency(amount: number, currency = 'XOF'): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  try {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(safe);
  } catch {
    return `${safe.toLocaleString('fr-FR')} ${currency}`;
  }
}

export function formatDate(iso?: string, pattern = 'dd MMM yyyy'): string {
  if (!iso) return '—';
  try {
    return format(parseISO(iso), pattern, { locale: fr });
  } catch {
    return iso;
  }
}

export function initials(firstName?: string, lastName?: string): string {
  const a = (firstName ?? '').trim().charAt(0);
  const b = (lastName ?? '').trim().charAt(0);
  return (a + b).toUpperCase() || '?';
}
