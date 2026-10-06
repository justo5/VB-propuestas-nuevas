import { Component } from '@angular/core';

import { GoogleBadge } from '../google-badge/google-badge';

@Component({
  selector: 'app-footer',
  imports: [GoogleBadge],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  protected readonly currentYear = new Date().getFullYear();
}
