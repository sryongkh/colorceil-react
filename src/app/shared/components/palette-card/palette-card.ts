import type { Palette } from '../../../core/models/palette';
import { Component, input, signal, viewChild, ElementRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { readableInk } from '../../utils/color';

@Component({
  selector: 'app-palette-card',
  imports: [RouterLink],
  templateUrl: './palette-card.html',
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
