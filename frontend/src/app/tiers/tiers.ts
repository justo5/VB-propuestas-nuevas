import { Component, inject } from '@angular/core';

import { TIERS } from '../landing-data';
import { PlanSelection } from '../plan-selection';

@Component({
  selector: 'app-tiers',
  templateUrl: './tiers.html',
  styleUrl: './tiers.scss',
})
export class Tiers {
  private readonly planSelection = inject(PlanSelection);

  protected readonly tiers = TIERS;

  protected selectPlan(name: string): void {
    this.planSelection.select(name);
  }
}
