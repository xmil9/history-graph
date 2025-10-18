import { Injectable, signal } from '@angular/core';
import { HEvent } from '../model/historic-event';

export interface TimelineEventOverlay {
	tlEvent: HEvent;
	x: number;
	y: number;
}

@Injectable({
	providedIn: 'root'
})
export class TimelineEventOverlayService {
	overlay = signal<TimelineEventOverlay | null>(null);

	setOverlay(tlEvent: HEvent, x: number, y: number) {
		this.overlay.set({ tlEvent, x, y });
	}

	clearOverlay() {
		this.overlay.set(null);
	}
}

