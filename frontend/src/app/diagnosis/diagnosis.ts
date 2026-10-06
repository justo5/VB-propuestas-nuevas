import { Component } from '@angular/core';

import { PROBLEMS } from '../landing-data';

@Component({
  selector: 'app-diagnosis',
  templateUrl: './diagnosis.html',
  styleUrl: './diagnosis.scss',
})
export class Diagnosis {
  protected readonly problems = PROBLEMS;

  protected pad2(n: number): string {
    return String(n).padStart(2, '0');
  }
}
