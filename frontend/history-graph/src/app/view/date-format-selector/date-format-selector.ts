import { Component, inject } from '@angular/core';
import { PreferenceService } from '../../services/preference.service';

@Component({
  selector: 'date-format-selector',
  templateUrl: './date-format-selector.html',
  styleUrl: './date-format-selector.css'
})
export class DateFormatSelector {
  private preferenceService = inject(PreferenceService);

  allDateFormats = this.preferenceService.allDateFormats;
  
  isActive(formatName: string): boolean {
    return this.preferenceService.dateFormat().name === formatName;
  }

  onFormatChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.preferenceService.setDateFormat(select.value);
  }
}
