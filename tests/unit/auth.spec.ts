import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { Api } from '../../src/app/core/services/api';
import { Auth } from '../../src/app/features/auth/auth';

describe('Auth', () => {
  const api = { authenticate: vi.fn(), reset: vi.fn(), confirmReset: vi.fn() };
  const router = { navigateByUrl: vi.fn() };
  const validForm = { invalid: false } as NgForm;

  function create(mode = 'signin', query: Record<string, string> = {}) {
    TestBed.configureTestingModule({ providers: [
      { provide: Api, useValue: api },
      { provide: Router, useValue: router },
      { provide: ActivatedRoute, useValue: { snapshot: {
        routeConfig: { path: mode }, queryParamMap: convertToParamMap(query),
      } } },
    ] });
    const auth = TestBed.runInInjectionContext(() => new Auth());
    auth.email = 'artist@example.com';
    auth.password = 'Colorful-123';
    auth.confirmPassword = auth.password;
    return auth;
  }

  beforeEach(() => {
    api.authenticate.mockReset().mockResolvedValue(undefined);
    api.reset.mockReset().mockResolvedValue({ message: 'Check your email.' });
    api.confirmReset.mockReset().mockResolvedValue({ message: 'Password updated.' });
    router.navigateByUrl.mockReset().mockResolvedValue(true);
  });

  it('rejects invalid forms before making an API request', async () => {
    const auth = create();
    await auth.submit({ invalid: true } as NgForm);
    expect(auth.error()).toContain('Please complete all fields');
    expect(api.authenticate).not.toHaveBeenCalled();
    expect(auth.busy()).toBe(false);
  });

  it.each(['signup', 'reset-password'])('rejects mismatched passwords for %s', async mode => {
    const auth = create(mode);
    auth.confirmPassword = 'Different-123';
    await auth.submit(validForm);
    expect(auth.error()).toBe('Passwords do not match.');
    expect(api.authenticate).not.toHaveBeenCalled();
    expect(api.confirmReset).not.toHaveBeenCalled();
  });

  it.each([['signin', 'login'], ['signup', 'register']])(
    'submits %s and returns the visitor to their palette draft', async (mode, endpoint) => {
      const auth = create(mode, { returnUrl: '/generate-palettes' });
      await auth.submit(validForm);
      expect(api.authenticate).toHaveBeenCalledWith(endpoint, auth.email, auth.password);
      expect(router.navigateByUrl).toHaveBeenCalledWith('/generate-palettes');
      expect(auth.busy()).toBe(false);
    },
  );

  it.each(['https://other.example', '//other.example', '/admin', '/my-palettes?redirect=bad', ''])(
    'does not redirect to an unapproved return URL %j', async returnUrl => {
      const auth = create('signin', { returnUrl });
      await auth.submit(validForm);
      expect(router.navigateByUrl).toHaveBeenCalledWith('/my-palettes');
    },
  );

  it('shows login errors and releases the form for another attempt', async () => {
    api.authenticate.mockRejectedValueOnce(new HttpErrorResponse({ status: 401, error: { message: 'Incorrect password.' } }));
    const auth = create();
    await auth.submit(validForm);
    expect(auth.error()).toBe('Incorrect password.');
    expect(auth.busy()).toBe(false);
    expect(router.navigateByUrl).not.toHaveBeenCalled();
    await auth.submit(validForm);
    expect(auth.error()).toBe('');
    expect(router.navigateByUrl).toHaveBeenCalledOnce();
  });

  it('prevents a second request while authentication is pending', async () => {
    let finish!: () => void;
    api.authenticate.mockReturnValueOnce(new Promise<void>(resolve => { finish = resolve; }));
    const auth = create();
    const pending = auth.submit(validForm);
    await auth.submit(validForm);
    expect(api.authenticate).toHaveBeenCalledOnce();
    expect(auth.busy()).toBe(true);
    finish();
    await pending;
    expect(auth.busy()).toBe(false);
  });

  it('shows password-reset confirmation without redirecting', async () => {
    const auth = create('forgotpassword');
    await auth.submit(validForm);
    expect(api.reset).toHaveBeenCalledWith(auth.email);
    expect(auth.message()).toBe('Check your email.');
    expect(auth.completed()).toBe(true);
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it('sends the reset-link token and new password, then marks completion', async () => {
    const auth = create('reset-password', { token: 'single-use-token' });
    await auth.submit(validForm);
    expect(api.confirmReset).toHaveBeenCalledWith('single-use-token', auth.password);
    expect(auth.message()).toBe('Password updated.');
    expect(auth.completed()).toBe(true);
    expect(api.authenticate).not.toHaveBeenCalled();
  });

  it('keeps password reset retryable when the link has expired', async () => {
    api.confirmReset.mockRejectedValueOnce(new HttpErrorResponse({ status: 400, error: { message: 'Link expired.' } }));
    const auth = create('reset-password');
    await auth.submit(validForm);
    expect(auth.error()).toBe('Link expired.');
    expect(auth.completed()).toBe(false);
    expect(auth.busy()).toBe(false);
  });
});
