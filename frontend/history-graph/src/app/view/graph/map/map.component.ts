import { AfterViewInit, ChangeDetectorRef, Component, inject } from '@angular/core';
import { TimelineMap } from '../../../services/timeline-map';

@Component({
	selector: 'tl-map',
	standalone: true,
	imports: [],
	templateUrl: './map.component.html',
	styleUrl: './map.component.css'
})
export class MapComponent implements AfterViewInit {
	private cd = inject(ChangeDetectorRef);
	private map?: TimelineMap;

	constructor() { }

	ngAfterViewInit(): void {
		this.initMap();
		this.initTrails();
		this.cd.detectChanges();
	}

	private initMap(): void {
		this.map = new TimelineMap('map');
	}

	private initTrails() {
	}
}
