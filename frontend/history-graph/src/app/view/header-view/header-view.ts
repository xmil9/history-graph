import { Component, input } from '@angular/core';
import { Timeline } from '../../model/timeline';
import { HDateFormat } from '../../model/historic-date';

@Component({
	selector: 'tl-header',
	imports: [],
	templateUrl: './header-view.html',
	styleUrl: './header-view.css'
})
export class HeaderView {
	timeline = input<Timeline | undefined>();
	dateFormat = input.required<HDateFormat>();
}

