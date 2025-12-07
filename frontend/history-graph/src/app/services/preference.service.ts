import { inject, Injectable, signal } from '@angular/core';
import { MDYYYYFormat, MMMDYYYYFormat } from '../model/historic-date';
import { LabeledDateFormat, LayoutFormat } from './preference-types';
import { EventLayoutService } from './event-layout.service';
import { AxisLayoutService } from './axis-layout.service';

@Injectable({
	providedIn: 'root'
})
export class PreferenceService {
	private layoutService = inject(EventLayoutService);
	private axisLayoutService = inject(AxisLayoutService);

	// Date format
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

	// Layout
	layoutFormat = signal<LayoutFormat>(LayoutFormat.HorizontalCenter);

	setLayoutFormat(format: LayoutFormat) {
		this.layoutFormat.set(format);
		this.layoutService.setLabelLayoutFormat(format);
		this.axisLayoutService.setLayoutFormat(format);
	}
}
