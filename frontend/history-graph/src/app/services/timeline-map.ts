import * as L from 'leaflet';
import { EventGraphic, TimelineGraphic } from './graphic-types';
import { EventGeoMarker, GeoCoord } from './geo-types';
import { formatEventsAsHtml } from './event-geo-formating';

export class TimelineMap extends L.Map {
	private markers = new Array<EventGeoMarker>();
	private tlEventPopup = L.popup();

	constructor(elementId: string) {
		super(elementId, {
			center: [39.8282, -98.5795],
			zoom: 3
		})
		this.init();
	}

	private init() {
		this.initTiles();
		this.initInteractionEvents();
	}

	private initTiles() {
		const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 18,
			minZoom: 3,
			attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
		});

		tiles.addTo(this);
	}

	private initInteractionEvents() {
		this.on('click', this.onMapClicked.bind(this));
	}

	private onMapClicked(e: L.LeafletMouseEvent) {
		const clickedMarkers = this.findEventMarkersAt(e.latlng);
		
		if (clickedMarkers.length > 0) {
			this.showPopup(formatEventsAsHtml(clickedMarkers.map(m => m.tlEvent)), e.latlng);
		}
	}

	private findEventMarkersAt(at: GeoCoord) {
		return this.markers.filter(marker => marker.getBounds().contains(at));
	}

	private showPopup(content: string, at: GeoCoord) {
		this.tlEventPopup
			.setLatLng(at)
			.setContent(content)
			.openOn(this);
	}

	addTimeline(timeline: TimelineGraphic) {
		timeline.eventGraphics.forEach((event, idx) => {
			this.addTimelineEvent(event);
		});
	}

	private addTimelineEvent(event: EventGraphic) {
		if (!event.hEvent.location) {
			return;
		}

		const marker = new EventGeoMarker(
			event,
			[event.hEvent.location.lat, event.hEvent.location.lng],
			event.theme.primaryColor,
			200
		);
		marker.addTo(this);
		this.markers.push(marker);
	}

	clear() {
		this.markers.forEach((marker) => {
			marker.removeFrom(this);
		});
		this.markers.length = 0;
	}
}