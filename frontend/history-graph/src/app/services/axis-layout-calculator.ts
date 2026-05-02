import { HgLayout, OverviewLayout, TimelineLayout, EventPosition } from "./layout-types";
import { INVALID_POSITION_SENTINEL, Point2D, Rect2D, Viewport2D } from "../graphics/gfx-coord-2d";
import { Tick } from "./tick-calculator";
import { LayoutFormat } from "./preference-types";
import { TimelineGraphic } from "./graphic-types";
import { HDate } from "../model/historic-date";
import { DateProjection } from "../model/projection";

///////////////////

export interface AxisLayoutCalculator {
	calculate(
		timelines: TimelineGraphic[],
		overviewTimeline: TimelineGraphic,
		layout: HgLayout
	): void;

	updateTickPositions(
		ticks: Tick[],
		layout: HgLayout
	): void;
}

enum DatePositionStatus {
	BeforeStart,
	AfterEnd,
	OnAxis
}

interface DatePosition {
	status: DatePositionStatus;
	position: Point2D;
}

///////////////////

class BaseAxisLayoutCalculator implements AxisLayoutCalculator {
	calculate(
		timelines: TimelineGraphic[],
		overviewTimeline: TimelineGraphic,
		layout: HgLayout
	): void {
		layout.timelines.items.forEach((tlLayout, index) => {
			this.calcTimelineLayout(
				tlLayout,
				timelines[index],
				overviewTimeline
			);
		});

		this.calcOverviewLayout(overviewTimeline, layout.overview);
	}

	protected calcTimelineLayout(
		tlLayout: TimelineLayout,
		tlGraphic: TimelineGraphic,
		overviewTimeline: TimelineGraphic,
	): void {
		this.calcTimelineAxisLayout(tlLayout, tlGraphic, overviewTimeline);
		this.calcTimelineEventLayout(tlLayout, tlGraphic);
	}

	protected calcTimelineAxisLayout(
		tlLayout: TimelineLayout,
		tlGraphic: TimelineGraphic,
		overviewTimeline: TimelineGraphic,
	): void {
		// Each timeline starts and ends with the same dates as the overview timeline.
		console.log('projection:', JSON.stringify(tlLayout.projection));
		console.log('axis start before:', tlLayout.axis.startPosition);
		console.log('start date ratio before:', tlLayout.projection.toRatio(overviewTimeline.timeline.period.from));
		tlLayout.axis.startPosition = tlLayout.projection.toPosition(overviewTimeline.timeline.period.from);
		console.log('axis start after:', tlLayout.axis.startPosition);
		console.log('start date ratio after:', tlLayout.projection.toRatio(overviewTimeline.timeline.period.from));
		tlLayout.axis.endPosition = tlLayout.projection.toPosition(overviewTimeline.timeline.period.to);
		tlLayout.axis.startLabelPosition = this.calcLabelPosition(tlLayout.axis.startPosition, tlLayout);
		tlLayout.axis.endLabelPosition = this.calcLabelPosition(tlLayout.axis.endPosition, tlLayout);
	}

	protected calcTimelineEventLayout(
		tlLayout: TimelineLayout,
		tlGraphic: TimelineGraphic,
	): void {
		const eventPeriodHeight = tlLayout.periodBarHeight / 2;

		tlLayout.eventPositions = tlGraphic.eventGraphics.map((eventGraphic) => {
			const start = this.calcDatePosition(
				eventGraphic.hEvent.when,
				tlLayout.projection,
				tlLayout.axis.bounds
			)!; // <-- Assert to be not undefined!
			const end = this.calcDatePosition(
				eventGraphic.hEvent.until,
				tlLayout.projection,
				tlLayout.axis.bounds
			);
			const periodBounds = this.calcPeriodBounds(
				start,
				end,
				tlLayout.axis.bounds,
				eventPeriodHeight
			);
			return new EventPosition(eventGraphic, start.position, end?.position, periodBounds);
		});	
	}

	protected calcDatePosition(
		date: HDate | undefined,
		projection: DateProjection,
		axisBounds: Rect2D
	): DatePosition | undefined {
		if (date === undefined) {
			return undefined;
		}

		const pos = projection.toPosition(date);

		if (pos.x < axisBounds.left)
			return { status: DatePositionStatus.BeforeStart, position: Point2D.invalid() };
		if (pos.x > axisBounds.right)
			return { status: DatePositionStatus.AfterEnd, position: Point2D.invalid() };
		return { status: DatePositionStatus.OnAxis, position: pos };
	}

	protected calcPeriodBounds(
		start: DatePosition,
		end: DatePosition | undefined,
		axisBounds: Rect2D,
		eventPeriodHeight: number
	): Rect2D | undefined {
		let left = start.position.x;
		let right = end?.position.x;

		// Check for no period bounds at all.
		// 1. If end is undefined, no period bounds.
		if (right === undefined)
			return undefined;
		// 2. If both start and end are outside the axis bounds but not on opposite sides, no period bounds.
		if (left === INVALID_POSITION_SENTINEL && right === INVALID_POSITION_SENTINEL &&
			!(start.status === DatePositionStatus.BeforeStart && end?.status === DatePositionStatus.AfterEnd))
			return undefined;
		// 3. If start is off to the right, no period bounds.
		if (left >= axisBounds.right && left !== INVALID_POSITION_SENTINEL)
			return undefined;
		// 4. If end is off to the left, no period bounds.
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

	protected calcOverviewLayout(ovTimeline: TimelineGraphic, ovLayout: OverviewLayout): void {
		ovLayout.combinedEventPositions = this.calcOverviewEvents(ovTimeline, ovLayout);
	}

	protected calcOverviewEvents(ovTimeline: TimelineGraphic, ovLayout: OverviewLayout): EventPosition[] {
		return ovTimeline.eventGraphics.map((eventGraphic) => {
			const start = this.calcDatePosition(
				eventGraphic.hEvent.when,
				ovLayout.projection,
				ovLayout.axisBounds
			)!;  // <-- Assert to be not undefined!
			const end = this.calcDatePosition(
				eventGraphic.hEvent.until,
				ovLayout.projection,
				ovLayout.axisBounds
			);
			const periodBounds = this.calcPeriodBounds(
				start,
				end,
				ovLayout.axisBounds,
				ovLayout.periodBarHeight / 2
			);
			return new EventPosition(eventGraphic, start.position, end?.position, periodBounds);
		});
	}

	protected calcTickPositions(
		ticks: Tick[],
		tlLayout: TimelineLayout
	): Point2D[] {
		return ticks.map((tick) => this.calcTickPosition(tick, tlLayout));
	}

	protected calcTickPosition(
		tick: Tick,
		tlLayout: TimelineLayout
	): Point2D {
		const datePos = this.calcDatePosition(
			tick.date,
			tlLayout.projection,
			tlLayout.axis.bounds
		);

		return datePos !== undefined ? datePos.position : Point2D.invalid();
	}

	protected calcTickLabelPositions(tlLayout: TimelineLayout): Point2D[] {
		return tlLayout.axis.tickPositions.map((tickPos) => this.calcLabelPosition(tickPos, tlLayout));
	}

	updateTickPositions(
		ticks: Tick[],
		layout: HgLayout
	): void {
		layout.timelines.items.forEach((tlLayout) => {
			tlLayout.axis.tickPositions = this.calcTickPositions(ticks, tlLayout);
			tlLayout.axis.tickLabelPositions = this.calcTickLabelPositions(tlLayout);
		});
	}
}

///////////////////

class VerticalAxisLayoutCalculator extends BaseAxisLayoutCalculator {
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
