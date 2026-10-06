import { Component } from '@angular/core';

import { NO_LIST, YES_LIST } from '../landing-data';

@Component({
  selector: 'app-fit',
  templateUrl: './fit.html',
  styleUrl: './fit.scss',
})
export class Fit {
  protected readonly yes = YES_LIST;
  protected readonly no = NO_LIST;
}
