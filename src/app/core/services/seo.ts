import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class Seo {
  private meta = inject(Meta);
  private document = inject(DOCUMENT);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        let route = this.route;
        while (route.firstChild) route = route.firstChild;
        const { description, robots = 'index,follow' } = route.snapshot.data;
        const title =
          route.snapshot.title ??
          'Color Palettes & Color Combinations | COLORceil';
        const url = `https://colorceil-react.vercel.app${this.router.url.split(/[?#]/)[0]}`;
        this.meta.updateTag({ name: 'description', content: description });
        this.meta.updateTag({ name: 'robots', content: robots });
        this.meta.updateTag({ property: 'og:title', content: title });
        this.meta.updateTag({
          property: 'og:description',
          content: description,
        });
        this.meta.updateTag({ property: 'og:url', content: url });
        this.meta.updateTag({ name: 'twitter:title', content: title });
        this.meta.updateTag({
          name: 'twitter:description',
          content: description,
        });
        this.document
          .querySelector<HTMLLinkElement>('link[rel="canonical"]')
          ?.setAttribute('href', url);
      });
  }
}
