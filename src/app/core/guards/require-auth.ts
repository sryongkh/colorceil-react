import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Api } from '../services/api';

export const requireAuth: CanActivateFn = async () => {
  const api = inject(Api);
  const router = inject(Router);
  await api.restoreSession();
  return api.user()
    ? true
    : router.createUrlTree(['/signin'], {
        queryParams: { returnUrl: '/my-palettes' },
      });
};
