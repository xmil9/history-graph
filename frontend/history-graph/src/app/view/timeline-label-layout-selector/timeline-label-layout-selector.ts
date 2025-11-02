import { Component, inject } from '@angular/core';
import { EventLabelLayoutFormat, EventLayoutService } from '../../services/event-layout.service';

@Component({
	selector: 'tl-label-layout-selector',
	standalone: true,
	templateUrl: './timeline-label-layout-selector.html',
	styleUrl: './timeline-label-layout-selector.css'
})
export class TimelineLabelLayoutSelector {
	private layoutService = inject(EventLayoutService);

	// Expose enum for template
	EventLabelLayoutFormat = EventLabelLayoutFormat;

	// Available layout options with display names
	layoutOptions = [
		{ value: EventLabelLayoutFormat.None, label: 'None' },
		{ value: EventLabelLayoutFormat.Vertical, label: 'Vertical' },
		{ value: EventLabelLayoutFormat.Horizontal, label: 'Horizontal' }
	];

	// Check if a layout is active
	isActive(format: EventLabelLayoutFormat): boolean {
		return this.layoutService.labelLayoutFormat() === format;
	}

	// Set the layout format
	applyLayout(format: EventLabelLayoutFormat): void {
		this.layoutService.setLabelLayoutFormat(format);
	}
}

