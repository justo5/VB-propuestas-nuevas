import { AfterViewInit, Component, ElementRef, OnDestroy, inject } from '@angular/core';

import { ApplicationForm } from './application-form/application-form';
import { Closing } from './closing/closing';
import { Compare } from './compare/compare';
import { Diagnosis } from './diagnosis/diagnosis';
import { Fit } from './fit/fit';
import { Footer } from './footer/footer';
import { Header } from './header/header';
import { Hero } from './hero/hero';
import { Reviews } from './reviews/reviews';
import { Stripe } from './stripe/stripe';
import { Tiers } from './tiers/tiers';

@Component({
  selector: 'app-root',
  imports: [
    Stripe,
    Header,
    Hero,
    Diagnosis,
    Tiers,
    Compare,
    Reviews,
    Fit,
    Closing,
    ApplicationForm,
    Footer,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements AfterViewInit, OnDestroy {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private revealObserver?: IntersectionObserver;

  ngAfterViewInit(): void {
    const revealEls = this.elementRef.nativeElement.querySelectorAll<HTMLElement>('.reveal');
    const prefersReducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    this.revealObserver = new IntersectionObserver(
      (entries, observer) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' },
    );

    revealEls.forEach((el) => this.revealObserver?.observe(el));
  }

  ngOnDestroy(): void {
    this.revealObserver?.disconnect();
  }
}
