import { Component, inject } from '@angular/core';
import { EventLayoutService } from '../../services/event-layout.service';
import { LayoutFormat } from '../../services/layout-types';
import { AxisLayoutService } from '../../services/axis-layout.service';

@Component({
	selector: 'tl-layout-selector',
	standalone: true,
	templateUrl: './timeline-layout-selector.html',
	styleUrl: './timeline-layout-selector.css'
})
export class TimelineLayoutSelector {
	private layoutService = inject(EventLayoutService);
	private axisLayoutService = inject(AxisLayoutService);

	// Expose enum for template
	LayoutFormat = LayoutFormat;

	// Available layout options with display names
	layoutOptions = [
		{ value: LayoutFormat.None, label: 'None' },
		{ value: LayoutFormat.Vertical, label: 'Vertical' },
		{ value: LayoutFormat.Horizontal, label: 'Horizontal' }
	];

	// Check if a layout is active
	isActive(format: LayoutFormat): boolean {
		return this.layoutService.labelLayoutFormat() === format;
	}

	// Set the layout format
	applyLayout(format: LayoutFormat): void {
		this.layoutService.setLabelLayoutFormat(format);
		this.axisLayoutService.setLayoutFormat(format);
	}
}

