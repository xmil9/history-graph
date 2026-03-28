import { inject, Injectable, signal } from '@angular/core';
import { MDYYYYFormat, DEFAULT_DATE_FORMAT } from '../model/historic-date';
import { LabeledDateFormat, LayoutFormat } from './preference-types';
import { LayoutService } from './layout.service';
import { TickFormat } from './tick-calculator';

@Injectable({
	providedIn: 'root'
})
export class PreferenceService {
	private layoutService = inject(LayoutService);

	// Date format
	allDateFormats: LabeledDateFormat[] = [
		{ name: 'M-D-YYYY', format: new MDYYYYFormat('-') },
		{ name: 'M/D/YYYY', format: new MDYYYYFormat('/') },
		{ name: 'M.D.YYYY', format: new MDYYYYFormat('.') },
		{ name: 'MMM D YYYY', format: DEFAULT_DATE_FORMAT },
	];
	dateFormat = signal<LabeledDateFormat>(this.allDateFormats[3]);

	setDateFormat(formatName: string) {
		this.dateFormat.set(this.allDateFormats.find(f => f.name === formatName)!);
	}

	// Layout
	allLayoutOptions = [
		{ value: LayoutFormat.HorizontalCenter, label: 'Horizontal' },
		{ value: LayoutFormat.HorizontalLeft, label: 'Horizontal Left' },
		{ value: LayoutFormat.Vertical, label: 'Vertical' },
		{ value: LayoutFormat.None, label: 'None' },
	];

	layoutFormat = signal<LayoutFormat>(LayoutFormat.HorizontalCenter);

	setLayoutFormat(format: LayoutFormat) {
		this.layoutFormat.set(format);
		this.layoutService.setLayoutFormat(format);
	}

	// Tick format
	allTickFormats = [
		{ value: TickFormat.DynamicEpoch, label: 'Dynamic Epoch' },
		{ value: TickFormat.TimelineEpoch, label: 'Timeline Epoch' },
		{ value: TickFormat.FixedNumber, label: 'Fixed Number' },
	];

	tickFormat = signal<TickFormat>(TickFormat.DynamicEpoch);

	setTickFormat(format: TickFormat) {
		this.tickFormat.set(format);
		this.layoutService.setTickFormat(format);
	}
}
