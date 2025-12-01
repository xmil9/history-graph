import { Component, inject } from '@angular/core';
import { EventLayoutService } from '../../services/event-layout.service';
import { LayoutFormat } from '../../services/layout-types';
import { AxisLayoutService } from '../../services/axis-layout.service';

@Component({
	selector: 'tl-layout-selector',
	standalone: true,
	templateUrl: './layout-selector.html',
	styleUrl: './layout-selector.css'
})
export class LayoutSelector {
	private layoutService = inject(EventLayoutService);
	private axisLayoutService = inject(AxisLayoutService);

	// Expose enum for template
	LayoutFormat = LayoutFormat;

	// Available layout options with display names
	layoutOptions = [
		{ value: LayoutFormat.HorizontalCenter, label: 'Horizontal' },
		{ value: LayoutFormat.HorizontalLeft, label: 'Horizontal Left' },
		{ value: LayoutFormat.Vertical, label: 'Vertical' },
		{ value: LayoutFormat.None, label: 'None' },
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

