import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Api, errorMessage } from '../core/api';

@Component({
  selector: 'app-auth',
  imports: [FormsModule, RouterLink],
  template: `
    <section class="auth-section">
      <div class="auth-card">
        <p class="eyebrow">A home for your colors</p>
        <h1>{{ title }}</h1>
        <p>{{ description }}</p>
        <form #form="ngForm" (ngSubmit)="submit(form)">
          @if (mode !== 'reset-password') {
            <label for="email">Email</label
            ><input
              id="email"
              name="email"
              type="email"
              [(ngModel)]="email"
              required
              email
              autocomplete="email"
              placeholder="you@example.com"
            />
          }
          @if (mode !== 'forgotpassword') {
            <label for="password">Password</label
            ><input
              id="password"
              name="password"
              type="password"
              [(ngModel)]="password"
              required
              [minlength]="mode === 'signin' ? 1 : 8"
              maxlength="72"
              [attr.autocomplete]="
                mode === 'signin' ? 'current-password' : 'new-password'
              "
            />
            @if (mode !== 'signin') {
              <p class="hint">At least 8 characters, up to 72 UTF-8 bytes.</p>
            }
          }
          @if (mode === 'signup' || mode === 'reset-password') {
            <label for="confirm-password">Confirm password</label
            ><input
              id="confirm-password"
              name="confirmPassword"
              type="password"
              [(ngModel)]="confirmPassword"
              required
              autocomplete="new-password"
            />
          }
          @if (error()) {
            <p class="notice error" role="alert">{{ error() }}</p>
          }
          @if (message()) {
            <p class="notice success" role="status">{{ message() }}</p>
          }
          <button
            class="button blue full-width"
            [disabled]="busy() || completed()"
          >
            {{ busy() ? 'One moment…' : buttonLabel }}
          </button>
        </form>
        <div class="auth-links">
          @if (mode === 'signin') {
            <a routerLink="/forgotpassword">Forgot password?</a>
            <p>
              Don't have an account?
              <a routerLink="/signup" [queryParams]="returnParams">Sign up ↗</a>
            </p>
          } @else {
            <a routerLink="/signin" [queryParams]="returnParams"
              >Back to sign in ↗</a
            >
          }
        </div>
      </div>
      <div class="auth-art" aria-hidden="true">
        <div>GOOD<br />COLORS.<br />GREAT<br />IDEAS.<span>✳</span></div>
        <p>Make something that feels like you.</p>
      </div>
    </section>
  `,
})
export class Auth {
  private api = inject(Api);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  mode = this.route.snapshot.routeConfig?.path ?? 'signin';
  email = '';
  password = '';
  confirmPassword = '';
  busy = signal(false);
  completed = signal(false);
  error = signal('');
  message = signal('');
  get title() {
    return this.mode === 'signup'
      ? 'Join the colorful side.'
      : this.mode === 'signin'
        ? 'Welcome back.'
        : this.mode === 'reset-password'
          ? 'A fresh start.'
          : 'Forgot your password?';
  }
  get description() {
    return this.mode === 'forgotpassword'
      ? 'Enter your email and we will send you a reset link.'
      : this.mode === 'reset-password'
        ? 'Choose a new password for your account.'
        : 'Keep your favorite color combinations together for your brand, website, and creative projects.';
  }
  get buttonLabel() {
    return this.mode === 'signin'
      ? 'Sign in ↗'
      : this.mode === 'signup'
        ? 'Create account ↗'
        : this.mode === 'forgotpassword'
          ? 'Send reset link ↗'
          : 'Update password ↗';
  }
  get returnParams() {
    return { returnUrl: this.safeReturnUrl() };
  }
  private safeReturnUrl() {
    const url = this.route.snapshot.queryParamMap.get('returnUrl');
    return url === '/generate-palettes' || url === '/my-palettes'
      ? url
      : '/my-palettes';
  }
  async submit(form: NgForm) {
    if (this.busy()) return;
    this.error.set('');
    this.message.set('');
    if (form.invalid) {
      this.error.set(
        'Please complete all fields with a valid email and password.',
      );
      return;
    }
    if (
      (this.mode === 'signup' || this.mode === 'reset-password') &&
      this.password !== this.confirmPassword
    ) {
      this.error.set('Passwords do not match.');
      return;
    }
    this.busy.set(true);
    try {
      if (this.mode === 'forgotpassword') {
        this.message.set((await this.api.reset(this.email)).message);
        this.completed.set(true);
      } else if (this.mode === 'reset-password') {
        this.message.set(
          (
            await this.api.confirmReset(
              this.route.snapshot.queryParamMap.get('token') ?? '',
              this.password,
            )
          ).message,
        );
        this.completed.set(true);
      } else {
        await this.api.authenticate(
          this.mode === 'signup' ? 'register' : 'login',
          this.email,
          this.password,
        );
        await this.router.navigateByUrl(this.safeReturnUrl());
      }
    } catch (e) {
      this.error.set(errorMessage(e));
    } finally {
      this.busy.set(false);
    }
  }
}
