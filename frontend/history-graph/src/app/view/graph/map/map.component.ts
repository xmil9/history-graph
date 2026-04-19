import { AfterViewInit, ChangeDetectorRef, Component, effect, inject } from '@angular/core';
import { TimelineMap } from '../../../services/timeline-map';
import { TimelineService } from '../../../services/timeline.service';
import { MapService } from '../../../services/map.service';

@Component({
	selector: 'tl-map',
	standalone: true,
	imports: [],
	templateUrl: './map.component.html',
	styleUrl: './map.component.css'
})
export class MapComponent implements AfterViewInit {
	private mapService = inject(MapService);

	constructor() {
	}

	ngAfterViewInit(): void {
		this.mapService.initMap();
		this.mapService.populateMap();
	}
}
