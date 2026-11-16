export function clampChannel(value: number): number {
  return Math.max(
    0,
    Math.min(255, Math.round(Number.isFinite(value) ? value : 0)),
  );
}
export function rgbToHex(rgb: readonly number[]): string {
  return (
    '#' +
    rgb
      .map((c) => clampChannel(c).toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  );
}
export function hexToRgb(hex: string): number[] | null {
  return /^#[\da-f]{6}$/i.test(hex)
    ? [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
    : null;
}
export function readableInk(hex: string): string {
  const rgb = hexToRgb(hex) ?? [0, 0, 0];
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.179 ? '#111111' : '#FFFFFF';
}
