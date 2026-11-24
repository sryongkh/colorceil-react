import type { Palette } from '../../core/models/palette';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Api } from '../../core/services/api';
import { PaletteCard } from '../../shared/components/palette-card/palette-card';
import examples from '../../../data/example-palettes.json';

@Component({
  selector: 'app-home',
  imports: [RouterLink, PaletteCard],
  templateUrl: './home.html',
})
export class Home {
  private api = inject(Api);
  offline = signal(false);
  palettes = signal<Palette[]>(
    examples.map((p, i) => ({ ...p, _id: `example-${i}` })),
  );
  rainbow = examples[0].colors;
  collections = [
    { tag: 'pastel', image: '/assets/image_1.png' },
    { tag: 'bright', image: '/assets/image_2.png' },
    { tag: 'nature', image: '/assets/image_3.png' },
  ];
  tags = ['pastel', 'sunset', 'nature', 'ocean', 'bright', 'purple'];
  constructor() {
    this.api
      .palettes()
      .then(({ palettes }) => this.palettes.set(palettes.slice(0, 9)))
      .catch(() => this.offline.set(true));
  }
}
