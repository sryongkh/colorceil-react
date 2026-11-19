import { Component, input, signal, viewChild, ElementRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Palette } from '../core/api';
import { readableInk } from '../core/color';

@Component({
  selector: 'app-palette-card',
  imports: [RouterLink],
  template: `
    <button
      class="palette-card"
      (click)="open()"
      [attr.aria-label]="'View ' + palette().name"
    >
      <span class="card-colors">
        @for (color of palette().colors; track $index) {
          <span [style.background]="color"></span>
        }
      </span>
      <span class="card-info"
        ><strong>{{ palette().name }}</strong
        ><span aria-hidden="true">↗</span></span
      >
    </button>
    <dialog
      #dialog
      (click)="backdrop($event)"
      (close)="status.set('')"
      aria-labelledby="palette-title-{{ palette()._id }}"
    >
      <div class="dialog-heading">
        <div>
          <p class="eyebrow">A little inspiration</p>
          <h2 id="palette-title-{{ palette()._id }}">{{ palette().name }}</h2>
        </div>
        <button
          class="icon-button"
          (click)="dialog.close()"
          aria-label="Close palette"
        >
          ×
        </button>
      </div>
      <div class="detail-colors">
        @for (color of palette().colors; track $index) {
          <button
            [style.background]="color"
            [style.color]="ink(color)"
            (click)="copy(color)"
            [attr.aria-label]="'Copy ' + color"
          >
            {{ color }}
          </button>
        }
      </div>
      <p>Click a color to copy its HEX code.</p>
      <div class="tags">
        @for (tag of palette().tags; track tag) {
          <a
            routerLink="/search-palettes"
            [queryParams]="{ q: tag }"
            (click)="dialog.close()"
            >#{{ tag }}</a
          >
        }
      </div>
      <div class="actions">
        <button class="button" (click)="copy(palette().colors.join(', '))">
          Copy palette</button
        ><a
          class="button pink"
          routerLink="/generate-palettes"
          [queryParams]="{ colors: palette().colors.join(',') }"
          (click)="dialog.close()"
          >Customize ↗</a
        >
      </div>
      <p role="status">{{ status() }}</p>
    </dialog>
  `,
})
export class PaletteCard {
  palette = input.required<Palette>();
  dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  status = signal('');
  ink = readableInk;
  open() {
    this.dialog().nativeElement.showModal();
  }
  backdrop(event: MouseEvent) {
    if (event.target === this.dialog().nativeElement) {
      const box = this.dialog().nativeElement.getBoundingClientRect();
      if (
        event.clientX < box.left ||
        event.clientX > box.right ||
        event.clientY < box.top ||
        event.clientY > box.bottom
      )
        this.dialog().nativeElement.close();
    }
  }
  async copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      this.status.set('Copied to clipboard.');
    } catch {
      this.status.set('Copy unavailable. Select and copy the HEX codes above.');
    }
  }
}
