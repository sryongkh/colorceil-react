import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Api, errorMessage } from '../../src/app/core/services/api';

describe('Api', () => {
  let api: Api;
  let http: HttpTestingController;
  const user = { id: 'user-1', email: 'artist@example.com' };

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    api = TestBed.inject(Api);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('deduplicates session restoration and waits for the response before marking ready', async () => {
    const first = api.restoreSession();
    const second = api.restoreSession();
    expect(first).toBe(second);
    expect(api.ready()).toBe(false);
    http.expectOne({ method: 'GET', url: '/api/auth/me' }).flush({ user });
    await first;
    expect(api.user()).toEqual(user);
    expect(api.ready()).toBe(true);
    await api.restoreSession();
    http.expectNone('/api/auth/me');
  });

  it.each([401, 503])('finishes session discovery after HTTP %s', async status => {
    api.user.set(user);
    const result = api.restoreSession();
    http.expectOne('/api/auth/me').flush({}, { status, statusText: 'Unavailable' });
    await result;
    expect(api.user()).toBeNull();
    expect(api.ready()).toBe(true);
  });

  it.each(['register', 'login'] as const)('updates the session only after %s succeeds', async mode => {
    const result = api.authenticate(mode, user.email, 'password-123');
    const request = http.expectOne({ method: 'POST', url: `/api/auth/${mode}` });
    expect(request.request.body).toEqual({ email: user.email, password: 'password-123' });
    expect(api.user()).toBeNull();
    request.flush({ user });
    await result;
    expect(api.user()).toEqual(user);
  });

  it('does not create a session after rejected credentials', async () => {
    const result = api.authenticate('login', user.email, 'wrong');
    const assertion = expect(result).rejects.toMatchObject({ status: 401 });
    http.expectOne('/api/auth/login').flush({}, { status: 401, statusText: 'Unauthorized' });
    await assertion;
    expect(api.user()).toBeNull();
  });

  it('keeps the session when logout fails and clears it after a successful retry', async () => {
    api.user.set(user);
    const failed = api.logout();
    const assertion = expect(failed).rejects.toMatchObject({ status: 503 });
    http.expectOne('/api/auth/logout').flush({}, { status: 503, statusText: 'Unavailable' });
    await assertion;
    expect(api.user()).toEqual(user);
    const success = api.logout();
    http.expectOne({ method: 'POST', url: '/api/auth/logout' }).flush(null, { status: 204, statusText: 'No Content' });
    await success;
    expect(api.user()).toBeNull();
  });

  it('switches between the demo library and real personal collections', async () => {
    const preview = api.palettes();
    http.expectOne('/api/palettes').flush({ palettes: [], demo: true });
    await preview;
    expect(api.demo()).toBe(true);
    const mine = api.palettes(true);
    http.expectOne('/api/palettes/mine').flush({ palettes: [] });
    await mine;
    expect(api.demo()).toBe(false);
  });

  it('propagates collection errors instead of inventing an empty result', async () => {
    const result = api.palettes(true);
    const assertion = expect(result).rejects.toMatchObject({ status: 401 });
    http.expectOne('/api/palettes/mine').flush({}, { status: 401, statusText: 'Unauthorized' });
    await assertion;
  });

  it('returns the saved palette from the API', async () => {
    const input = { name: 'Ocean', colors: ['#001122', '#223344', '#445566', '#667788', '#8899AA'], tags: ['blue'] };
    const result = api.save(input);
    const request = http.expectOne({ method: 'POST', url: '/api/palettes' });
    expect(request.request.body).toEqual(input);
    const palette = { ...input, _id: 'palette-1' };
    request.flush({ palette });
    expect(await result).toEqual({ palette });
  });

  it('deletes a palette by ID and accepts a response without a body', async () => {
    const result = api.delete('palette-1');
    http.expectOne({ method: 'DELETE', url: '/api/palettes/palette-1' })
      .flush(null, { status: 204, statusText: 'No Content' });
    expect(await result).toBeNull();
  });

  it('requests a reset link for the supplied email', async () => {
    const result = api.reset(user.email);
    const request = http.expectOne({ method: 'POST', url: '/api/auth/reset-password' });
    expect(request.request.body).toEqual({ email: user.email });
    request.flush({ message: 'Check your email.' });
    expect(await result).toEqual({ message: 'Check your email.' });
  });

  it('exchanges a reset token and new password for a confirmation', async () => {
    const result = api.confirmReset('reset-token', 'new-password');
    const request = http.expectOne({ method: 'POST', url: '/api/auth/confirm-reset' });
    expect(request.request.body).toEqual({ token: 'reset-token', password: 'new-password' });
    request.flush({ message: 'Password updated.' });
    expect(await result).toEqual({ message: 'Password updated.' });
  });
});

describe('errorMessage', () => {
  it('uses a server validation message', () => {
    expect(errorMessage(new HttpErrorResponse({ status: 400, error: { message: 'Choose five colors.' } })))
      .toBe('Choose five colors.');
  });

  it.each([0, 500, 503])('provides a useful fallback for network/server status %s', status => {
    expect(errorMessage(new HttpErrorResponse({ status, error: { message: 42 } })))
      .toContain('Please try again shortly.');
  });

  it('handles client errors and non-HTTP exceptions without leaking details', () => {
    expect(errorMessage(new HttpErrorResponse({ status: 403 }))).toBe('The request failed. Please try again.');
    expect(errorMessage(new Error('private internal details'))).toBe('Something went wrong. Please try again.');
    expect(errorMessage(null)).toBe('Something went wrong. Please try again.');
  });
});
