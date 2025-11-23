import { Component, input } from '@angular/core';
import { Timeline } from '../../model/timeline';
import { HDateFormat } from '../../model/historic-date';

@Component({
	selector: 'tl-header',
	imports: [],
	templateUrl: './timeline-header.html',
	styleUrl: './timeline-header.css'
})
export class TimelineHeader {
	timeline = input<Timeline | undefined>();
	dateFormat = input.required<HDateFormat>();
}

