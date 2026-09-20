export function uid(prefix: string = 'id'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export function escapeHtml(str: string): string {
  if (!str) return '';
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return str.replace(/[&<>"']/g, (c) => map[c] || c);
}

export function hexToRgb(hex: string): [number, number, number] {
  let cleaned = hex.replace('#', '').trim();
  if (cleaned.length === 3) {
    cleaned = cleaned.split('').map((c) => c + c).join('');
  }
  const num = parseInt(cleaned, 16);
  if (isNaN(num)) return [124, 58, 237];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

export function getContrastColor(rgb: [number, number, number]): [number, number, number] {
  const yiq = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
  return yiq >= 160 ? [30, 41, 59] : [255, 255, 255];
}

export function showToast(message: string, durationMs: number = 2400): void {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className =
    'bg-slate-900 text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-lg border border-slate-700/50 transform transition-all duration-200 opacity-0 translate-y-2 select-none pointer-events-none flex items-center gap-2';
  toast.textContent = message;

  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.remove('opacity-0', 'translate-y-2');
    toast.classList.add('opacity-100', 'translate-y-0');
  });

  setTimeout(() => {
    toast.classList.remove('opacity-100', 'translate-y-0');
    toast.classList.add('opacity-0', '-translate-y-1');
    setTimeout(() => toast.remove(), 200);
  }, durationMs);
}
