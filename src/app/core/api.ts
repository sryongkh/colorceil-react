import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface User {
  id: string;
  email: string;
}
export interface Palette {
  _id: string;
  name: string;
  colors: string[];
  tags: string[];
  createdAt?: string;
}
export type PaletteInput = Pick<Palette, 'name' | 'colors' | 'tags'>;
export function errorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse)
    return (
      (typeof error.error?.message === 'string' ? error.error.message : null) ??
      (error.status === 0 || error.status >= 500
        ? 'Your colors are taking a little longer to load. Please try again shortly.'
        : 'The request failed. Please try again.')
    );
  return 'Something went wrong. Please try again.';
}
@Injectable({ providedIn: 'root' })
export class Api {
  private http = inject(HttpClient);
  user = signal<User | null>(null);
  demo = signal(false);
  ready = signal(false);
  private sessionRequest?: Promise<void>;
  restoreSession(): Promise<void> {
    return (this.sessionRequest ??= firstValueFrom(
      this.http.get<{ user: User }>('/api/auth/me'),
    )
      .then(({ user }) => {
        this.user.set(user);
      })
      .catch(() => {
        this.user.set(null);
      })
      .finally(() => this.ready.set(true)));
  }
  async authenticate(
    mode: 'login' | 'register',
    email: string,
    password: string,
  ) {
    const { user } = await firstValueFrom(
      this.http.post<{ user: User }>(`/api/auth/${mode}`, { email, password }),
    );
    this.user.set(user);
  }
  async logout() {
    await firstValueFrom(this.http.post('/api/auth/logout', {}));
    this.user.set(null);
  }
  palettes(mine = false) {
    return firstValueFrom(
      this.http.get<{ palettes: Palette[]; demo?: boolean }>(
        `/api/palettes${mine ? '/mine' : ''}`,
      ),
    ).then((result) => {
      this.demo.set(result.demo === true);
      return result;
    });
  }
  save(palette: PaletteInput) {
    return firstValueFrom(
      this.http.post<{ palette: Palette }>('/api/palettes', palette),
    );
  }
  delete(id: string) {
    return firstValueFrom(this.http.delete(`/api/palettes/${id}`));
  }
  reset(email: string) {
    return firstValueFrom(
      this.http.post<{ message: string }>('/api/auth/reset-password', {
        email,
      }),
    );
  }
  confirmReset(token: string, password: string) {
    return firstValueFrom(
      this.http.post<{ message: string }>('/api/auth/confirm-reset', {
        token,
        password,
      }),
    );
  }
}
