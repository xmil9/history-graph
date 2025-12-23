import { Component, computed, inject, input, signal, Signal } from '@angular/core';
import { INVALID_POSITION_SENTINEL, Point2D, Rect2D, Size2D } from '../../graphics/gfx-coord-2d';
import { DEFAULT_LINE_STYLE, DEFAULT_TEXT_STYLE, LineStyle, TextStyle } from '../../graphics/gfx-style';
import { SvgIcon, SvgIconOrigin } from '../svg-icon/svg-icon';
import { LayoutService } from '../../services/layout.service';

export const DEFAULT_AXIS_BACKGROUND = '#f8f8f8';

@Component({
	selector: '[tl-axis]',
	imports: [SvgIcon],
	templateUrl: './axis-view.html',
	styleUrl: './axis-view.css'
})
export class AxisView {
	private layout = inject(LayoutService);

	// Expose types for template
	SvgIconOrigin = SvgIconOrigin;

	// Content
	startLabel = input.required<string>();
	endLabel = input.required<string>();

	// Positioning
	get startPosition(): Signal<Point2D> {
		return computed(() => {
			return new Point2D(
				Math.max(this.layout.axis.startPosition().x, this.displayBounds().left),
				this.layout.axis.startPosition().y
			);
		});
	}
	get endPosition(): Signal<Point2D> {
		return computed(() => {
			return new Point2D(
				Math.min(this.layout.axis.endPosition().x, this.displayBounds().right),
				this.layout.axis.endPosition().y
			);
		});
	}
	get startIconPos(): Signal<Point2D> {
		return computed(() => {
			const pos = this.layout.axis.startPosition();
			if (this.displayBounds().contains(pos)) {
				return pos;
			}
			return new Point2D(INVALID_POSITION_SENTINEL, INVALID_POSITION_SENTINEL);
		});
	}
	get endIconPos(): Signal<Point2D> {
		return computed(() => {
			const pos = this.layout.axis.endPosition();
			if (this.displayBounds().contains(pos)) {
				return pos;
			}
			return new Point2D(INVALID_POSITION_SENTINEL, INVALID_POSITION_SENTINEL);
		});
	}
	get displayBounds(): Signal<Rect2D> {
		return this.layout.axis.displayBounds;
	}
	get axisMarkerSize(): Signal<Size2D> {
		return this.layout.axis.axisMarkerSize;
	}
	get startLabelPos(): Signal<Point2D> {
		return this.layout.axis.startLabelPosition;
	}
	get endLabelPos(): Signal<Point2D> {
		return this.layout.axis.endLabelPosition;
	}
	getTickLabel(index: number): string {
		return this.layout.axis.getTickLabel(index);
	}
	get tickPositions(): Signal<Point2D[]> {
		return this.layout.axis.tickPositions;
	}
	get tickLabelPositions(): Signal<Point2D[]> {
		return this.layout.axis.tickLabelPositions;
	}
	get tickMarkerSize(): Signal<Size2D> {
		return this.layout.axis.tickMarkerSize;
	}

	// Styling
	textStyle = input<TextStyle>(DEFAULT_TEXT_STYLE);
	lineStyle = input<LineStyle>(DEFAULT_LINE_STYLE);
	background = input<string>(DEFAULT_AXIS_BACKGROUND);
	get labelRotation(): Signal<number> {
		return this.layout.axis.labelRotation;
	}
	get textSize(): Signal<number> {
		return computed(() => this.textStyle().size - 4);
	}
	get textWeight(): Signal<number> {
		return computed(() => this.textStyle().weight);
	}
}