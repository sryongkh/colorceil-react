import { Component, inject, signal } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Api, errorMessage } from './core/services/api';
import { Seo } from './core/services/seo';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './app.html',
})
export class App {
  private seo = inject(Seo);
  api = inject(Api);
  router = inject(Router);
  menu = signal(false);
  error = signal('');
  query = '';
  constructor() {
    void this.api.restoreSession();
  }
  search() {
    void this.router.navigate(['/search-palettes'], {
      queryParams: { q: this.query.trim() },
    });
    this.menu.set(false);
  }
  async logout() {
    try {
      await this.api.logout();
      this.menu.set(false);
      await this.router.navigate(['/']);
    } catch (e) {
      this.error.set(errorMessage(e));
    }
  }
}
