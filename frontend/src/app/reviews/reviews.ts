import { Component } from '@angular/core';

import { GoogleBadge } from '../google-badge/google-badge';
import { GOOGLE_REVIEW_COUNT, TESTIMONIALS_ROW_A, TESTIMONIALS_ROW_B } from '../landing-data';

@Component({
  selector: 'app-reviews',
  imports: [GoogleBadge],
  templateUrl: './reviews.html',
  styleUrl: './reviews.scss',
})
export class Reviews {
  protected readonly googleReviewCount = GOOGLE_REVIEW_COUNT;
  protected readonly testimonialsRowA = TESTIMONIALS_ROW_A;
  protected readonly testimonialsRowB = TESTIMONIALS_ROW_B;
}
