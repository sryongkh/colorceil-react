import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Api, Palette, errorMessage } from '../core/api';
import { PaletteCard } from '../shared/palette-card';

@Component({
  selector: 'app-catalog',
  imports: [RouterLink, FormsModule, PaletteCard],
  template: `
    <section class="page-width section catalog">
      <p class="eyebrow">The color library</p>
      <h1>
        {{
          mine
            ? 'Your colors, all together.'
            : 'Color palettes for your next design.'
        }}
      </h1>
      <p class="intro">
        {{
          mine
            ? 'A collection of palettes you have saved. Your saved palettes are also shared in the public color library.'
            : 'Discover color combinations for branding, websites, and illustrations. Find your palette by name, mood, or color code.'
        }}
      </p>
      <div class="catalog-toolbar">
        <form class="search-field" (ngSubmit)="search()" role="search">
          <label class="sr-only" for="catalog-query">Search collection</label
          ><input
            id="catalog-query"
            name="q"
            [(ngModel)]="query"
            placeholder="Try pastel, sunset, or #60A5FA"
          /><button aria-label="Search collection">Search ↗</button>
        </form>
        <a class="button pink" routerLink="/generate-palettes"
          >Create palette +</a
        >
      </div>
      <div class="results-toolbar">
        <p>
          {{ filtered().length }} palettes
          @if (term()) {
            matching “{{ term() }}”
          }
        </p>
        <label
          >Sort by
          <select [ngModel]="sort()" (ngModelChange)="sort.set($event)">
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="name">Name A–Z</option>
          </select></label
        >
      </div>
      @if (error()) {
        <div class="notice error" role="alert">
          {{ error() }} <button (click)="load()">Try again</button>
        </div>
      }
      @if (loading()) {
        <p class="notice" role="status">Loading your colors…</p>
      } @else if (!error() && !filtered().length) {
        <div class="empty">
          <h2>
            {{
              mine
                ? 'Your palette collection starts here.'
                : 'No palettes found.'
            }}
          </h2>
          <p>
            {{
              mine
                ? 'Create a palette and save your first set of colors.'
                : 'Try a different name, mood, or HEX code.'
            }}
          </p>
          <a class="button" routerLink="/generate-palettes"
            >Create a palette ↗</a
          >
        </div>
      }
      <div class="palette-grid">
        @for (palette of filtered(); track palette._id) {
          <div>
            <app-palette-card [palette]="palette" />
            @if (mine) {
              <button
                class="delete-button"
                (click)="delete(palette)"
                [disabled]="deleting() === palette._id"
              >
                {{
                  deleting() === palette._id
                    ? 'Deleting…'
                    : 'Delete ' + palette.name
                }}
              </button>
            }
          </div>
        }
      </div>
    </section>
  `,
})
export class Catalog {
  private api = inject(Api);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  mine = this.route.snapshot.routeConfig?.path === 'my-palettes';
  query = '';
  term = signal('');
  sort = signal('newest');
  palettes = signal<Palette[]>([]);
  loading = signal(true);
  error = signal('');
  deleting = signal('');
  filtered = computed(() => {
    const term = this.term().trim().toLowerCase();
    const result = this.palettes().filter((p) =>
      `${p.name} ${p.colors.join(' ')} ${p.tags.join(' ')}`
        .toLowerCase()
        .includes(term.replace(/^#(?![0-9a-f]{6}$)/i, '')),
    );
    return [...result].sort((a, b) =>
      this.sort() === 'name'
        ? a.name.localeCompare(b.name)
        : this.sort() === 'oldest'
          ? (a.createdAt ?? '').localeCompare(b.createdAt ?? '')
          : (b.createdAt ?? '').localeCompare(a.createdAt ?? ''),
    );
  });
  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((p) => {
      this.query = p.get('q') ?? '';
      this.term.set(this.query);
    });
    void this.load();
  }
  search() {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: this.query.trim() || null },
    });
  }
  async load() {
    this.loading.set(true);
    this.error.set('');
    try {
      this.palettes.set((await this.api.palettes(this.mine)).palettes);
    } catch (e) {
      this.error.set(errorMessage(e));
    } finally {
      this.loading.set(false);
    }
  }
  async delete(palette: Palette) {
    if (!confirm(`Delete “${palette.name}”?`)) return;
    this.deleting.set(palette._id);
    try {
      await this.api.delete(palette._id);
      this.palettes.update((p) => p.filter((x) => x._id !== palette._id));
    } catch (e) {
      this.error.set(errorMessage(e));
    } finally {
      this.deleting.set('');
    }
  }
}
