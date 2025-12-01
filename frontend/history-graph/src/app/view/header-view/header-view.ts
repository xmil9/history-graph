import { Component, input } from '@angular/core';
import { Timeline } from '../../model/timeline';
import { HDateFormat } from '../../model/historic-date';

import { DateFormatSelector } from '../date-format-selector/date-format-selector';

@Component({
	selector: 'tl-header',
	imports: [DateFormatSelector],
	templateUrl: './header-view.html',
	styleUrl: './header-view.css'
})
export class HeaderView {
	timeline = input<Timeline | undefined>();
	dateFormat = input.required<HDateFormat>();
}

