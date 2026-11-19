import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Api } from './core/api';

export const routes: Routes = [
  {
    path: '',
    title: 'Color Palettes & Color Combinations | COLORceil',
    data: {
      description:
        'Discover inspiring color palettes for branding, websites, and creative projects. Explore color combinations by mood and create your own palette with COLORceil.',
    },
    loadComponent: () => import('./pages/home').then((m) => m.Home),
  },
  {
    path: 'palettes',
    title: 'Explore Color Palettes for Design Inspiration | COLORceil',
    data: {
      description:
        'Find color palettes for your next design. Browse pastel, warm, bright, and nature-inspired color combinations, then customize your favorite shades.',
    },
    loadComponent: () => import('./pages/catalog').then((m) => m.Catalog),
  },
  {
    path: 'search-palettes',
    title: 'Find Color Palettes by Mood or Color | COLORceil',
    data: {
      description:
        'Search color palettes by name, mood, or color code. Find matching shades and fresh color combinations for your next creative project.',
      robots: 'noindex,follow',
    },
    loadComponent: () => import('./pages/catalog').then((m) => m.Catalog),
  },
  {
    path: 'my-palettes',
    title: 'Your Saved Color Palettes | COLORceil',
    data: {
      description:
        'Keep your favorite color palettes in one place and return to the color combinations that inspire your next design.',
      robots: 'noindex,follow',
    },
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
    title: 'Free Color Palette Creator for Your Designs | COLORceil',
    data: {
      description:
        'Create a custom five-color palette for your brand, website, or creative project. Adjust each shade, explore new combinations, and copy your color codes.',
    },
    loadComponent: () => import('./pages/generator').then((m) => m.Generator),
  },
  ...['signin', 'signup', 'forgotpassword', 'reset-password'].map((path) => ({
    path,
    title: `${path === 'signup' ? 'Sign up' : path === 'signin' ? 'Sign in' : 'Reset password'} — COLORceil`,
    data: {
      description:
        'Your next great color combination starts here. Join COLORceil to keep your favorite palettes together.',
      robots: 'noindex,follow',
    },
    loadComponent: () => import('./pages/auth').then((m) => m.Auth),
  })),
  {
    path: '**',
    title: 'Page Not Found | COLORceil',
    data: {
      description:
        'Explore inspiring color palettes and create a color combination for your next design with COLORceil.',
      robots: 'noindex,follow',
    },
    loadComponent: () => import('./pages/not-found').then((m) => m.NotFound),
  },
];
