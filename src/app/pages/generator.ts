import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Api, errorMessage } from '../core/api';
import { clampChannel, hexToRgb, readableInk, rgbToHex } from '../core/color';

@Component({
  selector: 'app-generator',
  imports: [FormsModule, RouterLink],
  template: `
    <section class="page-width section generator">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Your colors, your rules</p>
          <h1>Make a little magic.</h1>
        </div>
        <button class="button" (click)="randomize()">Shuffle colors ⤨</button>
      </div>
      <p class="intro">
        Select a color, then fine-tune the RGB values. Build a palette that is
        entirely yours.
      </p>
      <div class="generator-colors">
        @for (color of colors(); track $index; let i = $index) {
          <button
            [style.background]="color"
            [style.color]="ink(color)"
            [class.selected]="selected() === i"
            [attr.aria-pressed]="selected() === i"
            (click)="select(i)"
            [attr.aria-label]="'Edit color ' + (i + 1) + ', ' + color"
          >
            <span>{{ selected() === i ? 'EDITING' : 'COLOR 0' + (i + 1) }}</span
            ><strong>{{ color }}</strong
            ><span aria-hidden="true">{{ selected() === i ? '↓' : '+' }}</span>
          </button>
        }
      </div>
      <div class="color-controls">
        <div class="hex-control">
          <label for="hex">HEX code</label
          ><input
            id="hex"
            [ngModel]="hexDraft"
            (ngModelChange)="changeHex($event)"
            maxlength="7"
            spellcheck="false"
            [attr.aria-invalid]="!!hexError()"
          />
          <p class="field-error" role="status">{{ hexError() }}</p>
        </div>
        @for (channel of channels; track channel; let i = $index) {
          <div class="channel">
            <label [for]="'channel-' + i">{{ channel }}</label
            ><input
              [id]="'channel-' + i"
              type="number"
              min="0"
              max="255"
              [ngModel]="rgb()[i]"
              (ngModelChange)="changeChannel(i, $event)"
            /><label class="sr-only" [for]="'slider-' + i"
              >{{ channel }} slider</label
            ><input
              [id]="'slider-' + i"
              type="range"
              min="0"
              max="255"
              [ngModel]="rgb()[i]"
              (ngModelChange)="changeChannel(i, $event)"
            />
          </div>
        }
      </div>
      <form class="save-panel" (ngSubmit)="save()">
        <div>
          <label for="palette-name">Palette name</label
          ><input
            id="palette-name"
            name="name"
            [(ngModel)]="name"
            maxlength="80"
            required
            placeholder="Give your colors a name"
          />
        </div>
        <div>
          <label for="palette-tags"
            >Tags <span class="muted">(optional, comma separated)</span></label
          ><input
            id="palette-tags"
            name="tags"
            [(ngModel)]="tags"
            placeholder="pastel, summer"
          />
        </div>
        <button
          class="button pink"
          [disabled]="saving() || !api.ready() || !!hexError()"
        >
          {{ saving() ? 'Saving…' : 'Save palette ↗' }}
        </button>
      </form>
      @if (api.ready() && !api.user()) {
        <p class="notice">
          <a
            routerLink="/signin"
            [queryParams]="{ returnUrl: '/generate-palettes' }"
            >Sign in</a
          >
          to save your palette. Your current colors will be kept on this device.
        </p>
      }
      @if (error()) {
        <p class="notice error" role="alert">{{ error() }}</p>
      }
      <p class="muted">
        Saved palettes are shared in the public color library.
      </p>
    </section>
  `,
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
    if (incoming?.length === 5 && incoming.every((color) => hexToRgb(color)))
      this.colors.set(incoming.map((c) => c.toUpperCase()));
    else {
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
  private remember() {
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
