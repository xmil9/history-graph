import { effect, inject, Injectable } from "@angular/core";
import { TimelineService } from "./timeline.service";
import { TimelineMap } from "./timeline-map";
import { EventGraphic } from "./graphic-types";

@Injectable({
	providedIn: 'root'
})
export class MapService {
	private timelineService = inject(TimelineService);
	private map?: TimelineMap;

	timelines = this.timelineService.timelines;

	constructor() {
		// Repopulate the map when the timeline set changes.
		effect(() => {
			this.populateMap();
		});
	}

	initMap(): void {
		this.map = new TimelineMap('map');
	}

	populateMap() {
		this.map?.clear();

		this.timelines().forEach((timeline) => {
			this.map?.addTimeline(timeline);
		});
	}

	highlightTimelineEvent(tlEvent: EventGraphic) {
		this.map?.hightlightTimelineEvent(tlEvent);
	}

	unhighlightTimelineEvent(tlEvent: EventGraphic) {
		this.map?.unhightlightTimelineEvent(tlEvent);
	}
}
