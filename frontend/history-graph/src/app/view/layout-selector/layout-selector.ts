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

	get allLayoutOptions() {
		return this.preferenceService.allLayoutOptions;
	}

	isActive(format: LayoutFormat): boolean {
		return this.preferenceService.layoutFormat() === format;
	}

	applyLayout(format: LayoutFormat): void {
		this.preferenceService.setLayoutFormat(format);
	}
}

