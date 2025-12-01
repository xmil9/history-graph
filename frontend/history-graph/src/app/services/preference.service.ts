import { Injectable, signal } from '@angular/core';
import { MDYYYYFormat, MMMDYYYYFormat } from '../model/historic-date';
import { LabeledDateFormat } from './preference-types';

@Injectable({
  providedIn: 'root'
})
export class PreferenceService {
  allDateFormats: LabeledDateFormat[] = [
    { name: 'M-D-YYYY', format: new MDYYYYFormat('-') },
    { name: 'M/D/YYYY', format: new MDYYYYFormat('/') },
    { name: 'M.D.YYYY', format: new MDYYYYFormat('.') },
    { name: 'MMM D YYYY', format: new MMMDYYYYFormat() },
  ];
  dateFormat = signal<LabeledDateFormat>(this.allDateFormats[0]);

  setDateFormat(formatName: string) {
    this.dateFormat.set(this.allDateFormats.find(f => f.name === formatName)!);
  }
}
