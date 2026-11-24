import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Api, errorMessage } from '../../../core/services/api';
import {
  clampChannel,
  hexToRgb,
  readableInk,
  rgbToHex,
} from '../../../shared/utils/color';

@Component({
  selector: 'app-generator',
  imports: [FormsModule, RouterLink],
  templateUrl: './generator.html',
})
export class Generator {
  api = inject(Api);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  colors = signal(['#60A5FA', '#4ADE80', '#FACC15', '#FB923C', '#EF4444']);
  selected = signal(0);
  rgb = computed(() => hexToRgb(this.colors()[this.selected()])!);
  ink = readableInk;
  channels = ['Red', 'Green', 'Blue'];
  hexDraft = this.colors()[0];
  hexError = signal('');
  name = '';
  tags = '';
  saving = signal(false);
  error = signal('');
  constructor() {
    const incoming = this.route.snapshot.queryParamMap
      .get('colors')
      ?.split(',');
    if (incoming?.length === 5 && incoming.every((color) => hexToRgb(color))) {
      this.colors.set(incoming.map((c) => c.toUpperCase()));
      this.remember();
      // Consume the import so reloading restores subsequent edits, not the original colors.
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { colors: null },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    } else {
      try {
        const draft = JSON.parse(
          localStorage.getItem('colorceil-draft') ?? 'null',
        );
        if (
          Array.isArray(draft?.colors) &&
          draft.colors.length === 5 &&
          draft.colors.every(
            (c: unknown) => typeof c === 'string' && hexToRgb(c),
          )
        ) {
          this.colors.set(draft.colors);
          this.name = typeof draft.name === 'string' ? draft.name : '';
          this.tags = typeof draft.tags === 'string' ? draft.tags : '';
        }
      } catch {
        /* Storage may be disabled. */
      }
    }
    this.hexDraft = this.colors()[0];
  }
  select(index: number) {
    this.selected.set(index);
    this.hexDraft = this.colors()[index];
    this.hexError.set('');
  }
  changeHex(value: string) {
    this.hexDraft = value;
    if (!hexToRgb(value)) {
      this.hexError.set('Use six HEX digits, for example #FFB443.');
      return;
    }
    this.hexError.set('');
    this.setColor(value.toUpperCase());
  }
  changeChannel(index: number, value: number | null) {
    const rgb = [...this.rgb()];
    rgb[index] = clampChannel(Number(value));
    this.setColor(rgbToHex(rgb));
    this.hexError.set('');
  }
  private setColor(color: string) {
    this.colors.update((colors) =>
      colors.map((c, i) => (i === this.selected() ? color : c)),
    );
    this.hexDraft = color;
    this.remember();
  }
  remember() {
    try {
      localStorage.setItem(
        'colorceil-draft',
        JSON.stringify({
          colors: this.colors(),
          name: this.name,
          tags: this.tags,
        }),
      );
    } catch {
      /* Palette creation works without local storage. */
    }
  }
  randomize() {
    const values = crypto.getRandomValues(new Uint8Array(15));
    this.colors.set(
      Array.from({ length: 5 }, (_, i) =>
        rgbToHex([...values.slice(i * 3, i * 3 + 3)]),
      ),
    );
    this.select(this.selected());
    this.remember();
  }
  async save() {
    if (this.saving() || this.hexError()) return;
    this.remember();
    this.error.set('');
    if (!this.api.user()) {
      await this.router.navigate(['/signin'], {
        queryParams: { returnUrl: '/generate-palettes' },
      });
      return;
    }
    this.saving.set(true);
    try {
      await this.api.save({
        name: this.name,
        colors: this.colors(),
        tags: this.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      });
      try {
        localStorage.removeItem('colorceil-draft');
      } catch {
        /* Optional storage. */
      }
      await this.router.navigate(['/my-palettes']);
    } catch (e) {
      this.error.set(errorMessage(e));
    } finally {
      this.saving.set(false);
    }
  }
}
