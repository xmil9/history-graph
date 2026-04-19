import * as L from 'leaflet';
import { EventGraphic } from './graphic-types';

export type GeoCoord = L.LatLngExpression;

export class EventGeoMarker extends L.Circle {
	readonly tlEvent: EventGraphic;

	constructor(tlEvent: EventGraphic, coord: GeoCoord, color: string, radius: number) {
		super(coord, { color: color, radius: radius, fillOpacity: 0.1 });
		this.tlEvent = tlEvent;
	}

	equals(other: EventGeoMarker): boolean {
		return this.tlEvent.equals(other.tlEvent);
	}

	highlight() {
		this.bringToFront();
		this.setStyle({ color: 'red', weight: 3 });
	}

	unhighlight() {
		this.setStyle({ color: this.tlEvent.theme.primaryColor, weight: 1 });
	}
}