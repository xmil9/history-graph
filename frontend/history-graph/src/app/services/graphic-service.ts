import { Injectable } from '@angular/core';
import { Timeline } from '../model/timeline';
import { EventGraphic, TimelineGraphic, TimelineTheme } from './graphic-types';
import { HEvent } from '../model/historic-event';

@Injectable({
	providedIn: 'root'
})
export class GraphicService {
	private colors = [
		'rgb(20, 54, 108)',
		'rgb(108, 20, 20)',
		'rgb(20, 108, 20)',
		'rgb(108, 20, 108)',
		'rgb(20, 108, 108)',
		'rgb(108, 108, 20)',
		'rgb(20, 20, 108)',
		'rgb(108, 20, 20)',
	];
	private nextColorIndex = 0;

	decorateTimeline(timeline: Timeline): TimelineGraphic {
		const theme = this.nextTheme();
		return new TimelineGraphic(
			timeline,
			theme,
			timeline.events.map(event => this.decorateEvent(event, theme))
		);
	}

	decorateEvent(event: HEvent, theme: TimelineTheme): EventGraphic {
		return new EventGraphic(event, theme);
	}

	private nextTheme(): TimelineTheme {
		return {
			primaryColor: this.colors[this.nextColorIndex++ % this.colors.length],
			secondaryColor: 'blue'
		};
	}
}
