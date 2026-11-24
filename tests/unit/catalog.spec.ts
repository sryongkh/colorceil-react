import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import type { Palette } from '../../src/app/core/models/palette';
import { Api } from '../../src/app/core/services/api';
import { Catalog } from '../../src/app/features/palettes/catalog/catalog';

describe('Catalog', () => {
  const samples: Palette[] = [
    { _id: '1', name: 'Zesty summer', colors: ['#60A5FA'], tags: ['warm'], createdAt: '2026-01-01' },
    { _id: '2', name: 'Ocean', colors: ['#001122'], tags: ['blue'], createdAt: '2026-03-01' },
    { _id: '3', name: 'Amber', colors: ['#FFAA00'], tags: ['warm'], createdAt: '2026-02-01' },
  ];
  const api = { palettes: vi.fn(), delete: vi.fn() };
  const router = { navigate: vi.fn() };

  function create(path = 'palettes', query = '') {
    const params = new BehaviorSubject(convertToParamMap({ q: query }));
    TestBed.configureTestingModule({ providers: [
      { provide: Api, useValue: api },
      { provide: Router, useValue: router },
      { provide: ActivatedRoute, useValue: { snapshot: { routeConfig: { path } }, queryParamMap: params } },
    ] });
    return { catalog: TestBed.runInInjectionContext(() => new Catalog()), params };
  }

  beforeEach(() => {
    api.palettes.mockReset().mockResolvedValue({ palettes: structuredClone(samples) });
    api.delete.mockReset().mockResolvedValue(undefined);
    router.navigate.mockReset().mockResolvedValue(true);
  });
  afterEach(() => vi.restoreAllMocks());

  it.each([['palettes', false], ['my-palettes', true]] as const)(
    'loads the correct collection for %s', async (path, mine) => {
      const { catalog } = create(path);
      expect(catalog.loading()).toBe(true);
      await Promise.resolve();
      expect(api.palettes).toHaveBeenCalledWith(mine);
      expect(catalog.palettes()).toEqual(samples);
      expect(catalog.loading()).toBe(false);
    },
  );

  it.each([['oCeAn', ['2']], [' WARM ', ['3', '1']], ['#60a5fa', ['1']], ['#60a', ['1']], ['missing', []]])(
    'filters by name, tag, or HEX for query %j', async (query, ids) => {
      const { catalog } = create('search-palettes', query);
      await Promise.resolve();
      expect(catalog.filtered().map(palette => palette._id)).toEqual(ids);
    },
  );

  it('sorts each view without mutating the source collection', async () => {
    const { catalog } = create();
    await Promise.resolve();
    expect(catalog.filtered().map(p => p._id)).toEqual(['2', '3', '1']);
    catalog.sort.set('oldest');
    expect(catalog.filtered().map(p => p._id)).toEqual(['1', '3', '2']);
    catalog.sort.set('name');
    expect(catalog.filtered().map(p => p._id)).toEqual(['3', '2', '1']);
    expect(catalog.palettes()).toEqual(samples);
  });

  it('updates results when the route query changes', async () => {
    const { catalog, params } = create('search-palettes', 'Ocean');
    await Promise.resolve();
    params.next(convertToParamMap({ q: 'Amber' }));
    expect(catalog.query).toBe('Amber');
    expect(catalog.filtered().map(p => p._id)).toEqual(['3']);
  });

  it('removes an empty search query from the URL', () => {
    const { catalog } = create();
    catalog.query = '   ';
    catalog.search();
    expect(router.navigate).toHaveBeenCalledWith([], expect.objectContaining({ queryParams: { q: null } }));
  });

  it('shows a load error and clears it after a successful retry', async () => {
    api.palettes.mockRejectedValueOnce(new HttpErrorResponse({ status: 503 }));
    const { catalog } = create();
    await Promise.resolve();
    expect(catalog.error()).toContain('Please try again shortly.');
    expect(catalog.loading()).toBe(false);
    await catalog.load();
    expect(catalog.error()).toBe('');
    expect(catalog.palettes()).toEqual(samples);
  });

  it('does not delete a palette if confirmation is cancelled', async () => {
    vi.spyOn(globalThis, 'confirm').mockReturnValue(false);
    const { catalog } = create('my-palettes');
    await Promise.resolve();
    await catalog.delete(samples[0]);
    expect(api.delete).not.toHaveBeenCalled();
    expect(catalog.palettes()).toEqual(samples);
  });

  it('removes only the deleted palette after the API succeeds', async () => {
    vi.spyOn(globalThis, 'confirm').mockReturnValue(true);
    let finish!: () => void;
    api.delete.mockReturnValueOnce(new Promise<void>(resolve => { finish = resolve; }));
    const { catalog } = create('my-palettes');
    await Promise.resolve();
    const pending = catalog.delete(samples[0]);
    expect(catalog.deleting()).toBe('1');
    expect(catalog.palettes()).toEqual(samples);
    finish();
    await pending;
    expect(catalog.palettes().map(p => p._id)).toEqual(['2', '3']);
    expect(catalog.deleting()).toBe('');
  });

  it('retains a palette and releases the delete button when deletion fails', async () => {
    vi.spyOn(globalThis, 'confirm').mockReturnValue(true);
    api.delete.mockRejectedValueOnce(new HttpErrorResponse({ status: 404, error: { message: 'Palette no longer exists.' } }));
    const { catalog } = create('my-palettes');
    await Promise.resolve();
    await catalog.delete(samples[0]);
    expect(catalog.palettes()).toEqual(samples);
    expect(catalog.error()).toBe('Palette no longer exists.');
    expect(catalog.deleting()).toBe('');
  });
});
