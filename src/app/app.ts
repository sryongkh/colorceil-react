import { Component, inject, signal } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Api, errorMessage } from './core/api';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FormsModule],
  template: `
    <a class="skip-link" href="#main">Skip to content</a>
    <header>
      <a class="logo" routerLink="/" (click)="menu.set(false)"
        >COLOR<span>ceil</span></a
      >
      <button
        class="menu-toggle"
        (click)="menu.set(!menu())"
        [attr.aria-expanded]="menu()"
        aria-controls="navigation"
      >
        Menu ☰
      </button>
      <nav id="navigation" aria-label="Main navigation" [class.open]="menu()">
        <a
          routerLink="/palettes"
          routerLinkActive="active"
          (click)="menu.set(false)"
          >Palettes</a
        >
        <a
          routerLink="/generate-palettes"
          routerLinkActive="active"
          (click)="menu.set(false)"
          >Color tools</a
        >
        <form class="nav-search" (ngSubmit)="search()" role="search">
          <label class="sr-only" for="nav-query">Search palettes</label
          ><input
            id="nav-query"
            name="query"
            [(ngModel)]="query"
            placeholder="Find your next palette…"
          /><button aria-label="Search palettes">↗</button>
        </form>
        @if (api.user()) {
          <a routerLink="/my-palettes" (click)="menu.set(false)">My palettes</a
          ><button class="account" (click)="logout()">Sign out</button>
        } @else {
          <a class="account" routerLink="/signin" (click)="menu.set(false)"
            >Sign in ↗</a
          >
        }
      </nav>
    </header>
    <div class="banner">
      A little color goes a long way.
      @if (!api.user()) {
        <a routerLink="/signup">Create your free account ↗</a>
      } @else {
        <a routerLink="/generate-palettes">Make something colorful ↗</a>
      }
    </div>
    @if (error()) {
      <p class="notice error" role="alert">{{ error() }}</p>
    }
    <main id="main" tabindex="-1">
      @if (api.demo()) {
        <p class="page-width notice" role="status">
          Explore example palettes and try the color tools. Sign-in and saving
          will be available soon.
        </p>
      }
      <router-outlet />
    </main>
    <footer>
      <a class="logo" routerLink="/">COLOR<span>ceil</span></a>
      <p>A place for your colors. Made with Angular.</p>
      <a routerLink="/generate-palettes">Create a palette ↗</a>
    </footer>
  `,
})
export class App {
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
