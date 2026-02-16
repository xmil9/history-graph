import { LayoutFormat } from "./preference-types";
import { DEFAULT_LAYOUT_INPUT, EventPosition, HgLayout, LabelLayout, LabelPosition, LabelsLayout, LayoutInput, SvgPath, TimelineLayout } from "./layout-types";
import { EventGraphic, TimelineGraphic } from "./graphic-types";
import { INVALID_POSITION_SENTINEL, Point2D, Rect2D } from "../graphics/gfx-coord-2d";
import { formatEventLabel, makeFont } from "./layout-utils";

///////////////////

export abstract class LabelLayoutCalculator {
	rotation: number = 0;
	protected readonly labelAreaMargins = Rect2D.fromCoordinates(50, 25, 50, 25);
	protected input: LayoutInput = DEFAULT_LAYOUT_INPUT;
	protected timelineLayoutLut: Map<number, TimelineLayout> = new Map();

	setInput(input: LayoutInput): void {
		this.input = input;
	}

	abstract calculate(
		timelines: TimelineGraphic[],
		combinedTimeline: TimelineGraphic,
		layout: HgLayout
	): void;
	
	abstract clear(): void;

	protected initTimelineLayoutLookup(
		timelines: TimelineGraphic[],
		layout: HgLayout
	): void {
		this.timelineLayoutLut.clear();
		timelines.forEach((tl, tlIdx) => {
			this.timelineLayoutLut.set(tl.timeline.id, layout.timelines.items[tlIdx]);
		});
	}

	protected getTimelineLayout(
		eventGraphic: EventGraphic,
	): TimelineLayout {
		const layout = this.timelineLayoutLut.get(eventGraphic.hEvent.timelineId);
		if (!layout) {
			throw new Error(`Timeline ${eventGraphic.hEvent.timelineId} not found`);
		}
		return layout;
	}

	protected countVisibleEvents(
		combinedTimeline: TimelineGraphic,
	): number {
		return combinedTimeline.eventGraphics.filter(eventGraphic => {
			const tlLayout = this.getTimelineLayout(eventGraphic);
			const eventPos = tlLayout.eventPositions[eventGraphic.hEvent.eventIdx];
			return tlLayout.axis.contains(eventPos.start);
		}).length;
	}

	protected calcLabelAreaBounds(): Rect2D {
		return Rect2D.fromCoordinates(
			this.labelAreaMargins.left,
			this.labelAreaMargins.top,
			this.input.viewSize.width - this.labelAreaMargins.right,
			this.input.viewSize.height - this.labelAreaMargins.bottom
		);
	}

	protected calculateRowHeight(
		layout: HgLayout,
		numEventsInView: number,
		topMargin: number,
		bottomMargin: number
	): number {
		const labelAreaHeight = layout.labels.bounds.height - topMargin - bottomMargin;
		const rowHeight = labelAreaHeight / numEventsInView;
		return this.clampRowHeight(rowHeight);
	}

	private clampRowHeight(rowHeight: number): number {
		const maxRowHeight = this.estimateTextHeight() * 2;
		if (rowHeight > maxRowHeight) {
			rowHeight = maxRowHeight;
		}

		const minRowHeight = 10;
		if (rowHeight < minRowHeight) {
			rowHeight = minRowHeight;
		}

		return rowHeight;
	}

	private estimateTextHeight(): number {
		// Rough estimate.
		let height = this.input.textStyle.size * 1.5;

		// Try to get a more accurate height.
		const canvas = document.createElement('canvas');
		const context = canvas.getContext('2d');
		if (context) {
			context.font = `${this.input.textStyle.size}px ${this.input.textStyle.font}`;
			const metrics = context.measureText('Gg');
			height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
		}

		if (canvas)
			canvas.remove();

		return height;
	  }
}

///////////////////

class VerticalLabelCalculator extends LabelLayoutCalculator {
	override rotation: number = 90;

	calculate(
		timelines: TimelineGraphic[],
		combinedTimeline: TimelineGraphic,
		layout: HgLayout
	): void {
		this.initTimelineLayoutLookup(timelines, layout);

		layout.labels.bounds = this.calcLabelAreaBounds();
		layout.labels.rotation = this.rotation;

		layout.labels.items = combinedTimeline.eventGraphics.map(eventGraphic => {
			// Find the layout of the timeline that contains the event.
			const tlLayout = this.getTimelineLayout(eventGraphic);

			const eventPos = tlLayout.eventPositions[eventGraphic.hEvent.eventIdx];
			const isLabelVisible = tlLayout.axis.contains(eventPos.start);

			// Calculate the position of the label.
			let labelPos = Point2D.invalid();
			if (isLabelVisible) {
				labelPos = new Point2D(
					eventPos.start.x - this.input.textStyle.size / 3,
					eventPos.start.y + tlLayout.eventMarkerSize.height / 2 + 7
				);
			}
			
			// No connector paths in a vertical layout.
			const connectorPath = '';

			return new LabelLayout(
				new LabelPosition(
					eventGraphic,
					labelPos
				),
				connectorPath
			);
		});
	}

	clear(): void {
	}
}

///////////////////

class HorizontalLeftLabelCalculator extends LabelLayoutCalculator {
	// Offset for the first row of labels to avoid overlapping with the axis.
	private readonly firstRowOffsetY = 10;
	// Offset of the last row of labels to the bottom of the label area.
	private readonly lastRowOffsetY = 20;
	// Offset of labels from the left side of the label area.
	private readonly labelOffsetX = 50;

	calculate(
		timelines: TimelineGraphic[],
		combinedTimeline: TimelineGraphic,
		layout: HgLayout
	): void {
		this.initTimelineLayoutLookup(timelines, layout);
		layout.labels.bounds = this.calcLabelAreaBounds();
		layout.labels.rotation = this.rotation;

		const positions = this.calcLabelPositions(combinedTimeline, layout);
		const paths = this.calcConnectorPaths(combinedTimeline, positions);

		// Combined separate position and path arrays into a label layout for each event.
		layout.labels.items = positions.map((labelPos, idx) => {
			return new LabelLayout(labelPos, paths[idx]);
		});
	}

	clear(): void {
	}

	private calcLabelPositions(
		combinedTimeline: TimelineGraphic,
		layout: HgLayout
	) {
		const numVisibleEvents = this.countVisibleEvents(combinedTimeline);
		const rowHeight = this.calculateRowHeight(
			layout, numVisibleEvents, this.firstRowOffsetY, this.lastRowOffsetY);
		const rowX = this.labelOffsetX;
		let rowY = layout.labels.bounds.top + this.firstRowOffsetY;

		return combinedTimeline.eventGraphics.map(eventGraphic => {
			const tlLayout = this.getTimelineLayout(eventGraphic);
			const eventPos = tlLayout.eventPositions[eventGraphic.hEvent.eventIdx];
			const isLabelVisible = tlLayout.axis.contains(eventPos.start);

			// Calculate the position of the label.
			let labelPos = Point2D.invalid();
			if (isLabelVisible) {
				rowY += rowHeight;
				labelPos = new Point2D(rowX, rowY);
			}

			return new LabelPosition(
					eventGraphic,
					labelPos
				);
		});
	}

	private calcConnectorPaths(
		combinedTimeline: TimelineGraphic,
		labelPositions: LabelPosition[]
	): SvgPath[] {
		const canvas = document.createElement('canvas');
		const context = canvas.getContext('2d');
		if (!context)
			throw new Error('Unable to create 2d canvas context.');

		context.font = makeFont(this.input.textStyle);

		const paths = combinedTimeline.eventGraphics.map((eventGraphic, idx) => {
			const labelPos = labelPositions[idx];
			if (labelPos.coord.x === INVALID_POSITION_SENTINEL) {
				return '';
			}

			const tlLayout = this.getTimelineLayout(eventGraphic);
			const eventPos = tlLayout.eventPositions[eventGraphic.hEvent.eventIdx];

			const labelText = formatEventLabel(eventGraphic.hEvent, this.input.dateFormat);
			const textMetrics = context.measureText(labelText);
			const textWidth = textMetrics.width;
			// Approximation usually sufficient for vertical center.
			const textHeight = this.input.textStyle.size;

			const startX = eventPos.start.x;
			const startY = eventPos.start.y;
			// We want to connect to the right-center side of the text.
			const endX = labelPos.coord.x + textWidth + 5;
			const endY = labelPos.coord.y - textHeight / 3;

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
}

///////////////////

class HorizontalCenterLabelCalculator extends LabelLayoutCalculator {
	// Offset for the first row of labels to avoid overlapping with the axis.
	private readonly firstRowOffsetY = 10;
	// Offset of the last row of labels to the bottom of the label area.
	private readonly lastRowOffsetY = 20;

	calculate(
		timelines: TimelineGraphic[],
		combinedTimeline: TimelineGraphic,
		layout: HgLayout
	): void {
		this.initTimelineLayoutLookup(timelines, layout);
		layout.labels.bounds = this.calcLabelAreaBounds();
		layout.labels.rotation = this.rotation;

		const positions = this.calcLabelPositions(combinedTimeline, layout);
		const paths = this.calcConnectorPaths(combinedTimeline, positions);

		// Combined separate position and path arrays into a label layout for each event.
		layout.labels.items = positions.map((labelPos, idx) => {
			return new LabelLayout(labelPos, paths[idx]);
		});
	}

	clear(): void {
	}

	private calcLabelPositions(
		combinedTimeline: TimelineGraphic,
		layout: HgLayout
	) {
		const canvas = document.createElement('canvas');
		const context = canvas.getContext('2d');
		if (!context)
			throw new Error('Unable to create 2d canvas context.');

		context.font = makeFont(this.input.textStyle);

		const numVisibleEvents = this.countVisibleEvents(combinedTimeline);
		const rowHeight = this.calculateRowHeight(
			layout, numVisibleEvents, this.firstRowOffsetY, this.lastRowOffsetY);
		const initialRowY = layout.labels.bounds.bottom + this.firstRowOffsetY;
		// Rightmost coordinate of drawn labels for each row.
		const maxXPerRow: number[] = [];

		const labelPositions = combinedTimeline.eventGraphics.map(eventGraphic => {
			const tlLayout = this.getTimelineLayout(eventGraphic);
			const eventPos = tlLayout.eventPositions[eventGraphic.hEvent.eventIdx];
			const isLabelVisible = tlLayout.axis.contains(eventPos.start);

			// Calculate the position of the label.
			let labelPos = Point2D.invalid();
			if (isLabelVisible) {
				const labelText = formatEventLabel(eventGraphic.hEvent, this.input.dateFormat);
				const textMetrics = context.measureText(labelText);
				const textWidth = textMetrics.width;

				const labelX = eventPos.start.x - textWidth / 2;
				const rowIdx = this.findRow(labelX, maxXPerRow);
				const labelY = initialRowY + (rowIdx + 1) * rowHeight;

				// Update max x-coordinate for the used row.
				maxXPerRow[rowIdx] = Math.max(maxXPerRow[rowIdx] || 0, labelX + textWidth);

				labelPos.x = labelX;
				labelPos.y = labelY;
			}

			return new LabelPosition(
					eventGraphic,
					labelPos
				);
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

	private calcConnectorPaths(
		combinedTimeline: TimelineGraphic,
		labelPositions: LabelPosition[]
	): SvgPath[] {

		return combinedTimeline.eventGraphics.map((eventGraphic, idx) => {
			const labelPos = labelPositions[idx];
			if (labelPos.coord.x === INVALID_POSITION_SENTINEL) {
				return '';
			}

			const tlLayout = this.getTimelineLayout(eventGraphic);
			const eventPos = tlLayout.eventPositions[eventGraphic.hEvent.eventIdx];

			const textHeight = this.input.textStyle.size;
			
			const startX = eventPos.start.x;
			const startY = eventPos.start.y;
			const endY = labelPos.coord.y - textHeight / 3;

			return `M ${startX} ${startY} L ${startX} ${endY - 10}`;
		});
	}
}

///////////////////

class NoneLabelCalculator extends LabelLayoutCalculator {

	calculate(
		timelines: TimelineGraphic[],
		combinedTimeline: TimelineGraphic,
		layout: HgLayout
	): void {
		this.initTimelineLayoutLookup(timelines, layout);
		layout.labels.bounds = this.calcLabelAreaBounds();
		layout.labels.rotation = this.rotation;

		layout.labels.items = combinedTimeline.eventGraphics.map(eventGraphic => {
			return new LabelLayout(new LabelPosition(eventGraphic, Point2D.invalid()), '');
		});
	}

	clear(): void {
	}
}

///////////////////

export function createLabelLayoutCalculator(format: LayoutFormat): LabelLayoutCalculator {
	switch (format) {
		case LayoutFormat.Vertical:
			return new VerticalLabelCalculator();
		case LayoutFormat.HorizontalLeft:
			return new HorizontalLeftLabelCalculator();
		case LayoutFormat.HorizontalCenter:
			return new HorizontalCenterLabelCalculator();
		case LayoutFormat.None:
			return new NoneLabelCalculator();
		default:
			throw new Error(`Invalid layout format: ${format}`);
	}
}
