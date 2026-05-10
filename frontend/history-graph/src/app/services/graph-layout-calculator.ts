import { Rect2D, Size2D, Viewport2D } from "../graphics/gfx-coord-2d";
import { TimelineGraphic } from "./graphic-types";
import { HgLayout, TimelineLayout } from "./layout-types";
import { LayoutFormat } from "./preference-types";
import { DateProjection, DEFAULT_DATE_PROJECTION } from "../model/projection";

export interface GraphLayoutCalculator {
	updateViewSize(
		viewSize: Size2D,
		timelines: TimelineGraphic[],
		overviewTimeline: TimelineGraphic,
		layout: HgLayout
	): void;

	updateViewport(
		viewport: Viewport2D,
		viewSize: Size2D,
		timelines: TimelineGraphic[],
		overviewTimeline: TimelineGraphic,
		layout: HgLayout
	): void;
}

///////////////////

class BaseGraphLayoutCalculator implements GraphLayoutCalculator {
	// Margins of the overview.
	protected readonly overviewAreaMargins = Rect2D.fromCoordinates(200, 25, 50, 0);
	// Height of the overview.
	protected readonly overviewViewHeight = 20;
	// Margins of the timelines area (excluding the overview).
	protected readonly timelinesAreaMargins = Rect2D.fromCoordinates(200, 60, 50, 0);
	// Height of a single timeline view.
	protected readonly timelineViewHeight = 60;

	updateViewSize(
		viewSize: Size2D,
		timelines: TimelineGraphic[],
		overviewTimeline: TimelineGraphic,
		layout: HgLayout
	) {
		layout.overview.bounds = this.calcOverviewAreaBounds(viewSize);
		layout.overview.axisBounds = this.calcOverviewAxisBounds(
			layout.overview.bounds,
			layout.overview.endMarkerSize
		);
		layout.overview.projection = new DateProjection(
			layout.overview.projection.viewport,
			layout.overview.axisBounds,
			overviewTimeline.timeline.period
		);

		layout.timelines.bounds = this.calcTimelinesAreaBounds(viewSize, timelines.length);
		layout.timelines.items = timelines.map(
			(tlGraphic, timelineIdx) => this.createTimelineLayout(
				layout.timelines.viewport,
				viewSize,
				timelineIdx,
				tlGraphic,
				overviewTimeline
			)
		);

		layout.overview.viewedBounds = this.calcOverviewViewedBounds(
			layout.timelines.viewport,
			layout.timelines.bounds,
			overviewTimeline,
			layout.overview.axisBounds
		);
	}

	updateViewport(
		viewport: Viewport2D,
		viewSize: Size2D,
		timelines: TimelineGraphic[],
		overviewTimeline: TimelineGraphic,
		layout: HgLayout
	) {
		layout.timelines.viewport = viewport;

		layout.timelines.items = timelines.map(
			(tlGraphic, timelineIdx) => this.createTimelineLayout(
				viewport,
				viewSize,
				timelineIdx,
				tlGraphic,
				overviewTimeline
			)
		);

		layout.overview.viewedBounds = this.calcOverviewViewedBounds(
			layout.timelines.viewport,
			layout.timelines.bounds,
			overviewTimeline,
			layout.overview.axisBounds
		);
	}

	protected calcOverviewAreaBounds(viewSize: Size2D): Rect2D {
		const left = this.overviewAreaMargins.left;
		return Rect2D.fromCoordinates(
			left,
			this.overviewAreaMargins.top,
			Math.max(viewSize.width - this.overviewAreaMargins.right, left + 1),
			this.overviewAreaMargins.top + this.overviewViewHeight
		);
	}

	protected calcOverviewAxisBounds(ovAreaBounds: Rect2D, ovEndMarkerSize: Size2D): Rect2D {
		return Rect2D.fromCoordinates(
			ovAreaBounds.left + ovEndMarkerSize.width, ovAreaBounds.top,
			ovAreaBounds.right - ovEndMarkerSize.width, ovAreaBounds.bottom
		);
	}

	protected calcOverviewViewedBounds(
		tlViewport: Viewport2D,
		tlAreaBounds: Rect2D,
		ovTimeline: TimelineGraphic,
		ovAxisBounds: Rect2D
	): Rect2D {
		const tlProjection = new DateProjection(
			tlViewport,
			tlAreaBounds,
			ovTimeline.timeline.period
		);

		// Calculate the virtual start and end position of the combined timelines.
		const combinedStartPos = tlProjection.toPosition(ovTimeline.timeline.period.from);
		const combinedEndPos = tlProjection.toPosition(ovTimeline.timeline.period.to);
		const combinedWidth = combinedEndPos.x - combinedStartPos.x;

		// Calculate the ratios of the timeline area coordinates to the entire virtual coordinates.
		const viewedLeftRatio = (combinedStartPos.x - tlAreaBounds.left) / combinedWidth;
		const viewedRightRatio = (combinedEndPos.x - tlAreaBounds.right) / combinedWidth;

		const viewedLeft = ovAxisBounds.clampX(ovAxisBounds.left - viewedLeftRatio * ovAxisBounds.width);
		const viewedRight = ovAxisBounds.clampX(ovAxisBounds.right - viewedRightRatio * ovAxisBounds.width);
		return Rect2D.fromCoordinates(viewedLeft, ovAxisBounds.top, viewedRight, ovAxisBounds.bottom);
	}

	protected calcTimelinesAreaBounds(viewSize: Size2D, numTimelines: number): Rect2D {
		return Rect2D.fromCoordinates(
			this.timelinesAreaMargins.left,
			this.timelinesAreaMargins.top,
			Math.max(viewSize.width - this.timelinesAreaMargins.right, this.timelinesAreaMargins.left + 1),
			this.timelinesAreaMargins.top + numTimelines * this.timelineViewHeight
		);
	}

	private createTimelineLayout(
		viewport: Viewport2D,
		viewSize: Size2D,
		timelineIdx: number,
		tlGraphic: TimelineGraphic,
		overviewTimeline: TimelineGraphic
	): TimelineLayout {
		const tlLayout = new TimelineLayout(tlGraphic.timeline.id);
		tlLayout.axis.bounds = this.calcTimelineAxisBounds(viewSize, timelineIdx);
		tlLayout.projection = new DateProjection(
			viewport,
			tlLayout.axis.bounds,
			overviewTimeline.timeline.period
		);
		return tlLayout;
	}

	private calcTimelineAxisBounds(viewSize: Size2D, timelineIdx: number): Rect2D {
		const top = this.timelinesAreaMargins.top + timelineIdx * this.timelineViewHeight;
		const bounds = Rect2D.fromCoordinates(
			this.timelinesAreaMargins.left,
			top,
			Math.max(viewSize.width - this.timelinesAreaMargins.right, this.timelinesAreaMargins.left + 1),
			top + this.timelineViewHeight
		);
		return bounds;
	}
}

///////////////////

class VerticalGraphLayoutCalculator extends BaseGraphLayoutCalculator {
}

///////////////////

class HorizontalLeftGraphLayoutCalculator extends BaseGraphLayoutCalculator {
}

///////////////////

class HorizontalCenterGraphLayoutCalculator extends BaseGraphLayoutCalculator {
}

///////////////////

class NoneGraphLayoutCalculator extends BaseGraphLayoutCalculator {
}

///////////////////

export function createGraphLayoutCalculator(format: LayoutFormat): GraphLayoutCalculator {
	switch (format) {
		case LayoutFormat.HorizontalLeft:
			return new HorizontalLeftGraphLayoutCalculator();
		case LayoutFormat.HorizontalCenter:
			return new HorizontalCenterGraphLayoutCalculator();
		case LayoutFormat.Vertical:
			return new VerticalGraphLayoutCalculator();
		case LayoutFormat.None:
			return new NoneGraphLayoutCalculator();
		default:
			throw new Error(`[GraphLayoutCalculator] - Invalid layout format: ${format}`);
	}
}
