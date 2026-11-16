import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Api } from './core/api';

export const routes: Routes = [
  {
    path: '',
    title: 'COLORceil — Find your colors',
    loadComponent: () => import('./pages/home').then((m) => m.Home),
  },
  {
    path: 'palettes',
    title: 'Explore palettes — COLORceil',
    loadComponent: () => import('./pages/catalog').then((m) => m.Catalog),
  },
  {
    path: 'search-palettes',
    title: 'Search palettes — COLORceil',
    loadComponent: () => import('./pages/catalog').then((m) => m.Catalog),
  },
  {
    path: 'my-palettes',
    title: 'My palettes — COLORceil',
    canActivate: [
      async () => {
        const api = inject(Api);
        const router = inject(Router);
        await api.restoreSession();
        return api.user()
          ? true
          : router.createUrlTree(['/signin'], {
              queryParams: { returnUrl: '/my-palettes' },
            });
      },
    ],
    loadComponent: () => import('./pages/catalog').then((m) => m.Catalog),
  },
  {
    path: 'generate-palettes',
    title: 'Create a palette — COLORceil',
    loadComponent: () => import('./pages/generator').then((m) => m.Generator),
  },
  ...['signin', 'signup', 'forgotpassword', 'reset-password'].map((path) => ({
    path,
    title: `${path === 'signup' ? 'Sign up' : path === 'signin' ? 'Sign in' : 'Reset password'} — COLORceil`,
    loadComponent: () => import('./pages/auth').then((m) => m.Auth),
  })),
  {
    path: '**',
    title: 'Page not found — COLORceil',
    loadComponent: () => import('./pages/not-found').then((m) => m.NotFound),
  },
];
