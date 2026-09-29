import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, inject, signal } from '@angular/core';
import {
  COMPARE,
  GOOGLE_RATING,
  GOOGLE_REVIEW_COUNT,
  NO_LIST,
  PROBLEMS,
  TESTIMONIALS_ROW_A,
  TESTIMONIALS_ROW_B,
  TIERS,
  YES_LIST,
} from './landing-data';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements AfterViewInit, OnDestroy {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private revealObserver?: IntersectionObserver;

  protected readonly problems = PROBLEMS;
  protected readonly tiers = TIERS;
  protected readonly compare = COMPARE;
  protected readonly yes = YES_LIST;
  protected readonly no = NO_LIST;

  protected readonly googleRating = GOOGLE_RATING;
  protected readonly googleReviewCount = GOOGLE_REVIEW_COUNT;
  protected readonly testimonialsRowA = TESTIMONIALS_ROW_A;
  protected readonly testimonialsRowB = TESTIMONIALS_ROW_B;

  protected readonly currentYear = new Date().getFullYear();
  protected readonly mobileMenuOpen = signal(false);
  protected readonly scrolled = signal(false);

  @HostListener('window:scroll')
  protected onWindowScroll(): void {
    this.scrolled.set(window.scrollY > 8);
  }

  protected toggleMenu(): void {
    this.mobileMenuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  protected pad2(n: number): string {
    return String(n).padStart(2, '0');
  }

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
