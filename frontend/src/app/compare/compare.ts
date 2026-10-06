import { Component } from '@angular/core';

import { COMPARE } from '../landing-data';

@Component({
  selector: 'app-compare',
  templateUrl: './compare.html',
  styleUrl: './compare.scss',
})
export class Compare {
  protected readonly compare = COMPARE;
}
