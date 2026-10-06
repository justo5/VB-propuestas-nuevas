import { Component } from '@angular/core';

import { GoogleBadge } from '../google-badge/google-badge';

@Component({
  selector: 'app-hero',
  imports: [GoogleBadge],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
})
export class Hero {}
