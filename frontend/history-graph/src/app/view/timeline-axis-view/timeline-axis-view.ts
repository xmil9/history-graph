import { Component, computed, inject, input, signal, Signal } from '@angular/core';
import { INVALID_POSITION_SENTINEL, Point2D, Rect2D, Size2D } from '../../graphics/gfx-coord-2d';
import { DEFAULT_LINE_STYLE, DEFAULT_TEXT_STYLE, LineStyle, TextStyle } from '../../graphics/gfx-style';
import { AxisLayoutService } from '../../services/axis-layout.service';
import { SvgIcon, SvgIconOrigin } from '../svg-icon/svg-icon';

@Component({
  	selector: '[tl-axis]',
	imports: [SvgIcon],
	templateUrl: './timeline-axis-view.html',
  	styleUrl: './timeline-axis-view.css'
})
export class TimelineAxisView {
	private axisLayoutService = inject(AxisLayoutService);

	// Expose types for template
	SvgIconOrigin = SvgIconOrigin;
	
	// Content
	startLabel = input.required<string>();
	endLabel = input.required<string>();
	
	// Positioning
	markerSize = signal(new Size2D(16));
	get startPos(): Signal<Point2D> {
		return this.axisLayoutService.startPos;
	}
	get endPos(): Signal<Point2D> {
		return this.axisLayoutService.endPos;
	}
	get startIconPos(): Signal<Point2D> {
		return computed(() => {
			const pos = this.startPos();
			if (this.displayBounds().contains(pos)) {
				return pos;
			}
			return new Point2D(INVALID_POSITION_SENTINEL, INVALID_POSITION_SENTINEL);
		});
	}
	get endIconPos(): Signal<Point2D> {
		return computed(() => {
			const pos = this.endPos();
			if (this.displayBounds().contains(pos)) {
				return pos;
			}
			return new Point2D(INVALID_POSITION_SENTINEL, INVALID_POSITION_SENTINEL);
		});
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