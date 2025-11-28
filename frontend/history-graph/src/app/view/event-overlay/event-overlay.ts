import { Component, computed, inject, input } from '@angular/core';
import { EventOverlayService } from '../../services/event-overlay.service';
import { HDateFormat, MDYYYYFormat } from '../../model/historic-date';

@Component({
	selector: 'event-overlay',
	standalone: true,
	templateUrl: './event-overlay.html',
	styleUrl: './event-overlay.css'
})
export class EventOverlay {
	private overlayService = inject(EventOverlayService);

	// Inputs
	dateFormat = input<HDateFormat>(new MDYYYYFormat('-'));

	// Get overlay data from service
	overlay = computed(() => this.overlayService.overlay());

	dateRange = computed(() => {
		const overlay = this.overlay();
		if (!overlay) return '';
		const tlEvent = overlay.tlEvent;
		const format = this.dateFormat();
		if (tlEvent.until) {
			return `${format.format(tlEvent.when)} - ${format.format(tlEvent.until)}`;
		}
		return format.format(tlEvent.when);
	});

	// Calculate position with offset
	position = computed(() => {
		const overlay = this.overlay();
		if (!overlay) return { x: 0, y: 0 };
		return {
			x: overlay.x + 15,
			y: overlay.y - 70
		};
	});
}

