import { describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { Api } from '../../src/app/core/services/api';
import { requireAuth } from '../../src/app/core/guards/require-auth';

describe('requireAuth', () => {
  function setup() {
    let user: { id: string } | null = null;
    let finish!: () => void;
    const api = {
      user: () => user,
      restoreSession: vi.fn(() => new Promise<void>(resolve => {
        finish = resolve;
      })),
    };
    TestBed.configureTestingModule({ providers: [{ provide: Api, useValue: api }, Router] });
    const router = TestBed.inject(Router);
    const guard = TestBed.runInInjectionContext(() =>
      requireAuth({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
    return { guard, router, finish: (signedIn: boolean) => { user = signedIn ? { id: 'artist' } : null; finish(); } };
  }

  it('waits for session restoration before allowing an authenticated visitor', async () => {
    const { guard, finish } = setup();
    finish(true);
    expect(await guard).toBe(true);
  });

  it('redirects guests to sign in with their collection as the return URL', async () => {
    const { guard, router, finish } = setup();
    finish(false);
    expect(router.serializeUrl(await guard as ReturnType<Router['createUrlTree']>))
      .toBe('/signin?returnUrl=%2Fmy-palettes');
  });
});
