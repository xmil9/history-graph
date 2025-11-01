import { computed, Injectable, input, signal } from '@angular/core';
import { Timeline } from '../model/timeline';
import { duration } from '../model/historic-date';
import { Point2D, Size2D } from '../graphics/gfx-coord-2d';
import { DEFAULT_LINE_STYLE, DEFAULT_TEXT_STYLE, LineStyle, TextStyle } from '../graphics/gfx-style';


// External data that affects the layout of events.
export interface EventLayoutFactors {
	viewSize: Size2D;
	axisStartPos: Point2D;
	axisEndPos: Point2D;
	markerSize: Size2D;
	textStyle: TextStyle;
	lineStyle: LineStyle;
}

const DEFAULT_FACTORS: EventLayoutFactors = {
	viewSize: new Size2D(0, 0),
	axisStartPos: new Point2D(0, 0),
	axisEndPos: new Point2D(0, 0),
	markerSize: new Size2D(8),
	textStyle: DEFAULT_TEXT_STYLE,
	lineStyle: DEFAULT_LINE_STYLE,
};

export enum EventLabelLayoutFormat {
	None = 'none',
	Vertical = 'vertical',
	Horizontal = 'horizontal',
}

interface LabelLayout {
	labelPositions: Point2D[];
	rotation: number;
	connectorPaths: string[];

	calculate(tlEventPos: Point2D[], factors: EventLayoutFactors): void;
	calculateConnectorPaths(tlEventPos: Point2D[]): string[]
	clear(): void;
}

class VerticalLabelLayout implements LabelLayout {
	labelPositions: Point2D[] = [];
	rotation: number = 90;
	connectorPaths: string[] = [];

	calculate(tlEventPos: Point2D[], factors: EventLayoutFactors): void {
		this.labelPositions = tlEventPos.map(pos => new Point2D(
			pos.x - factors.textStyle.size / 3,
			pos.y + factors.markerSize.height / 2 + 5
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

	calculate(tlEventPos: Point2D[], factors: EventLayoutFactors): void {
		const tlEventsInView = tlEventPos.filter(pos => this.isInView(pos, factors));
		const tlEventsInViewCount = tlEventsInView.length;
		const rowHeight = (factors.viewSize.height - factors.axisStartPos.y) / tlEventsInViewCount;

		this.labelPositions = this.calculateLabelPositions(tlEventPos, factors, rowHeight);
		// Connector paths are calculated in the component after DOM is ready
		// So we initialize them as empty strings
		this.connectorPaths = tlEventPos.map(() => '');
	}

	calculateConnectorPaths(tlEventPos: Point2D[]): string[] {
		this.connectorPaths = tlEventPos.map((markerPos, index) => {
			// Find the label text element
			const labelElement = document.querySelector(`#event-label-${index}`) as SVGTextElement | null;
			if (!labelElement) {
				console.warn('Failed to find label element for event ', index);
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

	private isInView(pos: Point2D, factors: EventLayoutFactors): boolean {
		return pos.x >= 0 && pos.x <= factors.viewSize.width;
	}

	private calculateLabelPositions(
		tlEventPos: Point2D[],
		factors: EventLayoutFactors,
		rowHeight: number
	): Point2D[] {
		let rowY = factors.axisStartPos.y;
		const rowX = factors.axisStartPos.x;

		return tlEventPos.map(pos => {
			if (this.isInView(pos, factors)) {
				rowY += rowHeight;
				return new Point2D(rowX, rowY);
			}
			return new Point2D(Number.MAX_VALUE, Number.MAX_VALUE);
		});
	}

}

class NoneLabelLayout implements LabelLayout {
	labelPositions: Point2D[] = [];
	rotation: number = 0;
	connectorPaths: string[] = [];

	calculate(tlEventPos: Point2D[], factors: EventLayoutFactors): void {
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

function createLabelLayout(layout: EventLabelLayoutFormat): LabelLayout {
	switch (layout) {
		case EventLabelLayoutFormat.Vertical:
			return new VerticalLabelLayout();
		case EventLabelLayoutFormat.Horizontal:
			return new HorizontalLabelLayout();
		case EventLabelLayoutFormat.None:
			return new NoneLabelLayout();
	}
}

///////////////////

@Injectable({
	providedIn: 'root'
})
export class EventLayoutService {
	tlEventPos = signal<Point2D[]>([]);
	labelLayoutFormat = EventLabelLayoutFormat.Horizontal;
	private labelLayout: LabelLayout = createLabelLayout(this.labelLayoutFormat);
	private factors = DEFAULT_FACTORS;
	private timeline?: Timeline;

	get labelPos(): Point2D[] {
		return this.labelLayout.labelPositions;
	}

	get labelRotation(): number {
		return this.labelLayout.rotation;
	}

	get labelConnectorPath(): string[] {
		return this.labelLayout.connectorPaths;
	}

	setLabelLayoutFormat(format: EventLabelLayoutFormat): void {
		this.labelLayoutFormat = format;
		this.labelLayout = createLabelLayout(format);
		this.calculateLayout(this.factors, this.timeline);
	}

	calculateLayout(factors: EventLayoutFactors, timeline?: Timeline): void {
		this.factors = factors;
		this.timeline = timeline;

		if (this.timeline === undefined || this.timeline.events.length === 0) {
			this.tlEventPos.set([]);
			this.labelLayout.clear();
			return;
		}

		this.tlEventPos.set(this.calculateEventPositions(this.timeline));
		this.labelLayout.calculate(this.tlEventPos(), this.factors);
	}

	private calculateEventPositions(timeline: Timeline): Point2D[] {
		const tlEventPositions: Point2D[] = [];

		const tlDuration = duration(timeline.from, timeline.to);
		const tlDistance = this.factors.axisEndPos.x - this.factors.axisStartPos.x;

		for (const event of timeline.events) {
			// Calculate position based on event date relative to timeline range.
			const eventRatio = duration(timeline.from, event.when) / tlDuration;
			const eventX = this.factors.axisStartPos.x + (eventRatio * tlDistance);

			tlEventPositions.push(new Point2D(eventX, this.factors.axisStartPos.y));
		}

		return tlEventPositions;
	}

	calculateConnectorPaths(): string[] {
		return this.labelLayout.calculateConnectorPaths(this.tlEventPos());
	}
}
