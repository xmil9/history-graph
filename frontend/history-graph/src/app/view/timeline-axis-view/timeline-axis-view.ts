import { Component, computed, inject, input, signal, Signal } from '@angular/core';
import { INVALID_POSITION_SENTINEL, Point2D, Rect2D, Size2D } from '../../graphics/gfx-coord-2d';
import { DEFAULT_LINE_STYLE, DEFAULT_TEXT_STYLE, LineStyle, TextStyle } from '../../graphics/gfx-style';
import { AxisLayoutService } from '../../services/axis-layout.service';
import { SvgIcon, SvgIconOrigin } from '../svg-icon/svg-icon';

export const DEFAULT_AXIS_BACKGROUND = '#f8f8f8';

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
	get startPos(): Signal<Point2D> {
		return computed(() => {
			return 	new Point2D(Math.max(this.axisLayoutService.startPos().x, this.displayBounds().left), this.axisLayoutService.startPos().y);
		});
	}
	get endPos(): Signal<Point2D> {
		return computed(() => {
			return new Point2D(Math.min(this.axisLayoutService.endPos().x, this.displayBounds().right), this.axisLayoutService.endPos().y);
		});
	}
	get startIconPos(): Signal<Point2D> {
		return computed(() => {
			const pos = this.axisLayoutService.startPos();
			if (this.displayBounds().contains(pos)) {
				return pos;
			}
			return new Point2D(INVALID_POSITION_SENTINEL, INVALID_POSITION_SENTINEL);
		});
	}
	get endIconPos(): Signal<Point2D> {
		return computed(() => {
			const pos = this.axisLayoutService.endPos();
			if (this.displayBounds().contains(pos)) {
				return pos;
			}
			return new Point2D(INVALID_POSITION_SENTINEL, INVALID_POSITION_SENTINEL);
		});
	}
	get displayBounds(): Signal<Rect2D> {
		return this.axisLayoutService.displayBounds;
	}
	get axisMarkerSize(): Signal<Size2D> {
		return this.axisLayoutService.axisMarkerSize;
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
	background = input<string>(DEFAULT_AXIS_BACKGROUND);
	get labelRotation(): Signal<number> {
		return this.axisLayoutService.labelRotation;
	}
}