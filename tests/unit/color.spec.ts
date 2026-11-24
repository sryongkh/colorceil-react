import { describe, expect, it } from 'vitest';
import { clampChannel, hexToRgb, readableInk, rgbToHex } from '../../src/app/shared/utils/color';

describe('color conversion', () => {
  it.each([
    [-1, 0], [0, 0], [127.4, 127], [127.5, 128], [255, 255], [300, 255],
    [NaN, 0], [Infinity, 0], [-Infinity, 0],
  ])('clamps RGB channel %s to %s', (input, output) => {
    expect(clampChannel(input)).toBe(output);
  });

  it('pads channels, normalizes case, and leaves the input unchanged', () => {
    const input = [0, 10, 255];
    expect(rgbToHex(input)).toBe('#000AFF');
    expect(input).toEqual([0, 10, 255]);
    expect(rgbToHex([-1, 127.6, 400])).toBe('#0080FF');
  });

  it.each(['#fff', 'FFB443', '#XYZ123', '#1234567', '', ' #123456', '#123456 '])(
    'rejects incomplete or malformed HEX %j', hex => expect(hexToRgb(hex)).toBeNull(),
  );

  it.each(['#000000', '#FFFFFF', '#ffb443', '#01020F', '#123ABC'])(
    'round-trips a valid HEX color %s', hex => {
      expect(rgbToHex(hexToRgb(hex)!)).toBe(hex.toUpperCase());
    },
  );

  it.each([
    ['#FFFFFF', '#111111'], ['#000000', '#FFFFFF'], ['#FF0000', '#111111'],
    ['#0000FF', '#FFFFFF'], ['#00FF00', '#111111'], ['#757575', '#FFFFFF'],
    ['#767676', '#111111'], ['invalid', '#FFFFFF'],
  ])('chooses readable ink for %s', (background, ink) => {
    expect(readableInk(background)).toBe(ink);
  });
});
