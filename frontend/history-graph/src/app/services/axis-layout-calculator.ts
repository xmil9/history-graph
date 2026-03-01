import { HgLayout, TimelineViewport, DEFAULT_LAYOUT_INPUT, LayoutInput, EventPosition } from "./layout-types";
import { INVALID_POSITION_SENTINEL, Point2D, Rect2D } from "../graphics/gfx-coord-2d";
import { Tick } from "./tick-calculator";
import { LayoutFormat } from "./preference-types";
import { OverviewLayout, TimelineLayout } from "./layout-types";
import { TimelineGraphic } from "./graphic-types";
import { duration, HDate } from "../model/historic-date";

///////////////////

export interface AxisLayoutCalculator {
	labelRotation: number;

	setInput(input: LayoutInput): void;

	calculate(
		timelines: TimelineGraphic[],
		combinedTimeline: TimelineGraphic,
		targetViewport: TimelineViewport,
		ticks: Tick[],
		layout: HgLayout
	): void;

	pan(
		timelines: TimelineGraphic[],
		combinedTimeline: TimelineGraphic,
		start: Point2D,
		delta: Point2D,
		ticks: Tick[],
		layout: HgLayout
	): void;

	zoom(
		timelines: TimelineGraphic[],
		combinedTimeline: TimelineGraphic,
		at: Point2D,
		factor: number,
		ticks: Tick[],
		layout: HgLayout
	): void;
}

///////////////////

class BaseAxisLayoutCalculator implements AxisLayoutCalculator {
	labelRotation: number = 0;
	protected input: LayoutInput = DEFAULT_LAYOUT_INPUT;
	protected readonly displayMargins = Rect2D.fromCoordinates(200, 60, 50, 0);
	protected readonly displayHeight = 60;
	protected readonly overviewMargins = Rect2D.fromCoordinates(200, 25, 50, 0);
	protected readonly overviewHeight = 20;

	setInput(input: LayoutInput): void {
		this.input = input;
	}

	calculate(
		timelines: TimelineGraphic[],
		combinedTimeline: TimelineGraphic,
		targetViewport: TimelineViewport,
		ticks: Tick[],
		layout: HgLayout
	): void {
		layout.timelines.bounds = this.calcCombinedTimelinesBounds(layout);

		layout.timelines.items = timelines.map((tlGraphic) => new TimelineLayout(tlGraphic.timeline.id));
		layout.timelines.items.forEach((tlLayout, index) => {
				this.calcTimelineLayout(
					timelines[index],
					combinedTimeline,
					targetViewport,
					ticks,
					index,
					tlLayout
				);
			});

		this.calcOverviewLayout(combinedTimeline, layout);

		this.updateViewport(layout);
	}

	protected calcCombinedTimelinesBounds(layout: HgLayout): Rect2D {
		return Rect2D.fromCoordinates(
			this.displayMargins.left,
			this.displayMargins.top,
			Math.max(this.input.viewSize.width - this.displayMargins.right, this.displayMargins.left + 1),
			this.displayMargins.top + this.displayHeight * layout.timelines.items.length
		);
	}

	protected calcTimelineLayout(
		timeline: TimelineGraphic,
		combinedTimeline: TimelineGraphic,
		targetViewport: TimelineViewport,
		ticks: Tick[],
		timelineIdx: number,
		tlLayout: TimelineLayout
	): void {
		this.calcTimelineAxisLayout(targetViewport, ticks, timelineIdx, tlLayout);
		this.calcTimelineEventLayout(timeline, combinedTimeline, tlLayout);
	}

	protected calcTimelineAxisLayout(
		targetViewport: TimelineViewport,
		ticks: Tick[],
		timelineIdx: number,
		tlLayout: TimelineLayout
	): void {
		const top = this.displayMargins.top + timelineIdx * this.displayHeight;
		const bounds = Rect2D.fromCoordinates(
			this.displayMargins.left,
			top,
			Math.max(this.input.viewSize.width - this.displayMargins.right, this.displayMargins.left + 1),
			top + this.displayHeight
		);

		tlLayout.axis.bounds = bounds;
		tlLayout.axis.startPosition = new Point2D(
			bounds.left + (targetViewport.startRatio * bounds.width),
			bounds.center.y
		);
		tlLayout.axis.endPosition = new Point2D(
			bounds.left + (targetViewport.endRatio * bounds.width),
			bounds.center.y
		);
		tlLayout.axis.startLabelPosition = this.calcLabelPosition(tlLayout.axis.startPosition, tlLayout);
		tlLayout.axis.endLabelPosition = this.calcLabelPosition(tlLayout.axis.endPosition, tlLayout);
		tlLayout.axis.tickPositions = this.calcTickPositions(ticks, tlLayout);
		tlLayout.axis.tickLabelPositions = this.calcTickLabelPositions(tlLayout);
	}

	protected calcTimelineEventLayout(
		tlGraphic: TimelineGraphic,
		combinedTimeline: TimelineGraphic,
		tlLayout: TimelineLayout
	): void {
		const eventPeriodHeight = tlLayout.periodBarHeight / 2;

		tlLayout.eventPositions = tlGraphic.eventGraphics.map((eventGraphic) => {
			const start = this.calcDatePosition(
				eventGraphic.hEvent.when,
				combinedTimeline,
				tlLayout.axis.startPosition,
				tlLayout.axis.endPosition,
				tlLayout.axis.bounds
			)!; // <-- Assert to be not undefined!
			const end = this.calcDatePosition(
				eventGraphic.hEvent.until,
				combinedTimeline,
				tlLayout.axis.startPosition,
				tlLayout.axis.endPosition,
				tlLayout.axis.bounds
			);
			const periodBounds = this.calcPeriodBounds(
				start,
				end,
				tlLayout.axis.bounds,
				eventPeriodHeight
			);
			return new EventPosition(eventGraphic, start, end, periodBounds);
		});	
	}

	protected calcDatePosition(
		date: HDate | undefined,
		combinedTimeline: TimelineGraphic,
		axisStartPos: Point2D,
		axisEndPos: Point2D,
		axisBounds: Rect2D
	): Point2D | undefined {
		if (date === undefined) {
			return undefined;
		}

		const axisDistance = axisEndPos.x - axisStartPos.x;

		const dateRatio = duration(combinedTimeline.from, date) / combinedTimeline.duration;
		const dateX = axisStartPos.x + (dateRatio * axisDistance);
		const pos = new Point2D(dateX, axisStartPos.y);

		return axisBounds.contains(pos) ? pos : Point2D.invalid();
	}

	protected calcPeriodBounds(
		start: Point2D,
		end: Point2D | undefined,
		axisBounds: Rect2D,
		eventPeriodHeight: number
	): Rect2D | undefined {
		let left = start.x;
		let right = end?.x;

		// Check for no period bounds at all.
		if (right === undefined)
			return undefined;
		if (left === INVALID_POSITION_SENTINEL && right === INVALID_POSITION_SENTINEL)
			return undefined;
		if (left >= axisBounds.right && left !== INVALID_POSITION_SENTINEL)
			return undefined;
		if (right <= axisBounds.left && right !== INVALID_POSITION_SENTINEL)
			return undefined;

		// Clip to axis bounds.
		if (left < axisBounds.left || left === INVALID_POSITION_SENTINEL)
			left = axisBounds.left;
		if (right > axisBounds.right || right === INVALID_POSITION_SENTINEL)
			right = axisBounds.right;

		const axisY = axisBounds.center.y;
		const top = axisY - eventPeriodHeight;
		const bottom = axisY + eventPeriodHeight;

		return Rect2D.fromCoordinates(left, top, right, bottom);
	}

	protected calcLabelPosition(axisPos: Point2D, tlLayout: TimelineLayout): Point2D {
		const labelPos = new Point2D(
			axisPos.x - 15,
			axisPos.y + tlLayout.eventMarkerSize.height / 2 + 20
		);
		return tlLayout.clip(labelPos);
	}

	protected calcTickPositions(ticks: Tick[], tlLayout: TimelineLayout): Point2D[] {
		const tlLength = tlLayout.axis.endPosition.x - tlLayout.axis.startPosition.x;
		return ticks.map((tick) => this.calcTickPosition(tick, tlLayout, tlLength));
	}

	protected calcTickPosition(tick: Tick, tlLayout: TimelineLayout, tlLength: number): Point2D {
		return tlLayout.axis.clip(new Point2D(
			tlLayout.axis.startPosition.x + (tick.tlRatio * tlLength),
			tlLayout.axis.startPosition.y
		));
	}

	protected calcTickLabelPositions(tlLayout: TimelineLayout): Point2D[] {
		return tlLayout.axis.tickPositions.map((tickPos) => this.calcLabelPosition(tickPos, tlLayout));
	}

	protected calcOverviewLayout(combinedTimeline: TimelineGraphic, layout: HgLayout): void {
		layout.overview.bounds = this.calcOverviewBounds();
		layout.overview.axisBounds = this.calcOverviewAxisBounds(layout.overview);
		layout.overview.viewedBounds = this.calcOverviewViewedBounds(layout);
		layout.overview.combinedEventPositions = this.calcOverviewEvents(combinedTimeline, layout);
	}

	protected calcOverviewBounds(): Rect2D {
		const left = this.overviewMargins.left;
		return Rect2D.fromCoordinates(
			left,
			this.overviewMargins.top,
			Math.max(this.input.viewSize.width - this.overviewMargins.right, left + 1),
			this.overviewMargins.top + this.overviewHeight
		);
	}

	protected calcOverviewAxisBounds(ovLayout: OverviewLayout): Rect2D {
		return Rect2D.fromCoordinates(
			ovLayout.bounds.left + ovLayout.endMarkerSize.width, ovLayout.bounds.top,
			ovLayout.bounds.right - ovLayout.endMarkerSize.width, ovLayout.bounds.bottom
		);
	}

	protected calcOverviewViewedBounds(layout: HgLayout): Rect2D {
		const virtualBounds = this.calcVirtualCombinedTimelineBounds(layout);
		const viewedLeftRatio = (virtualBounds.left - layout.timelines.bounds.left) / virtualBounds.width;
		let viewedLeft =
			layout.overview.axisBounds.clampX(
				layout.overview.axisBounds.left - (viewedLeftRatio * layout.overview.axisBounds.width)
			);

		const viewedRightRatio = (virtualBounds.right - layout.timelines.bounds.right) / virtualBounds.width;
		let viewedRight =
			layout.overview.axisBounds.clampX(
				layout.overview.axisBounds.right - (viewedRightRatio * layout.overview.axisBounds.width)
			);

		return Rect2D.fromCoordinates(
			viewedLeft, layout.overview.axisBounds.top,
			viewedRight, layout.overview.axisBounds.bottom);
	}

	private calcVirtualCombinedTimelineBounds(layout: HgLayout): Rect2D {
		const leftMost =
			layout.timelines.items.map(
				tl => tl.axis.startPosition.x
			).reduce(
				(a, b) => Math.min(a, b), Infinity
			);
		const rightMost =
			layout.timelines.items.map(
				tl => tl.axis.endPosition.x
			).reduce(
				(a, b) => Math.max(a, b), -Infinity
			);

		return Rect2D.fromCoordinates(
			leftMost, layout.timelines.bounds.top,
			rightMost, layout.timelines.bounds.bottom);
	}

	protected calcOverviewEvents(combinedTimeline: TimelineGraphic, layout: HgLayout): EventPosition[] {
		const axisStartPos = new Point2D(layout.overview.axisBounds.left, layout.overview.axisBounds.center.y);
		const axisEndPos = new Point2D(layout.overview.axisBounds.right, layout.overview.axisBounds.center.y);

		return combinedTimeline.eventGraphics.map((eventGraphic) => {
			const start = this.calcDatePosition(
				eventGraphic.hEvent.when,
				combinedTimeline,
				axisStartPos,
				axisEndPos,
				layout.overview.axisBounds
			)!;
			const end = this.calcDatePosition(
				eventGraphic.hEvent.until,
				combinedTimeline,
				axisStartPos,
				axisEndPos,
				layout.overview.axisBounds
			);
			const periodBounds = this.calcPeriodBounds(
				start,
				end,
				layout.overview.axisBounds,
				layout.overview.periodBarHeight / 2
			);
			return new EventPosition(eventGraphic, start, end, periodBounds);
		});
	}

	pan(
		timelines: TimelineGraphic[],
		combinedTimeline: TimelineGraphic,
		start: Point2D,
		delta: Point2D,
		ticks: Tick[],
		layout: HgLayout
	): void {
		const isInAxis = layout.timelines.bounds.contains(start);
		const isInOverview = layout.overview.axisBounds.contains(start);
		if (!isInAxis && !isInOverview) {
			return;
		}

		if (isInOverview) {
			const acceleration = -10;
			delta = new Point2D(acceleration * delta.x, acceleration * delta.y);
		}

		layout.timelines.items.forEach((tlLayout, index) => this.panTimeline(
			timelines[index], combinedTimeline, start, delta, ticks, tlLayout));
		this.panOverview(start, delta, layout);

		this.updateViewport(layout);
	}

	private panTimeline(
		timeline: TimelineGraphic,
		combinedTimeline: TimelineGraphic,
		start: Point2D,
		delta: Point2D,
		ticks: Tick[],
		tlLayout: TimelineLayout
	): void {
		tlLayout.axis.startPosition = tlLayout.axis.startPosition.translate(delta.x, delta.y);
		tlLayout.axis.endPosition = tlLayout.axis.endPosition.translate(delta.x, delta.y);
		tlLayout.axis.startLabelPosition = this.calcLabelPosition(tlLayout.axis.startPosition, tlLayout);
		tlLayout.axis.endLabelPosition = this.calcLabelPosition(tlLayout.axis.endPosition, tlLayout);
		tlLayout.axis.tickPositions = this.calcTickPositions(ticks, tlLayout);
		tlLayout.axis.tickLabelPositions = this.calcTickLabelPositions(tlLayout);

		this.calcTimelineEventLayout(timeline, combinedTimeline, tlLayout);
	}

	private panOverview(start: Point2D, delta: Point2D, layout: HgLayout): void {
		layout.overview.viewedBounds = this.calcOverviewViewedBounds(layout);
	}

	zoom(
		timelines: TimelineGraphic[],
		combinedTimeline: TimelineGraphic,
		at: Point2D,
		factor: number,
		ticks: Tick[],
		layout: HgLayout
	): void {
		const isInAxis = layout.timelines.bounds.contains(at);
		const isInOverview = layout.overview.axisBounds.contains(at);
		if (!isInAxis && !isInOverview) {
			return;
		}

		layout.timelines.items.forEach((tlLayout, index) => this.zoomTimeline(
			timelines[index], combinedTimeline, at, factor, ticks, tlLayout));
		this.zoomOverview(at, factor, layout);

		this.updateViewport(layout);
	}

	private zoomTimeline(
		timeline: TimelineGraphic,
		combinedTimeline: TimelineGraphic,
		at: Point2D,
		factor: number,
		ticks: Tick[],
		tlLayout: TimelineLayout
	): void {
		let centerX = at.x;
		if (centerX < tlLayout.axis.startPosition.x) {
			centerX = tlLayout.axis.startPosition.x;
		} else if (centerX > tlLayout.axis.endPosition.x) {
			centerX = tlLayout.axis.endPosition.x;
		}

		const startDelta = (tlLayout.axis.startPosition.x - centerX) * factor;
		tlLayout.axis.startPosition = new Point2D(centerX + startDelta, tlLayout.axis.startPosition.y);

		const endDelta = (tlLayout.axis.endPosition.x - centerX) * factor;
		tlLayout.axis.endPosition = new Point2D(centerX + endDelta, tlLayout.axis.endPosition.y);

		tlLayout.axis.startLabelPosition = this.calcLabelPosition(tlLayout.axis.startPosition, tlLayout);
		tlLayout.axis.endLabelPosition = this.calcLabelPosition(tlLayout.axis.endPosition, tlLayout);

		tlLayout.axis.tickPositions = this.calcTickPositions(ticks, tlLayout);
		tlLayout.axis.tickLabelPositions = this.calcTickLabelPositions(tlLayout);

		this.calcTimelineEventLayout(timeline, combinedTimeline, tlLayout);
	}

	private zoomOverview(at: Point2D, factor: number, layout: HgLayout): void {
		layout.overview.viewedBounds = this.calcOverviewViewedBounds(layout);
	}

	private updateViewport(layout: HgLayout): void {
		const virtualBounds = this.calcVirtualCombinedTimelineBounds(layout);
		const startRatio = (virtualBounds.left - layout.timelines.bounds.left) / layout.timelines.bounds.width;
		const endRatio = (virtualBounds.right - layout.timelines.bounds.left) / layout.timelines.bounds.width;
		
		if (endRatio > startRatio) {
			layout.timelines.viewport = { startRatio, endRatio };
		}
	}
}

///////////////////

class VerticalAxisLayoutCalculator extends BaseAxisLayoutCalculator {
	override labelRotation: number = 90;

	protected override calcLabelPosition(axisPos: Point2D, tlLayout: TimelineLayout): Point2D {
		const labelPos = new Point2D(
			axisPos.x - 5,
			axisPos.y + tlLayout.eventMarkerSize.height / 2 + 7
		);
		return tlLayout.clip(labelPos);
	}
}

///////////////////

class HorizontalLeftAxisLayoutCalculator extends BaseAxisLayoutCalculator {
	protected override displayMargins = Rect2D.fromCoordinates(300, 60, 50, 0);
	protected override overviewMargins = Rect2D.fromCoordinates(300, 25, 50, 0);
}

///////////////////

class HorizontalCenterAxisLayoutCalculator extends BaseAxisLayoutCalculator {
}

///////////////////

class NoneAxisLayoutCalculator extends BaseAxisLayoutCalculator {
}

///////////////////

export function createAxisLayoutCalculator(format: LayoutFormat): AxisLayoutCalculator {
	switch (format) {
		case LayoutFormat.HorizontalLeft:
			return new HorizontalLeftAxisLayoutCalculator();
		case LayoutFormat.HorizontalCenter:
			return new HorizontalCenterAxisLayoutCalculator();
		case LayoutFormat.Vertical:
			return new VerticalAxisLayoutCalculator();
		case LayoutFormat.None:
			return new NoneAxisLayoutCalculator();
		default:
			throw new Error(`[AxisLayoutCalculator] - Invalid layout format: ${format}`);
	}
}
