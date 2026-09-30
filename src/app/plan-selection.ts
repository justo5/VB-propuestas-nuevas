import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PlanSelection {
  readonly selected = signal<string | null>(null);

  select(plan: string): void {
    this.selected.set(plan);
  }
}
