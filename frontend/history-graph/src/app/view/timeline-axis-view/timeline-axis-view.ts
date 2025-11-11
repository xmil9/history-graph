import { Component, inject, input, Signal } from '@angular/core';
import { Point2D, Rect2D } from '../../graphics/gfx-coord-2d';
import { DEFAULT_LINE_STYLE, DEFAULT_TEXT_STYLE, LineStyle, TextStyle } from '../../graphics/gfx-style';
import { AxisLayoutService } from '../../services/axis-layout.service';

@Component({
  selector: '[tl-axis]',
  templateUrl: './timeline-axis-view.html',
  styleUrl: './timeline-axis-view.css'
})
export class TimelineAxisView {
	private axisLayoutService = inject(AxisLayoutService);

	// Content
	startLabel = input.required<string>();
	endLabel = input.required<string>();
	
	// Positioning
	get startPos(): Signal<Point2D> {
		return this.axisLayoutService.startPos;
	}
	get endPos(): Signal<Point2D> {
		return this.axisLayoutService.endPos;
	}
	get displayBounds(): Signal<Rect2D> {
		return this.axisLayoutService.displayBounds;
	}
	get startMarker(): Signal<Rect2D> {
		return this.axisLayoutService.startMarker;
	}
	get endMarker(): Signal<Rect2D> {
		return this.axisLayoutService.endMarker;
	}
	get startLabelPos(): Signal<Point2D> {
		return this.axisLayoutService.startLabelPos;
	}
	get endLabelPos(): Signal<Point2D> {
		return this.axisLayoutService.endLabelPos;
	}

	// Styling
	textStyle = input<TextStyle>(DEFAULT_TEXT_STYLE);
	lineStyle = input<LineStyle>(DEFAULT_LINE_STYLE);
	get labelRotation(): Signal<number> {
		return this.axisLayoutService.labelRotation;
	}
}