export function getCompanyInitials(name?: string | null): string {
  if (!name) return 'CO';

  const words = name
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return 'CO';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();

  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

export function getCompanyColor(name?: string | null): string {
  const palette = ['#4F46E5', '#0F766E', '#BE123C', '#7C3AED', '#B45309', '#0369A1'];
  const source = name || 'Company';
  const hash = source.split('').reduce((total, char) => total + char.charCodeAt(0), 0);
  return palette[hash % palette.length];
}
