import { Injectable, signal } from '@angular/core';
import { HEvent } from '../model/historic-event';

export interface EventOverlay {
	tlEvent: HEvent;
	x: number;
	y: number;
}

@Injectable({
	providedIn: 'root'
})
export class EventOverlayService {
	overlay = signal<EventOverlay | null>(null);

	setOverlay(tlEvent: HEvent, x: number, y: number) {
		this.overlay.set({ tlEvent, x, y });
	}

	clearOverlay() {
		this.overlay.set(null);
	}
}

