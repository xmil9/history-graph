import { INVALID_POSITION, Point2D, Rect2D, Size2D } from "../graphics/gfx-coord-2d";
import { DEFAULT_LINE_STYLE, DEFAULT_TEXT_STYLE, LineStyle, TextStyle } from "../graphics/gfx-style";
import { DEFAULT_DATE_FORMAT, HDateFormat } from "../model/historic-date";
import { EventGraphic } from "./graphic-types";

const DEFAULT_AXIS_BORDER_MARKER_SIZE = new Size2D(16);
const DEFAULT_AXIS_EVENT_MARKER_SIZE = new Size2D(8);
const DEFAULT_AXIS_PERIOD_BAR_HEIGHT = 20;
const DEFAULT_AXIS_TICK_MARKER_SIZE = new Size2D(8);

const DEFAULT_OVERVIEW_BORDER_MARKER_SIZE = new Size2D(10);
const DEFAULT_OVERVIEW_EVENT_MARKER_SIZE = new Size2D(5);
const DEFAULT_OVERVIEW_PERIOD_BAR_HEIGHT = 8;

export class HgLayout {
	overview = new OverviewLayout();
	timelines = new TimelinesLayout();
	labels = new LabelsLayout();
}

export class OverviewLayout {
	// On-screen bounds of the overview display area.
	bounds = Rect2D.empty();
	// On-screen bounds of the axis display area in the overview.
	// These are slightly smaller than the overview bounds to leave space 
	// for the shadow of the non-displayed time frame.
	axisBounds = Rect2D.empty();
	// On-screen bounds of the time period viewed in the overview.
	viewedBounds = Rect2D.empty();
	// Combined event positions of all timelines.
	combinedEventPositions: EventPosition[] = [];
	// Size of the start/end markers on the overview axis.
	endMarkerSize = DEFAULT_OVERVIEW_BORDER_MARKER_SIZE;
	// Size of the event markers on the overview axis.
	eventMarkerSize = DEFAULT_OVERVIEW_EVENT_MARKER_SIZE;
	// Height of period bars in the overview.
	periodBarHeight = DEFAULT_OVERVIEW_PERIOD_BAR_HEIGHT;
}

export class TimelinesLayout {
	// On-screen bounds of the entire timelines display area.
	bounds = Rect2D.empty();
	// Individual timeline layouts.
	items: TimelineLayout[] = [];
	// The current viewport of the timeline axes.
	viewport: TimelineViewport = DEFAULT_VIEWPORT;
}

export class TimelineLayout {
	axis = new AxisLayout();
	eventPositions: EventPosition[] = [];
	// Size of the event markers on the timeline axis.
	eventMarkerSize = DEFAULT_AXIS_EVENT_MARKER_SIZE;
	// Height of period bars in the timeline.
	periodBarHeight = DEFAULT_AXIS_PERIOD_BAR_HEIGHT;

	constructor(readonly timelineId: number) {
	}

	contains(pos: Point2D): boolean {
		return this.axis.contains(pos);
	}
	clip(pos: Point2D): Point2D {
		return this.contains(pos) ? pos : INVALID_POSITION;
	}
}

export class AxisLayout {
	// On-screen bounds of the axis display area.
	bounds = Rect2D.empty();
	// On-screen position of the start of the axis.
	startPosition = Point2D.empty();
	// On-screen position of the end of the axis.
	endPosition = Point2D.empty();
	// On-screen position of the start label.
	startLabelPosition = Point2D.empty();
	// On-screen position of the end label.
	endLabelPosition = Point2D.empty();
	// Size of the start/end markers on the axis.
	endMarkerSize = DEFAULT_AXIS_BORDER_MARKER_SIZE;
	// On-screen positions of the axis ticks.
	tickPositions: Point2D[] = [];
	// On-screen positions of the axis tick labels.
	tickLabelPositions: Point2D[] = [];
	// Size of the tick markers on the axis.
	tickMarkerSize = DEFAULT_AXIS_TICK_MARKER_SIZE;

	contains(pos: Point2D): boolean {
		return this.bounds.contains(pos);
	}
	clip(pos: Point2D): Point2D {
		return this.contains(pos) ? pos : INVALID_POSITION;
	}
}

export class LabelsLayout {
	bounds = Rect2D.empty();
	rotation: number = 0;
	items: LabelLayout[] = [];
}

export type SvgPath = string;

export class LabelLayout {
	position: LabelPosition;
	connectorPath: SvgPath;

	constructor(position: LabelPosition, connectorPath: SvgPath) {
		this.position = position;
		this.connectorPath = connectorPath;
	}
}

export class EventPosition {
	// Back reference to the event graphic.
	event: EventGraphic;
	start: Point2D;
	end?: Point2D;
	periodBounds?: Rect2D;

	constructor(event: EventGraphic, start: Point2D, end?: Point2D, periodBounds?: Rect2D) {
		this.event = event;
		this.start = start;
		this.end = end;
		this.periodBounds = periodBounds;
	}
}

export class LabelPosition {
	// Back reference to the event graphic.
	event: EventGraphic;
	coord: Point2D;

	constructor(event: EventGraphic, position: Point2D) {
		this.event = event;
		this.coord = position;
	}
}

export interface TimelineViewport {
	// Start and end positions of combined timeline period relative to the axis display bounds.
	startRatio: number;
	endRatio: number;
}

export const DEFAULT_VIEWPORT: TimelineViewport = {
	startRatio: 0,
	endRatio: 1,
};

// External data that affects the layout calculation.
export interface LayoutInput {
	viewSize: Size2D;
	textStyle: TextStyle;
	lineStyle: LineStyle;
	dateFormat: HDateFormat;
}

export const DEFAULT_LAYOUT_INPUT: LayoutInput = {
	viewSize: new Size2D(0, 0),
	textStyle: DEFAULT_TEXT_STYLE,
	lineStyle: DEFAULT_LINE_STYLE,
	dateFormat: DEFAULT_DATE_FORMAT,
};
