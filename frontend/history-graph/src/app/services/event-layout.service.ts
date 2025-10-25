import { computed, Injectable, input, signal } from '@angular/core';
import { Timeline } from '../model/timeline';
import { duration } from '../model/historic-date';
import { Point2D, Size2D } from '../graphics/gfx-coord-2d';
import { DEFAULT_LINE_STYLE, DEFAULT_TEXT_STYLE, LineStyle, TextStyle } from '../graphics/gfx-style';

export enum EventLabelLayoutFormat {
	None = 'none',
	Vertical = 'vertical',
	Horizontal = 'horizontal',
}

interface LabelLayout {
	pos: Point2D[];
	rotation: number;

	calculate(tlEventPos: Point2D[], factors: EventLayoutFactors): void;
	clear(): void;
}

class VerticalLabelLayout implements LabelLayout {
	pos: Point2D[] = [];
	rotation: number = 0;

	calculate(tlEventPos: Point2D[], factors: EventLayoutFactors): void {
		this.pos = tlEventPos.map(pos => new Point2D(
			pos.x - factors.textStyle.size / 3,
			pos.y + factors.markerSize.height / 2 + 5
		));
		this.rotation = 90;
	}

	clear(): void {
		this.pos = [];
		this.rotation = 0;
	}
}

class HorizontalLabelLayout implements LabelLayout {
	pos: Point2D[] = [];
	rotation: number = 0;

	calculate(tlEventPos: Point2D[], factors: EventLayoutFactors): void {
		this.pos = tlEventPos.map(pos => new Point2D(
			pos.x - factors.textStyle.size / 3,
			pos.y + factors.markerSize.height / 2 + 20
		));
		this.rotation = 0;
	}

	clear(): void {
		this.pos = [];
		this.rotation = 0;
	}
}

class NoneLabelLayout implements LabelLayout {
	pos: Point2D[] = [];
	rotation: number = 0;

	calculate(tlEventPos: Point2D[], factors: EventLayoutFactors): void {
		this.pos = tlEventPos.map(pos => new Point2D(pos.x, pos.y));
		this.rotation = 0;
	}

	clear(): void {
		this.pos = [];
		this.rotation = 0;
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

export interface EventLayoutFactors {
	axisStartPos: Point2D;
	axisEndPos: Point2D;
	markerSize: Size2D;
	textStyle: TextStyle;
	lineStyle: LineStyle;
}

const DEFAULT_FACTORS: EventLayoutFactors = {
	axisStartPos: new Point2D(0, 0),
	axisEndPos: new Point2D(0, 0),
	markerSize: new Size2D(8),
	textStyle: DEFAULT_TEXT_STYLE,
	lineStyle: DEFAULT_LINE_STYLE,
};

@Injectable({
	providedIn: 'root'
})
export class EventLayoutService {
	tlEventPos = signal<Point2D[]>([]);
	labelLayoutFormat = EventLabelLayoutFormat.None;
	private labelLayout: LabelLayout = createLabelLayout(this.labelLayoutFormat);
	private factors = DEFAULT_FACTORS;
	private timeline?: Timeline;

	get labelPos(): Point2D[] {
		return this.labelLayout.pos;
	}

	get labelRotation(): number {
		return this.labelLayout.rotation;
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

		const tlEventPositions: Point2D[] = [];

		const tlDuration = duration(this.timeline.from, this.timeline.to);
		const tlDistance = this.factors.axisEndPos.x - this.factors.axisStartPos.x;

		console.debug('Timeline events:', this.timeline.events.length);
		console.debug('Timeline duration:', tlDuration);
		console.debug('Timeline distance:', tlDistance);

		for (const event of this.timeline.events) {
			// Calculate position based on event date relative to timeline range.
			const eventRatio = duration(this.timeline.from, event.when) / tlDuration;
			const eventX = this.factors.axisStartPos.x + (eventRatio * tlDistance);

			tlEventPositions.push(new Point2D(eventX, this.factors.axisStartPos.y));
		}

		this.tlEventPos.set(tlEventPositions);

		this.labelLayout.calculate(tlEventPositions, this.factors);
	}
}

