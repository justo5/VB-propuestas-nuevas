import { Component, input } from '@angular/core';

import { GOOGLE_RATING, GOOGLE_REVIEW_COUNT } from '../landing-data';

@Component({
  selector: 'app-google-badge',
  templateUrl: './google-badge.html',
  styleUrl: './google-badge.scss',
})
export class GoogleBadge {
  readonly suffix = input('reseñas en Google');
  readonly showPlus = input(true);
  readonly dark = input(false);
  readonly inline = input(false);

  protected readonly rating = GOOGLE_RATING;
  protected readonly reviewCount = GOOGLE_REVIEW_COUNT;
}
