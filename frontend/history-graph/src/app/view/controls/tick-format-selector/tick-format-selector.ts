import { Component, inject } from '@angular/core';
import { TickFormat } from '../../../services/tick-calculator';
import { PreferenceService } from '../../../services/preference.service';

@Component({
	selector: 'tick-format-selector',
	standalone: true,
	templateUrl: './tick-format-selector.html',
	styleUrl: './tick-format-selector.css'
})
export class TickFormatSelector {
	private preferenceService = inject(PreferenceService);

	get allTickFormats() {
		return this.preferenceService.allTickFormats;
	}

	isActive(formatValue: TickFormat): boolean {
		return this.preferenceService.tickFormat() === formatValue;
	}

	onFormatChange(event: Event) {
		const select = event.target as HTMLSelectElement;
		const value = parseInt(select.value, 10) as TickFormat;
		this.preferenceService.setTickFormat(value);
	}
}
