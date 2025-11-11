import { computed, inject, Injectable, input, Signal, signal } from '@angular/core';
import { Timeline } from '../model/timeline';
import { duration } from '../model/historic-date';
import { Point2D, Size2D, INVALID_POSITION_SENTINEL, Rect2D } from '../graphics/gfx-coord-2d';
import { DEFAULT_LINE_STYLE, DEFAULT_TEXT_STYLE, LineStyle, TextStyle } from '../graphics/gfx-style';
import { LayoutFormat } from './layout-types';
import { AxisLayoutService } from './axis-layout.service';

// External data that affects the layout of events.
export interface EventLayoutInput {
	viewSize: Size2D;
	axisStartPos: Point2D;
	axisEndPos: Point2D;
	markerSize: Size2D;
	textStyle: TextStyle;
	lineStyle: LineStyle;
}

const DEFAULT_INPUT: EventLayoutInput = {
	viewSize: new Size2D(0, 0),
	axisStartPos: new Point2D(0, 0),
	axisEndPos: new Point2D(0, 0),
	markerSize: new Size2D(8),
	textStyle: DEFAULT_TEXT_STYLE,
	lineStyle: DEFAULT_LINE_STYLE,
};

interface LabelLayout {
	labelPositions: Point2D[];
	rotation: number;
	connectorPaths: string[];

	calculate(tlEventPos: Point2D[], input: EventLayoutInput, axisDisplayBounds: Rect2D): void;
	calculateConnectorPaths(tlEventPos: Point2D[]): string[]
	clear(): void;
}

class VerticalLabelLayout implements LabelLayout {
	labelPositions: Point2D[] = [];
	rotation: number = 90;
	connectorPaths: string[] = [];

	calculate(tlEventPos: Point2D[], input: EventLayoutInput, axisDisplayBounds: Rect2D): void {
		this.labelPositions = tlEventPos.map(pos => new Point2D(
			pos.x - input.textStyle.size / 3,
			pos.y + input.markerSize.height / 2 + 5
		));
		this.connectorPaths = [];
	}

	calculateConnectorPaths(tlEventPos: Point2D[]): string[] {
		// Nothing to do for vertical label layout.
		return this.connectorPaths;
	}

	clear(): void {
		this.labelPositions = [];
		this.rotation = 0;
		this.connectorPaths = [];
	}
}

class HorizontalLabelLayout implements LabelLayout {
	labelPositions: Point2D[] = [];
	rotation: number = 0;
	connectorPaths: string[] = [];
	// Offset for the first row of labels to avoid overlapping with the axis.
	private readonly firstRowOffsetY = 20;
	private readonly lastRowOffsetY = 20;
	private readonly labelOffsetX = 50;

	calculate(tlEventPos: Point2D[], input: EventLayoutInput, axisDisplayBounds: Rect2D): void {
		const tlEventsInView = tlEventPos.filter(pos => this.isInDisplay(pos, axisDisplayBounds));
		const rowHeight = this.calculateRowHeight(input, tlEventsInView.length);

		this.labelPositions = this.calculateLabelPositions(tlEventPos, input, axisDisplayBounds, rowHeight);
		// Connector paths are calculated later once the DOM is ready.
		// So we initialize them as empty strings.
		this.connectorPaths = tlEventPos.map(() => '');
	}

	calculateConnectorPaths(tlEventPos: Point2D[]): string[] {
		this.connectorPaths = tlEventPos.map((markerPos, index) => {
			// Find the label text element
			const labelElement = document.querySelector(`#event-label-${index}`) as SVGTextElement | null;
			if (!labelElement) {
				return '';
			}

			try {
				const bbox = labelElement.getBBox();
				const startX = markerPos.x;
				const startY = markerPos.y;
				const endX = bbox.x + bbox.width + 5;
				const endY = bbox.y + bbox.height / 2;

				const path = `M ${startX} ${startY} L ${startX} ${endY} L ${endX} ${endY}`;
				return path;
			} catch (e) {
				console.warn('Failed to calculate connector path for event ', index, ':', e);
				return '';
			}
		});
		return this.connectorPaths;
	}

	clear(): void {
		this.labelPositions = [];
		this.connectorPaths = [];
	}

	private isInDisplay(pos: Point2D, axisDisplayBounds: Rect2D): boolean {
		return axisDisplayBounds.contains(pos);
	}

	private calculateLabelPositions(
		tlEventPos: Point2D[],
		input: EventLayoutInput,
		axisDisplayBounds: Rect2D,
		rowHeight: number
	): Point2D[] {
		let rowY = input.axisStartPos.y + this.firstRowOffsetY;
		const rowX = this.labelOffsetX;

		return tlEventPos.map(pos => {
			if (this.isInDisplay(pos, axisDisplayBounds)) {
				rowY += rowHeight;
				return new Point2D(rowX, rowY);
			}
			return new Point2D(INVALID_POSITION_SENTINEL, INVALID_POSITION_SENTINEL);
		});
	}

	private calculateRowHeight(input: EventLayoutInput, tlEventsInViewCount: number): number {
		let rowHeight = (input.viewSize.height - input.axisStartPos.y - this.firstRowOffsetY - this.lastRowOffsetY) / tlEventsInViewCount;

		const maxRowHeight = this.estimateTextHeight(input.textStyle) * 2;
		if (rowHeight > maxRowHeight) {
			rowHeight = maxRowHeight;
		}

		const minRowHeight = 10;
		if (rowHeight < minRowHeight) {
			rowHeight = minRowHeight;
		}

		return rowHeight;
	}

	private estimateTextHeight(textStyle: TextStyle): number {
		// Rough estimate.
		let height = textStyle.size * 1.5;

		// Try to get a more accurate height.
		const canvas = document.createElement('canvas');
		const context = canvas.getContext('2d');
		if (context) {
			context.font = `${textStyle.size}px ${textStyle.font}`;
			const metrics = context.measureText('Gg');
			height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
		}

		if (canvas)
			canvas.remove();

		return height;
	  }
}

class NoneLabelLayout implements LabelLayout {
	labelPositions: Point2D[] = [];
	rotation: number = 0;
	connectorPaths: string[] = [];

	calculate(tlEventPos: Point2D[], input: EventLayoutInput, axisDisplayBounds: Rect2D): void {
		this.labelPositions = tlEventPos.map(pos => new Point2D(pos.x, pos.y));
		this.connectorPaths = [];
	}

	calculateConnectorPaths(tlEventPos: Point2D[]): string[] {
		// Nothing to do for none label layout.
		return this.connectorPaths;
	}

	clear(): void {
		this.labelPositions = [];
		this.connectorPaths = [];
	}
}

function createLabelLayout(format: LayoutFormat): LabelLayout {
	switch (format) {
		case LayoutFormat.Vertical:
			return new VerticalLabelLayout();
		case LayoutFormat.Horizontal:
			return new HorizontalLabelLayout();
		case LayoutFormat.None:
			return new NoneLabelLayout();
		default:
			throw new Error(`[EventLayoutService] - Invalid layout format: ${format}`);
	}
}

///////////////////

@Injectable({
	providedIn: 'root'
})
export class EventLayoutService {
	axisLayoutService = inject(AxisLayoutService);

	tlEventPos = signal<Point2D[]>([]);
	labelLayoutFormat = signal<LayoutFormat>(LayoutFormat.Horizontal);
	private labelLayout: LabelLayout = createLabelLayout(this.labelLayoutFormat());
	private input = DEFAULT_INPUT;
	private timeline?: Timeline;

	get labelPos(): Point2D[] {
		return this.labelLayout.labelPositions;
	}
	get labelRotation(): Signal<number> {
		return computed(() => this.labelLayout.rotation);
	}
	get labelConnectorPath(): string[] {
		return this.labelLayout.connectorPaths;
	}

	getEventPositionInDisplay(index: number): Point2D | undefined {
		const pos = this.tlEventPos()[index];
		if (pos === undefined) {
			return undefined;
		}
		return this.axisLayoutService.displayBounds().contains(pos) ? pos : undefined;
	}
	
	setLabelLayoutFormat(format: LayoutFormat): void {
		this.labelLayoutFormat.set(format);
		this.labelLayout = createLabelLayout(this.labelLayoutFormat());
		this.calculateLayout(this.input, this.timeline);

		// Recalculate connector paths after layout change
		this.calculateConnectorPathsDeferred();
	}

	calculateLayout(input: EventLayoutInput, timeline?: Timeline): void {
		this.input = input;
		this.timeline = timeline;

		if (this.timeline === undefined || this.timeline.events.length === 0) {
			this.tlEventPos.set([]);
			this.labelLayout.clear();
			return;
		}

		this.tlEventPos.set(this.calculateEventPositions(this.timeline));
		this.labelLayout.calculate(this.tlEventPos(), this.input, this.axisLayoutService.displayBounds());
	}

	private calculateEventPositions(timeline: Timeline): Point2D[] {
		const tlEventPositions: Point2D[] = [];

		const tlDuration = duration(timeline.from, timeline.to);
		const tlDistance = this.input.axisEndPos.x - this.input.axisStartPos.x;

		for (const event of timeline.events) {
			// Calculate position based on event date relative to timeline range.
			const eventRatio = duration(timeline.from, event.when) / tlDuration;
			const eventX = this.input.axisStartPos.x + (eventRatio * tlDistance);

			tlEventPositions.push(new Point2D(eventX, this.input.axisStartPos.y));
		}

		return tlEventPositions;
	}

	calculateConnectorPaths(): string[] {
		return this.labelLayout.calculateConnectorPaths(this.tlEventPos());
	}

	// Defer connector path calculation to after DOM is ready.
	calculateConnectorPathsDeferred(): void {
		setTimeout(() => {
			this.calculateConnectorPaths();
		}, 0);
	}
}
