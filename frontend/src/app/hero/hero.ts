import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';

import { GoogleBadge } from '../google-badge/google-badge';

interface CasoExito {
  src: string;
  poster: string;
}

const SWIPE_THRESHOLD_PX = 40;

@Component({
  selector: 'app-hero',
  imports: [GoogleBadge],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
})
export class Hero implements AfterViewInit, OnDestroy {
  private readonly viewport = viewChild.required<ElementRef<HTMLElement>>('viewport');
  private readonly cards = viewChildren<ElementRef<HTMLElement>>('card');
  private readonly casoVideos = viewChildren<ElementRef<HTMLVideoElement>>('casoVideo');

  protected readonly casos: CasoExito[] = [
    'Da0jX6xhDG0',
    'Daykm-YpR3n',
    'DbYmfBPhZVE',
    'DbwpZpdhVtI',
  ].map((id) => ({ src: `/casos/caso-${id}.mp4`, poster: `/casos/caso-${id}.jpg` }));

  protected readonly activeCaso = signal(0);
  protected readonly playingCaso = signal(-1);
  protected readonly trackOffset = signal(0);

  private readonly reducedMotion =
    typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  private inView = false;
  private touchStartX: number | null = null;
  private intersectionObserver?: IntersectionObserver;
  private resizeObserver?: ResizeObserver;

  ngAfterViewInit(): void {
    const viewport = this.viewport().nativeElement;

    // Only autoplay while the carousel is on screen, so the videos don't download/decode in the background.
    this.intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        this.inView = entry.isIntersecting;
        if (this.inView) {
          this.playActiveCasoMuted();
        } else {
          this.pauseAllCasoVideos(false);
        }
      },
      { threshold: 0.25 },
    );
    this.intersectionObserver.observe(viewport);

    this.resizeObserver = new ResizeObserver(() => this.updateTrackOffset());
    this.resizeObserver.observe(viewport);

    requestAnimationFrame(() => this.updateTrackOffset());
  }

  ngOnDestroy(): void {
    this.intersectionObserver?.disconnect();
    this.resizeObserver?.disconnect();
  }

  protected prevCaso(): void {
    this.goToCaso((this.activeCaso() - 1 + this.casos.length) % this.casos.length);
  }

  protected nextCaso(): void {
    this.goToCaso((this.activeCaso() + 1) % this.casos.length);
  }

  protected goToCaso(index: number): void {
    if (index === this.activeCaso()) return;
    this.pauseAllCasoVideos(true);
    this.activeCaso.set(index);
    queueMicrotask(() => {
      this.updateTrackOffset();
      this.playActiveCasoMuted();
    });
  }

  protected toggleCasoAudio(index: number, event: Event): void {
    event.stopPropagation();
    if (index !== this.activeCaso()) {
      this.goToCaso(index);
      return;
    }
    const video = this.casoVideos()[index]?.nativeElement;
    if (!video) return;
    if (this.playingCaso() === index) {
      video.muted = true;
      this.playingCaso.set(-1);
      return;
    }
    // First unmute restarts the testimonial so the viewer hears it from the beginning.
    video.currentTime = 0;
    video.muted = false;
    video
      .play()
      .then(() => this.playingCaso.set(index))
      .catch(() => {
        video.muted = true;
      });
  }

  protected onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.touches[0]?.clientX ?? null;
  }

  protected onTouchEnd(event: TouchEvent): void {
    if (this.touchStartX === null) return;
    const deltaX = (event.changedTouches[0]?.clientX ?? this.touchStartX) - this.touchStartX;
    this.touchStartX = null;
    if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX) return;
    if (deltaX < 0) {
      this.nextCaso();
    } else {
      this.prevCaso();
    }
  }

  private updateTrackOffset(): void {
    const card = this.cards()[this.activeCaso()]?.nativeElement;
    if (!card) return;
    const viewportWidth = this.viewport().nativeElement.clientWidth;
    this.trackOffset.set(viewportWidth / 2 - card.offsetLeft - card.offsetWidth / 2);
  }

  private playActiveCasoMuted(): void {
    if (!this.inView || this.reducedMotion) return;
    const video = this.casoVideos()[this.activeCaso()]?.nativeElement;
    if (!video) return;
    video.muted = true;
    video.play().catch(() => { });
  }

  private pauseAllCasoVideos(rewind: boolean): void {
    this.casoVideos().forEach(({ nativeElement: video }) => {
      video.pause();
      video.muted = true;
      if (rewind) video.currentTime = 0;
    });
    this.playingCaso.set(-1);
  }
}
