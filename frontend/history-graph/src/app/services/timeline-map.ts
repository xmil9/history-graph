import * as L from 'leaflet';
import { EventGraphic, TimelineGraphic } from './graphic-types';
import { EventGeoMarker, GeoCoord } from './geo-types';
import { formatEventsAsHtml } from './event-geo-formating';
import { DEFAULT_DATE_FORMAT, HDateFormat, HDate } from '../model/historic-date';

export class TimelineMap extends L.Map {
	private dateFormat: HDateFormat = DEFAULT_DATE_FORMAT;
	private markers = new Array<EventGeoMarker>();
	private tlEventPopup = L.popup();
	public onMarkerClick?: (date: HDate) => void;

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

	setDateFormat(dateFormat: HDateFormat) {
		this.dateFormat = dateFormat;
	}

	private initInteractionEvents() {
		this.on('click', this.onMapClicked.bind(this));
		this.on('zoomend', this.onMapZoomEnd.bind(this));
	}

	private onMapClicked(e: L.LeafletMouseEvent) {
		const clickedMarkers = this.findEventMarkersAt(e.latlng);
		
		if (clickedMarkers.length > 0) {
			this.showPopup(
				formatEventsAsHtml(clickedMarkers.map(m => m.tlEvent), this.dateFormat),
				e.latlng
			);

			const firstEventDate = clickedMarkers[0].tlEvent.hEvent.when;
			if (firstEventDate && this.onMarkerClick) {
				this.onMarkerClick(firstEventDate);
			}
		}
	}

	private onMapZoomEnd(e: L.LeafletEvent) {
		const zoom = this.getZoom();
		// Exponential scaling: radius doubles for each zoom level zoomed out.
		// This maintains a relatively consistent visual size in pixels on the screen.
		const newRadius = Math.pow(2, 18 - zoom) * 15;
		this.markers.forEach((marker) => {
			marker.setRadius(newRadius);
		});
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

		const currentZoom = this.getZoom();
		const radius = Math.pow(2, 18 - currentZoom) * 15;

		const marker = new EventGeoMarker(
			event,
			[event.hEvent.location.lat, event.hEvent.location.lng],
			event.theme.primaryColor,
			radius
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

	hightlightTimelineEvent(event: EventGraphic) {
		const marker = this.markers.find(marker => marker.tlEvent.equals(event));
		if (marker) {
			marker.highlight();
			this.panTo(marker.getLatLng());
		}
	}

	unhightlightTimelineEvent(event: EventGraphic) {
		const marker = this.markers.find(marker => marker.tlEvent.equals(event));
		if (marker) {
			marker.unhighlight();
		}
	}
}