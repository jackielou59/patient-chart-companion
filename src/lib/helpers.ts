export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

export function calculateBMI(weightKg: string, heightCm: string): string {
  const w = parseFloat(weightKg);
  const h = parseFloat(heightCm) / 100;
  if (!w || !h || h <= 0) return '';
  return (w / (h * h)).toFixed(1);
}

export function truncate(str: string, len: number = 40): string {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '…' : str;
}
