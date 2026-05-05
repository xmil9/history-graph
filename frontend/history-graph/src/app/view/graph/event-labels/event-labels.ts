import { Component, inject, input } from '@angular/core';
import { DEFAULT_LINE_STYLE, DEFAULT_TEXT_STYLE, LineStyle, TextStyle } from '../../../graphics/gfx-style';
import { Point2D } from '../../../graphics/gfx-coord-2d';
import { LayoutService } from '../../../services/layout.service';
import { LabelLayout } from '../../../services/layout-types';
import { LayoutFormat } from '../../../services/preference-types';
import { PreferenceService } from '../../../services/preference.service';

@Component({
	selector: '[event-labels]',
	imports: [],
	templateUrl: './event-labels.html',
	styleUrl: './event-labels.css'
})
export class EventLabels {
	private layoutService = inject(LayoutService);
	private preferenceService = inject(PreferenceService);

	// Expose types for template
	LayoutFormat = LayoutFormat;

	// Content
	get labels(): LabelLayout[] {
		return this.layoutService.layout.labels.items
	}
	get layoutFormat(): LayoutFormat {
		return this.preferenceService.layoutFormat();
	}
	label(eventIdx: number): string {
		return this.labels[eventIdx].position.event.hEvent.label;
	}

	// Positioning
	labelPosition(eventIdx: number): Point2D {
		return this.labels[eventIdx].position.coord;
	}
	labelRotation(): number {
		return this.layoutService.layout.labels.rotation;
	}
	connectorPath(eventIdx: number): string {
		return this.labels[eventIdx].connectorPath;
	}

	// Styling
	textStyle = input<TextStyle>(DEFAULT_TEXT_STYLE);
	lineStyle = input<LineStyle>(DEFAULT_LINE_STYLE);
	labelColor(eventIdx: number): string {
		return this.labels[eventIdx].position.event.color();
	}
	lineColor(eventIdx: number): string {
		return this.labels[eventIdx].position.event.color();
	}
}
