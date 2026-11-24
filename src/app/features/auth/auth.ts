import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Api, errorMessage } from '../../core/services/api';

@Component({
  selector: 'app-auth',
  imports: [FormsModule, RouterLink],
  templateUrl: './auth.html',
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
