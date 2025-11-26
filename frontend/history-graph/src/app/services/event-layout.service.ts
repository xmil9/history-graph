import { computed, inject, Injectable, input, Signal, signal } from '@angular/core';
import { Timeline } from '../model/timeline';
import { duration, HDate, HDateFormat, MDYYYYFormat } from '../model/historic-date';
import { Point2D, Size2D, INVALID_POSITION_SENTINEL, Rect2D } from '../graphics/gfx-coord-2d';
import { DEFAULT_LINE_STYLE, DEFAULT_TEXT_STYLE, LineStyle, TextStyle } from '../graphics/gfx-style';
import { LayoutFormat } from './layout-types';
import { AxisLayoutService } from './axis-layout.service';
import { HEvent } from '../model/historic-event';
import { TimelineService } from './timeline.service';

// External data that affects the layout of events.
export interface EventLayoutInput {
	viewSize: Size2D;
	textStyle: TextStyle;
	lineStyle: LineStyle;
	dateFormat: HDateFormat;
}

const DEFAULT_INPUT: EventLayoutInput = {
	viewSize: new Size2D(0, 0),
	textStyle: DEFAULT_TEXT_STYLE,
	lineStyle: DEFAULT_LINE_STYLE,
	dateFormat: new MDYYYYFormat('-'),
};

export interface EventPosition {
	start: Point2D;
	end: Point2D | undefined;
}

function formatLabel(tlEvent: HEvent, dateFormat: HDateFormat): string {
	return dateFormat.format(tlEvent.when) + ' - ' + tlEvent.label;
}

///////////////////

interface LabelLayout {
	labelPositions: Point2D[];
	rotation: number;
	connectorPaths: string[];

	calculate(eventPositions: EventPosition[], input: EventLayoutInput, axisLayout: AxisLayoutService, timeline: Timeline): void;
	clear(): void;
}

class VerticalLabelLayout implements LabelLayout {
	labelPositions: Point2D[] = [];
	rotation: number = 90;
	connectorPaths: string[] = [];

	calculate(eventPositions: EventPosition[], input: EventLayoutInput, axisLayout: AxisLayoutService, timeline: Timeline): void {
		this.labelPositions = eventPositions.map(pos => new Point2D(
			pos.start.x - input.textStyle.size / 3,
			pos.start.y + axisLayout.eventMarkerSize().height / 2 + 7
		));
		this.connectorPaths = [];
	}

	clear(): void {
		this.labelPositions = [];
		this.rotation = 0;
		this.connectorPaths = [];
	}
}

class HorizontalLeftLabelLayout implements LabelLayout {
	labelPositions: Point2D[] = [];
	rotation: number = 0;
	connectorPaths: string[] = [];
	// Offset for the first row of labels to avoid overlapping with the axis.
	private readonly firstRowOffsetY = 75;
	private readonly lastRowOffsetY = 20;
	private readonly labelOffsetX = 50;

	calculate(eventPositions: EventPosition[], input: EventLayoutInput, axisLayout: AxisLayoutService, timeline: Timeline): void {
		const tlEventsInView = eventPositions.filter(pos => axisLayout.displayBounds().contains(pos.start));
		const rowHeight = this.calculateRowHeight(input, axisLayout, tlEventsInView.length);

		this.labelPositions = this.calculateLabelPositions(eventPositions, input, axisLayout, rowHeight);
		this.connectorPaths = this.calculateConnectorPaths(eventPositions, this.labelPositions, input, timeline);
	}

	private calculateConnectorPaths(
		eventPositions: EventPosition[],
		labelPositions: Point2D[],
		input: EventLayoutInput,
		timeline: Timeline
	): string[] {
		const canvas = document.createElement('canvas');
		const context = canvas.getContext('2d');
		if (!context) return eventPositions.map(() => '');

		context.font = `${input.textStyle.weight} ${input.textStyle.size}px ${input.textStyle.font}`;

		const paths = eventPositions.map((eventPos, index) => {
			const labelPos = labelPositions[index];
			if (labelPos.x === INVALID_POSITION_SENTINEL) {
				return '';
			}

			const event = timeline.events[index];
			const labelText = formatLabel(event, input.dateFormat);
			const textMetrics = context.measureText(labelText);
			const textWidth = textMetrics.width;
			const textHeight = input.textStyle.size; // Approximation usually sufficient for vertical center

			const startX = eventPos.start.x;
			const startY = eventPos.start.y;
			// We want to connect to the right-center side of the text.
			const endX = labelPos.x + textWidth + 5;
			const endY = labelPos.y - textHeight / 3;

			if (endX < startX) {
				// Label is to the left of marker: draw full L-shaped path.
				return `M ${startX} ${startY} L ${startX} ${endY} L ${endX} ${endY}`;
			}
			// Label is to the right of marker: draw only vertical line to the top of the text.
			return `M ${startX} ${startY} L ${startX} ${endY - 10}`;
		});

		canvas.remove();
		return paths;
	}

	clear(): void {
		this.labelPositions = [];
		this.connectorPaths = [];
	}

	private calculateLabelPositions(
		eventPositions: EventPosition[],
		input: EventLayoutInput,
		axisLayout: AxisLayoutService,
		rowHeight: number
	): Point2D[] {
		let rowY = axisLayout.startPos().y + this.firstRowOffsetY;
		const rowX = this.labelOffsetX;

		return eventPositions.map(pos => {
			if (axisLayout.displayBounds().contains(pos.start)) {
				rowY += rowHeight;
				return new Point2D(rowX, rowY);
			}
			return new Point2D(INVALID_POSITION_SENTINEL, INVALID_POSITION_SENTINEL);
		});
	}

	private calculateRowHeight(
		input: EventLayoutInput,
		axisLayout: AxisLayoutService,
		numEventsInView: number
	): number {
		let rowHeight = (input.viewSize.height - axisLayout.startPos().y - this.firstRowOffsetY - this.lastRowOffsetY) / numEventsInView;

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

class HorizontalCenterLabelLayout implements LabelLayout {
	labelPositions: Point2D[] = [];
	rotation: number = 0;
	connectorPaths: string[] = [];
	// Offset for the first row of labels to avoid overlapping with the axis.
	private readonly firstRowOffsetY = 75;
	private readonly lastRowOffsetY = 20;

	calculate(eventPositions: EventPosition[], input: EventLayoutInput, axisLayout: AxisLayoutService, timeline: Timeline): void {
		const tlEventsInView = eventPositions.filter(pos => axisLayout.displayBounds().contains(pos.start));
		const rowHeight = this.calculateRowHeight(input, axisLayout, tlEventsInView.length);

		this.labelPositions = this.calculateLabelPositions(eventPositions, input, axisLayout, rowHeight, timeline);
		this.connectorPaths = this.calculateConnectorPaths(eventPositions, this.labelPositions, input, timeline);
	}

	private calculateConnectorPaths(
		eventPositions: EventPosition[],
		labelPositions: Point2D[],
		input: EventLayoutInput,
		timeline: Timeline
	): string[] {
		const paths = eventPositions.map((eventPos, index) => {
			const labelPos = labelPositions[index];
			if (labelPos.x === INVALID_POSITION_SENTINEL) {
				return '';
			}

			const textHeight = input.textStyle.size;
			
			const startX = eventPos.start.x;
			const startY = eventPos.start.y;
			const endY = labelPos.y - textHeight / 3;

			return `M ${startX} ${startY} L ${startX} ${endY - 10}`;
		});

		return paths;
	}

	clear(): void {
		this.labelPositions = [];
		this.connectorPaths = [];
	}

	private calculateLabelPositions(
		eventPositions: EventPosition[],
		input: EventLayoutInput,
		axisLayout: AxisLayoutService,
		rowHeight: number,
		timeline: Timeline
	): Point2D[] {
		const canvas = document.createElement('canvas');
		const context = canvas.getContext('2d');
		if (!context)
			return eventPositions.map(() => new Point2D(INVALID_POSITION_SENTINEL, INVALID_POSITION_SENTINEL));

		context.font = `${input.textStyle.weight} ${input.textStyle.size}px ${input.textStyle.font}`;

		const initialRowY = axisLayout.startPos().y + this.firstRowOffsetY;
		const maxXPerRow: number[] = [];

		const labelPositions = eventPositions.map((pos, index) => {
			if (axisLayout.displayBounds().contains(pos.start)) {
				const event = timeline.events[index];
				const labelText = formatLabel(event, input.dateFormat);
				const textMetrics = context.measureText(labelText);
				const textWidth = textMetrics.width;

				const labelX = pos.start.x - textWidth / 2;
				const rowIdx = this.findRow(labelX, maxXPerRow);
				const labelY = initialRowY + (rowIdx + 1) * rowHeight;

				// Update max x-coordinate for the used row.
				maxXPerRow[rowIdx] = Math.max(maxXPerRow[rowIdx] || 0, labelX + textWidth);

				return new Point2D(labelX, labelY);
			}
			return new Point2D(INVALID_POSITION_SENTINEL, INVALID_POSITION_SENTINEL);
		});

		canvas.remove();
		return labelPositions;
	}

	private findRow(labelX: number, maxXPerRow: number[]): number {
		// Find the first row where the label x-coordinate is less than or equal to the max x-coordinate.
		let rowIdx = 0;
		while (rowIdx < maxXPerRow.length && labelX <= maxXPerRow[rowIdx]) {
			rowIdx++;
		}
		return rowIdx;
	}

	private calculateRowHeight(
		input: EventLayoutInput,
		axisLayout: AxisLayoutService,
		tlEventsInViewCount: number
	): number {
		let rowHeight = (input.viewSize.height - axisLayout.startPos().y - this.firstRowOffsetY - this.lastRowOffsetY) / tlEventsInViewCount;

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

	calculate(eventPositions: EventPosition[], input: EventLayoutInput, axisLayout: AxisLayoutService, timeline: Timeline): void {
		this.labelPositions = eventPositions.map(pos => new Point2D(pos.start.x, pos.start.y));
		this.connectorPaths = [];
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
		case LayoutFormat.HorizontalLeft:
			return new HorizontalLeftLabelLayout();
		case LayoutFormat.HorizontalCenter:
			return new HorizontalCenterLabelLayout();
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
	private timelineService = inject(TimelineService);
	private axisLayoutService = inject(AxisLayoutService);

	get timeline(): Timeline {
		return this.timelineService.timeline;
	}

	eventPositions = signal<EventPosition[]>([]);
	overviewEventPositions = signal<EventPosition[]>([]);
	labelLayoutFormat = signal<LayoutFormat>(LayoutFormat.HorizontalCenter);
	private labelLayout: LabelLayout = createLabelLayout(this.labelLayoutFormat());
	private input = DEFAULT_INPUT;

	get labelPositions(): Point2D[] {
		return this.labelLayout.labelPositions;
	}
	get labelRotation(): Signal<number> {
		return computed(() => this.labelLayout.rotation);
	}
	get labelConnectorPaths(): string[] {
		return this.labelLayout.connectorPaths;
	}

	getEventPositionInDisplay(index: number): Point2D | undefined {
		const pos = this.eventPositions()[index].start;
		return this.axisLayoutService.displayBounds().contains(pos) ? pos : undefined;
	}
	
	getEventEndPositionInDisplay(index: number): Point2D | undefined {
		const pos = this.eventPositions()[index].end;
		if (pos === undefined) {
			return undefined;
		}
		return this.axisLayoutService.displayBounds().contains(pos) ? pos : undefined;
	}
	
	setLabelLayoutFormat(format: LayoutFormat): void {
		this.labelLayoutFormat.set(format);
		this.labelLayout = createLabelLayout(this.labelLayoutFormat());
		this.calculateLayout(this.input);
	}

	calculateLayout(input: EventLayoutInput): void {
		this.input = input;

		if (this.timeline.events.length === 0) {
			this.eventPositions.set([]);
			this.overviewEventPositions.set([]);
			this.labelLayout.clear();
			return;
		}

		const eventPositions = this.calculateEventPositions();
		this.eventPositions.set(eventPositions);
		this.labelLayout.calculate(this.eventPositions(), this.input, this.axisLayoutService, this.timeline);

		const overviewEventPositions = this.calculateOverviewEventPositions();
		this.overviewEventPositions.set(overviewEventPositions);
	}

	private calculateEventPositions(): EventPosition[] {
		const eventPositions: EventPosition[] = [];

		for (const event of this.timeline.events) {
			const start = this.calculateDatePosition(event.when);
			const end = this.calculateDatePosition(event.until);
			eventPositions.push({ start: start!, end: end });
		}

		return eventPositions;
	}

	private calculateDatePosition(date: HDate | undefined): Point2D | undefined {
		if (date === undefined) {
			return undefined;
		}

		const axisStartPos = this.axisLayoutService.startPos();
		const axisEndPos = this.axisLayoutService.endPos();

		const tlDuration = duration(this.timeline.from, this.timeline.to);
		const tlDistance = axisEndPos.x - axisStartPos.x;

		const dateRatio = duration(this.timeline.from, date) / tlDuration;
		const dateX = axisStartPos.x + (dateRatio * tlDistance);
		return new Point2D(dateX, axisStartPos.y);
	}

	private calculateOverviewEventPositions(): EventPosition[] {
		const overviewEventPositions: EventPosition[] = [];

		for (const event of this.timeline.events) {
			const start = this.calculateOverviewDatePosition(event.when);
			const end = this.calculateOverviewDatePosition(event.until);
			overviewEventPositions.push({ start: start!, end: end });
		}

		return overviewEventPositions;
	}

	private calculateOverviewDatePosition(date: HDate | undefined): Point2D | undefined {
		if (date === undefined) {
			return undefined;
		}

		const overviewAxisBounds = this.axisLayoutService.overviewAxisBounds();
		const tlDuration = duration(this.timeline.from, this.timeline.to);
		const tlDistance = overviewAxisBounds.width;

		const dateRatio = duration(this.timeline.from, date) / tlDuration;
		const dateX = overviewAxisBounds.left + (dateRatio * tlDistance);
		return new Point2D(dateX, overviewAxisBounds.center.y);
	}

	formatLabel(tlEvent: HEvent): string {
		return formatLabel(tlEvent, this.input.dateFormat);
	}
}
