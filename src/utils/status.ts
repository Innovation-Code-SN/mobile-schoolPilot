type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'primary';

export function childStatusTone(status?: string): Tone {
  switch ((status ?? '').toUpperCase()) {
    case 'ENROLLED':
      return 'success';
    case 'PENDING':
      return 'warning';
    case 'SUSPENDED':
      return 'danger';
    case 'GRADUATED':
      return 'info';
    default:
      return 'neutral';
  }
}

export function childStatusLabel(status?: string): string {
  switch ((status ?? '').toUpperCase()) {
    case 'ENROLLED':
      return 'Inscrit';
    case 'PENDING':
      return 'En attente';
    case 'SUSPENDED':
      return 'Suspendu';
    case 'GRADUATED':
      return 'Diplômé';
    default:
      return status ?? '—';
  }
}

export function preRegStatusTone(status?: string): Tone {
  switch ((status ?? '').toUpperCase()) {
    case 'RECEIVED':
      return 'info';
    case 'UNDER_REVIEW':
      return 'warning';
    case 'APPROVED':
    case 'ADMITTED':
      return 'success';
    case 'REJECTED':
      return 'danger';
    default:
      return 'neutral';
  }
}

export function invoiceStatusTone(status?: string): Tone {
  switch ((status ?? '').toUpperCase()) {
    case 'PAID':
      return 'success';
    case 'PARTIAL':
      return 'info';
    case 'PENDING':
    case 'UNPAID':
      return 'warning';
    case 'OVERDUE':
      return 'danger';
    case 'CANCELLED':
      return 'neutral';
    default:
      return 'neutral';
  }
}

export function invitationStatusTone(status?: string): Tone {
  switch ((status ?? '').toUpperCase()) {
    case 'ACCEPTED':
      return 'success';
    case 'PENDING':
      return 'warning';
    case 'REJECTED':
    case 'EXPIRED':
      return 'danger';
    case 'CANCELLED':
      return 'neutral';
    default:
      return 'neutral';
  }
}

export function invitationStatusLabel(status?: string): string {
  switch ((status ?? '').toUpperCase()) {
    case 'ACCEPTED':
      return 'Acceptée';
    case 'PENDING':
      return 'En attente';
    case 'REJECTED':
      return 'Rejetée';
    case 'EXPIRED':
      return 'Expirée';
    case 'CANCELLED':
      return 'Annulée';
    default:
      return status ?? '—';
  }
}
