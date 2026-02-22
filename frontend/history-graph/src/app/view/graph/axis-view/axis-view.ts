import { Component, computed, inject, input, signal, Signal } from '@angular/core';
import { Point2D, Rect2D, Size2D } from '../../../graphics/gfx-coord-2d';
import { DEFAULT_LINE_STYLE, DEFAULT_TEXT_STYLE, LineStyle, TextStyle } from '../../../graphics/gfx-style';
import { SvgIcon, SvgIconOrigin } from '../../util/svg-icon/svg-icon';
import { LayoutService } from '../../../services/layout.service';
import { TimelineGraphic } from '../../../services/graphic-types';
import { TimelineLayout } from '../../../services/layout-types';

export const DEFAULT_AXIS_BACKGROUND = '#f8f8f8';

@Component({
	selector: '[tl-axis]',
	imports: [SvgIcon],
	templateUrl: './axis-view.html',
	styleUrl: './axis-view.css'
})
export class AxisView {
	private layoutService = inject(LayoutService);

	// Expose types for template
	SvgIconOrigin = SvgIconOrigin;

	// Content
	timeline = input.required<TimelineGraphic>();
	timelineIdx = input.required<number>();
	startLabel = input.required<string>();
	endLabel = input.required<string>();

	// Positioning
	private get timelineLayout(): TimelineLayout {
		return this.layoutService.layout.timelines.items[this.timelineIdx()];
	}

	get startPosition(): Point2D {
		return this.timelineLayout.axis.bounds.clamp(this.timelineLayout.axis.startPosition);
	}
	get endPosition(): Point2D {
		return this.timelineLayout.axis.bounds.clamp(this.timelineLayout.axis.endPosition);
	}
	get startIconPosition(): Point2D {
		const pos = this.timelineLayout.axis.startPosition;
		return this.displayBounds.contains(pos) ? pos : Point2D.invalid();
	}
	get endIconPosition(): Point2D {
		const pos = this.timelineLayout.axis.endPosition;
		return this.displayBounds.contains(pos) ? pos : Point2D.invalid();
	}
	get displayBounds(): Rect2D {
		return this.timelineLayout.axis.bounds;
	}
	get axisMarkerSize(): Size2D {
		return this.timelineLayout.axis.endMarkerSize;
	}
	get startLabelPosition(): Point2D {
		return this.timelineLayout.axis.startLabelPosition;
	}
	get endLabelPosition(): Point2D {
		return this.timelineLayout.axis.endLabelPosition;
	}
	get tickPositions(): Point2D[] {
		return this.timelineLayout.axis.tickPositions;
	}
	getTickLabel(index: number): string {
		return this.layoutService.ticks[index].label;
	}
	get tickLabelPositions(): Point2D[] {
		return this.timelineLayout.axis.tickLabelPositions;
	}
	get tickMarkerSize(): Size2D {
		return this.timelineLayout.axis.tickMarkerSize;
	}

	// Styling
	textStyle = input<TextStyle>(DEFAULT_TEXT_STYLE);
	lineStyle = input<LineStyle>(DEFAULT_LINE_STYLE);
	background = input<string>(DEFAULT_AXIS_BACKGROUND);
	get labelRotation(): number {
		return this.layoutService.layout.labels.rotation;
	}
	get textSize(): number {
		return this.textStyle().size - 4;
	}
	get textWeight(): number {
		return this.textStyle().weight;
	}
}