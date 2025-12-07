import { Component, inject } from '@angular/core';
import { LayoutFormat } from '../../services/preference-types';
import { PreferenceService } from '../../services/preference.service';

@Component({
	selector: 'tl-layout-selector',
	standalone: true,
	templateUrl: './layout-selector.html',
	styleUrl: './layout-selector.css'
})
export class LayoutSelector {
	private preferenceService = inject(PreferenceService);

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
		return this.preferenceService.layoutFormat() === format;
	}

	// Set the layout format
	applyLayout(format: LayoutFormat): void {
		this.preferenceService.setLayoutFormat(format);
	}
}

