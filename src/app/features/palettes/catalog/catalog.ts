import type { Palette } from '../../../core/models/palette';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Api, errorMessage } from '../../../core/services/api';
import { PaletteCard } from '../../../shared/components/palette-card/palette-card';

@Component({
  selector: 'app-catalog',
  imports: [RouterLink, FormsModule, PaletteCard],
  templateUrl: './catalog.html',
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
