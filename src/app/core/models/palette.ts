export interface Palette {
  _id: string;
  name: string;
  colors: string[];
  tags: string[];
  createdAt?: string;
}

export type PaletteInput = Pick<Palette, 'name' | 'colors' | 'tags'>;
