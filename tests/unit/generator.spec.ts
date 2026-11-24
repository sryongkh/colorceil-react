import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { Api } from '../../src/app/core/services/api';
import { Generator } from '../../src/app/features/palettes/generator/generator';

describe('Generator', () => {
  const colors = ['#112233', '#445566', '#778899', '#AABBCC', '#DDEEFF'];
  const api = { user: vi.fn(), save: vi.fn() };
  const router = { navigate: vi.fn() };

  function create(query: Record<string, string> = {}) {
    TestBed.configureTestingModule({ providers: [
      { provide: Api, useValue: api },
      { provide: Router, useValue: router },
      { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap(query) } } },
    ] });
    return TestBed.runInInjectionContext(() => new Generator());
  }

  beforeEach(() => {
    const values = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => { values.set(key, value); },
      removeItem: (key: string) => { values.delete(key); },
    });
    api.user.mockReset().mockReturnValue({ id: 'artist' });
    api.save.mockReset().mockResolvedValue({});
    router.navigate.mockReset().mockResolvedValue(true);
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('imports five HEX colors in uppercase and consumes only the import parameter', () => {
    const generator = create({ colors: colors.join(',').toLowerCase() });
    expect(generator.colors()).toEqual(colors);
    expect(generator.hexDraft).toBe(colors[0]);
    expect(router.navigate).toHaveBeenCalledWith([], expect.objectContaining({
      queryParams: { colors: null }, queryParamsHandling: 'merge', replaceUrl: true,
    }));
    expect(JSON.parse(localStorage.getItem('colorceil-draft')!).colors).toEqual(colors);
  });

  it('restores a saved draft when an import is incomplete', () => {
    localStorage.setItem('colorceil-draft', JSON.stringify({ colors, name: 'Evening', tags: 'warm' }));
    const generator = create({ colors: '#123456,#654321' });
    expect(generator.colors()).toEqual(colors);
    expect(generator.name).toBe('Evening');
    expect(generator.tags).toBe('warm');
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it.each([
    '{broken', 'null', JSON.stringify({ colors: ['#123456'] }),
    JSON.stringify({ colors: [1, 2, 3, 4, 5] }),
    JSON.stringify({ colors: ['#000000', '#000000', '#000000', '#000000', 'bad'] }),
  ])('ignores an unusable stored draft: %s', draft => {
    localStorage.setItem('colorceil-draft', draft);
    const generator = create();
    expect(generator.colors()).toEqual(['#60A5FA', '#4ADE80', '#FACC15', '#FB923C', '#EF4444']);
    expect(generator.name).toBe('');
  });

  it('ignores non-string metadata in an otherwise valid draft', () => {
    localStorage.setItem('colorceil-draft', JSON.stringify({ colors, name: {}, tags: 123 }));
    const generator = create();
    expect(generator.colors()).toEqual(colors);
    expect(generator.name).toBe('');
    expect(generator.tags).toBe('');
  });

  it('keeps the last valid color when HEX editing is incomplete', () => {
    const generator = create();
    const original = [...generator.colors()];
    generator.changeHex('#FF');
    expect(generator.colors()).toEqual(original);
    expect(generator.hexDraft).toBe('#FF');
    expect(generator.hexError()).not.toBe('');
    generator.changeHex('#abcdef');
    expect(generator.colors()[0]).toBe('#ABCDEF');
    expect(generator.rgb()).toEqual([171, 205, 239]);
    expect(generator.hexError()).toBe('');
  });

  it('edits only the selected color and clamps RGB input', () => {
    const generator = create({ colors: colors.join(',') });
    generator.select(2);
    generator.changeChannel(0, 999);
    generator.changeChannel(1, -12);
    generator.changeChannel(2, null);
    expect(generator.colors()).toEqual([colors[0], colors[1], '#FF0000', colors[3], colors[4]]);
    expect(generator.hexDraft).toBe('#FF0000');
    expect(generator.rgb()).toEqual([255, 0, 0]);
  });

  it('can restore and edit colors even when browser storage is blocked', () => {
    vi.spyOn(localStorage, 'getItem').mockImplementation(() => { throw new Error('Blocked'); });
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => { throw new Error('Quota'); });
    const generator = create();
    expect(() => generator.changeHex('#123456')).not.toThrow();
    expect(generator.colors()[0]).toBe('#123456');
  });

  it('shuffles five valid colors, keeps the selection, and clears invalid input', () => {
    const generator = create();
    generator.select(3);
    generator.changeHex('bad');
    vi.spyOn(crypto, 'getRandomValues').mockReturnValueOnce(Uint8Array.from({ length: 15 }, (_, i) => i));
    generator.randomize();
    expect(generator.colors()).toEqual(['#000102', '#030405', '#060708', '#090A0B', '#0C0D0E']);
    expect(generator.selected()).toBe(3);
    expect(generator.hexDraft).toBe('#090A0B');
    expect(generator.hexError()).toBe('');
  });

  it('keeps the draft before redirecting a guest to sign in', async () => {
    api.user.mockReturnValue(null);
    const generator = create();
    generator.name = 'Guest draft';
    await generator.save();
    expect(JSON.parse(localStorage.getItem('colorceil-draft')!).name).toBe('Guest draft');
    expect(api.save).not.toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/signin'], { queryParams: { returnUrl: '/generate-palettes' } });
  });

  it('does not save incomplete HEX input', async () => {
    const generator = create();
    generator.changeHex('#12');
    await generator.save();
    expect(api.save).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('saves trimmed nonempty tags, clears the draft, and opens the collection', async () => {
    const generator = create();
    generator.name = 'Sunset';
    generator.tags = ' warm, , sunset, ';
    await generator.save();
    expect(api.save).toHaveBeenCalledWith({ name: 'Sunset', colors: generator.colors(), tags: ['warm', 'sunset'] });
    expect(localStorage.getItem('colorceil-draft')).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/my-palettes']);
    expect(generator.saving()).toBe(false);
  });

  it('retains the draft and permits a retry when saving fails', async () => {
    api.save.mockRejectedValueOnce(new HttpErrorResponse({ status: 400, error: { message: 'Choose a name.' } }));
    const generator = create();
    generator.name = 'Retry me';
    await generator.save();
    expect(generator.error()).toBe('Choose a name.');
    expect(generator.saving()).toBe(false);
    expect(JSON.parse(localStorage.getItem('colorceil-draft')!).name).toBe('Retry me');
    expect(router.navigate).not.toHaveBeenCalled();
    await generator.save();
    expect(generator.error()).toBe('');
    expect(api.save).toHaveBeenCalledTimes(2);
  });

  it('prevents duplicate submissions while a save is pending', async () => {
    let finish!: (value: unknown) => void;
    api.save.mockReturnValueOnce(new Promise(resolve => { finish = resolve; }));
    const generator = create();
    const pending = generator.save();
    expect(generator.saving()).toBe(true);
    await generator.save();
    expect(api.save).toHaveBeenCalledTimes(1);
    finish({});
    await pending;
    expect(generator.saving()).toBe(false);
  });
});
