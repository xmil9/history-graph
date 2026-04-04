import { AfterViewInit, ChangeDetectorRef, Component, effect, inject } from '@angular/core';
import { TimelineMap } from '../../../services/timeline-map';
import { TimelineService } from '../../../services/timeline.service';

@Component({
	selector: 'tl-map',
	standalone: true,
	imports: [],
	templateUrl: './map.component.html',
	styleUrl: './map.component.css'
})
export class MapComponent implements AfterViewInit {
	private timelineService = inject(TimelineService);
	private map?: TimelineMap;

	timelines = this.timelineService.timelines;

	constructor() {
		// Repopulate the map when the timeline set changes.
		effect(() => {
			this.populateMap();
		});
	}

	ngAfterViewInit(): void {
		this.initMap();
		this.populateMap();
	}

	private initMap(): void {
		this.map = new TimelineMap('map');
	}

	private populateMap() {
		this.map?.clear();

		this.timelines().forEach((timeline) => {
			this.map?.addTimeline(timeline);
		});
	}
}
