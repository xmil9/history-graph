import { effect, inject, Injectable } from "@angular/core";
import { TimelineService } from "./timeline.service";
import { TimelineMap } from "./timeline-map";
import { EventGraphic } from "./graphic-types";
import { PreferenceService } from "./preference.service";

@Injectable({
	providedIn: 'root'
})
export class MapService {
	private timelineService = inject(TimelineService);
	private preferenceService = inject(PreferenceService);
	private map?: TimelineMap;

	timelines = this.timelineService.timelines;

	constructor() {
		// Repopulate the map when the timeline set changes.
		effect(() => {
			this.populateMap();
		});

		// Update the date format when it changes.
		effect(() => {
			const format = this.preferenceService.dateFormat().format;
			if (this.map) {
				this.map.setDateFormat(format);
			}
		});
	}

	initMap(): void {
		this.map = new TimelineMap('map');
		this.map.setDateFormat(this.preferenceService.dateFormat().format);
	}

	populateMap() {
		this.map?.clear();

		this.timelines().forEach((timeline) => {
			if (timeline.isVisible()) {
				this.map?.addTimeline(timeline);
			}
		});
	}

	highlightTimelineEvent(tlEvent: EventGraphic) {
		this.map?.hightlightTimelineEvent(tlEvent);
	}

	unhighlightTimelineEvent(tlEvent: EventGraphic) {
		this.map?.unhightlightTimelineEvent(tlEvent);
	}
}
