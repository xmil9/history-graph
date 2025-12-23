import { computed, inject, Injectable, Signal, signal } from "@angular/core";
import { LayoutFormat } from "./preference-types";
import { Point2D, Rect2D, Size2D, INVALID_POSITION } from "../graphics/gfx-coord-2d";
import { DEFAULT_TEXT_STYLE, TextStyle } from "../graphics/gfx-style";
import { TimelineService } from "./timeline.service";
import { duration, HDate } from "../model/historic-date";
import { Timeline } from "../model/timeline";
import { DEFAULT_DATE_FORMAT, HDateFormat } from "../model/historic-date";

// External data that affects the layout of events.
export interface AxisLayoutInput {
	viewSize: Size2D;
	textStyle: TextStyle;
	dateFormat: HDateFormat;
}

const DEFAULT_INPUT: AxisLayoutInput = {
	viewSize: new Size2D(0, 0),
	textStyle: DEFAULT_TEXT_STYLE,
	dateFormat: DEFAULT_DATE_FORMAT,
};

interface AxisViewport {
	// Start and end positions relative to the axis display bounds.
	startRatio: number;
	endRatio: number;
}

const DEFAULT_VIEWPORT: AxisViewport = {
	startRatio: 0,
	endRatio: 1,
};

interface AxisLayout {
	// On-screen bounds of the main axis display area.
	displayBounds: Rect2D;
	// Virtual start and end positions of the main axis. These can be outside of the display bounds.
	startPosition: Point2D;
	endPosition: Point2D;
	// On-screen positions of the main axis labels. If a label is not visible, the position is set to
	// a sentinel value.
	startLabelPosition: Point2D;
	endLabelPosition: Point2D;
	// Rotation angle of the main axis labels.
	labelRotation: number;
	// Height of the period bars.
	periodBoundsHeight: number;
	// On-screen positions of the main axis ticks. If a tick is not visible, the position is set to
	// a sentinel value.
	tickPositions: Point2D[];
	// On-screen positions of the main axis tick labels. If a label is not visible, the position is set to
	// a sentinel value.
	tickLabelPositions: Point2D[];
	// Axis marker sizes.
	axisMarkerSize: Size2D;
	eventMarkerSize: Size2D;
	tickMarkerSize: Size2D;

	// On-screen bounds of the overview display area.
	overviewBounds: Rect2D;
	// On-screen bounds of the axis display area in the overview.
	// These are slightly smaller than the overview bounds to leave space 
	// for the shadow of the non-displayed time frame.
	overviewAxisBounds: Rect2D;
	// On-screen bounds of the time frame displayed in the overview.
	overviewDisplayedBounds: Rect2D;
	// Overview marker sizes.
	overviewMarkerSize: Size2D;
	overviewEventMarkerSize: Size2D;
	// Height of the period bars in the overview.
	overviewPeriodBoundsHeight: number;

	// The current viewport of the timeline.
	viewport: AxisViewport;

	calculate(input: AxisLayoutInput, viewport: AxisViewport, ticks: Tick[]): void;
	pan(start: Point2D, delta: Point2D): void;
	zoom(at: Point2D, factor: number): void;
}

class BaseAxisLayout implements AxisLayout {
	displayBounds: Rect2D = Rect2D.fromCoordinates(0, 0, 0, 0);
	startPosition: Point2D = new Point2D(0, 0);
	endPosition: Point2D = new Point2D(0, 0);
	startLabelPosition: Point2D = new Point2D(0, 0);
	endLabelPosition: Point2D = new Point2D(0, 0);
	labelRotation: number = 0;
	periodBoundsHeight: number = 20;
	tickPositions: Point2D[] = [];
	tickLabelPositions: Point2D[] = [];
	axisMarkerSize: Size2D = new Size2D(16);
	eventMarkerSize: Size2D = new Size2D(8);
	tickMarkerSize: Size2D = new Size2D(8);
	overviewBounds: Rect2D = Rect2D.fromCoordinates(0, 0, 0, 0);
	overviewAxisBounds: Rect2D = Rect2D.fromCoordinates(0, 0, 0, 0);
	overviewDisplayedBounds: Rect2D = Rect2D.fromCoordinates(0, 0, 0, 0);
	overviewMarkerSize: Size2D = new Size2D(10);
	overviewEventMarkerSize: Size2D = new Size2D(5);
	overviewPeriodBoundsHeight: number = 8;
	protected input = DEFAULT_INPUT;
	protected ticks: Tick[] = [];
	protected readonly displayMargins = Rect2D.fromCoordinates(50, 50, 50, 0);
	protected readonly displayHeight = 150;
	protected readonly overviewMargins = Rect2D.fromCoordinates(50, 25, 50, 0);
	protected readonly overviewHeight = 20;

	get viewport(): AxisViewport {
		return {
			startRatio: (this.startPosition.x - this.displayBounds.left) / this.displayBounds.width,
			endRatio: (this.endPosition.x - this.displayBounds.left) / this.displayBounds.width,
		};
	}

	calculate(input: AxisLayoutInput, targetViewport: AxisViewport, ticks: Tick[]): void {
		this.input = input;
		this.ticks = ticks;

		this.displayBounds = this.calculateDisplayBounds(input);
		this.startPosition = this.calculateStartPos(input, targetViewport);
		this.endPosition = this.calculateEndPos(input, targetViewport);
		this.startLabelPosition = this.calculateStartLabelPos(input);
		this.endLabelPosition = this.calculateEndLabelPos(input);
		this.tickPositions = this.calculateTickPositions(input, ticks);
		this.tickLabelPositions = this.calculateTickLabelPositions(input);
		this.overviewBounds = this.calculateOverviewBounds(input);
		this.overviewAxisBounds = this.calculateOverviewAxisBounds(input);
		this.overviewDisplayedBounds = this.calculateOverviewDisplayedBounds(input);
	}

	protected calculateDisplayBounds(input: AxisLayoutInput): Rect2D {
		const left = this.displayMargins.left;
		return Rect2D.fromCoordinates(
			left,
			this.displayMargins.top,
			Math.max(input.viewSize.width - this.displayMargins.right, left + 1),
			this.displayMargins.top + this.displayHeight
		);
	}

	protected calculateStartPos(input: AxisLayoutInput, targetViewport: AxisViewport): Point2D {
		return new Point2D(
			this.displayBounds.left + (targetViewport.startRatio * this.displayBounds.width),
			this.displayBounds.center.y
		);
	}

	protected calculateEndPos(input: AxisLayoutInput, targetViewport: AxisViewport): Point2D {
		return new Point2D(
			this.displayBounds.left + (targetViewport.endRatio * this.displayBounds.width),
			this.displayBounds.center.y
		);
	}

	protected calculateStartLabelPos(input: AxisLayoutInput): Point2D {
		return this.calculateLabelPosition(this.startPosition, input);
	}

	protected calculateEndLabelPos(input: AxisLayoutInput): Point2D {
		return this.calculateLabelPosition(this.endPosition, input);
	}

	protected calculateLabelPosition(pos: Point2D, input: AxisLayoutInput): Point2D {
		return this.clipToAxisBounds(new Point2D(
			pos.x - 15,
			pos.y + this.overviewMarkerSize.height / 2 + 20
		));
	}

	protected calculateTickPositions(input: AxisLayoutInput, ticks: Tick[]): Point2D[] {
		const tlDistance = this.endPosition.x - this.startPosition.x;
		return ticks.map((tick) => this.calculateTickPosition(tick, input, tlDistance));
	}

	protected calculateTickPosition(tick: Tick, input: AxisLayoutInput, tlDistance: number): Point2D {
		return this.clipToAxisBounds(new Point2D(
			this.startPosition.x + (tick.tlRatio * tlDistance),
			this.startPosition.y
		));
	}

	protected calculateTickLabelPositions(input: AxisLayoutInput): Point2D[] {
		return this.tickPositions.map((tickPos) => this.calculateLabelPosition(tickPos, input));
	}

	protected isInAxisBounds(pos: Point2D): boolean {
		return this.displayBounds.contains(pos);
	}

	protected clipToAxisBounds(pos: Point2D): Point2D {
		return this.isInAxisBounds(pos) ? pos : INVALID_POSITION;
	}

	protected calculateOverviewBounds(input: AxisLayoutInput): Rect2D {
		const left = this.overviewMargins.left;
		return Rect2D.fromCoordinates(
			left,
			this.overviewMargins.top,
			Math.max(input.viewSize.width - this.overviewMargins.right, left + 1),
			this.overviewMargins.top + this.overviewHeight
		);
	}

	protected calculateOverviewAxisBounds(input: AxisLayoutInput): Rect2D {
		return Rect2D.fromCoordinates(
			this.overviewBounds.left + this.overviewMarkerSize.width, this.overviewBounds.top,
			this.overviewBounds.right - this.overviewMarkerSize.width, this.overviewBounds.bottom
		);
	}

	protected calculateOverviewDisplayedBounds(input: AxisLayoutInput): Rect2D {
		const virtualTimelineWidth = this.endPosition.x - this.startPosition.x;

		const displayedLeftRatio = (this.startPosition.x - this.displayBounds.left) / virtualTimelineWidth;
		let displayedLeft =
			this.overviewAxisBounds.left - (displayedLeftRatio * this.overviewAxisBounds.width);
		if (displayedLeft < this.overviewAxisBounds.left) {
			displayedLeft = this.overviewAxisBounds.left;
		}
		if (displayedLeft > this.overviewAxisBounds.right) {
			displayedLeft = this.overviewAxisBounds.right;
		}

		const displayedRightRatio = (this.endPosition.x - this.displayBounds.right) / virtualTimelineWidth;
		let displayedRight =
			this.overviewAxisBounds.right - (displayedRightRatio * this.overviewAxisBounds.width);
		if (displayedRight < this.overviewAxisBounds.left) {
			displayedRight = this.overviewAxisBounds.left;
		}
		if (displayedRight > this.overviewAxisBounds.right) {
			displayedRight = this.overviewAxisBounds.right;
		}

		return Rect2D.fromCoordinates(
			displayedLeft, this.overviewAxisBounds.top,
			displayedRight, this.overviewAxisBounds.bottom);
	}

	protected isInOverviewBounds(pos: Point2D): boolean {
		return this.overviewBounds.contains(pos);
	}

	pan(start: Point2D, delta: Point2D): void {
		const isInOverview = this.isInOverviewBounds(start);
		if (!this.isInAxisBounds(start) && !isInOverview) {
			return;
		}

		if (isInOverview) {
			const acceleration = -10;
			delta = new Point2D(acceleration * delta.x, acceleration * delta.y);
		}

		this.startPosition = new Point2D(this.startPosition.x + delta.x, this.startPosition.y + delta.y);
		this.endPosition = new Point2D(this.endPosition.x + delta.x, this.endPosition.y + delta.y);
		this.startLabelPosition = this.calculateLabelPosition(this.startPosition, this.input);
		this.endLabelPosition = this.calculateLabelPosition(this.endPosition, this.input);

		this.tickPositions = this.calculateTickPositions(this.input, this.ticks);
		this.tickLabelPositions = this.calculateTickLabelPositions(this.input);

		this.overviewDisplayedBounds = this.calculateOverviewDisplayedBounds(this.input);
	}

	zoom(at: Point2D, factor: number): void {
		if (!this.isInAxisBounds(at) && !this.isInOverviewBounds(at)) {
			return;
		}

		let centerX = at.x;
		if (centerX < this.startPosition.x) {
			centerX = this.startPosition.x;
		} else if (centerX > this.endPosition.x) {
			centerX = this.endPosition.x;
		}

		const startDelta = (this.startPosition.x - centerX) * factor;
		this.startPosition = new Point2D(centerX + startDelta, this.startPosition.y);

		const endDelta = (this.endPosition.x - centerX) * factor;
		this.endPosition = new Point2D(centerX + endDelta, this.endPosition.y);

		this.startLabelPosition = this.calculateLabelPosition(this.startPosition, this.input);
		this.endLabelPosition = this.calculateLabelPosition(this.endPosition, this.input);

		this.tickPositions = this.calculateTickPositions(this.input, this.ticks);
		this.tickLabelPositions = this.calculateTickLabelPositions(this.input);

		this.overviewDisplayedBounds = this.calculateOverviewDisplayedBounds(this.input);
	}
}

class VerticalAxisLayout extends BaseAxisLayout {
	override labelRotation: number = 90;

	protected override calculateLabelPosition(pos: Point2D, input: AxisLayoutInput): Point2D {
		return super.clipToAxisBounds(new Point2D(pos.x - 5, pos.y + this.overviewMarkerSize.height / 2 + 7));
	}
}

class HorizontalLeftAxisLayout extends BaseAxisLayout {
	private readonly horzDisplayLeft = 300;
	private readonly horzOverviewLeft = this.horzDisplayLeft;

	protected override calculateDisplayBounds(input: AxisLayoutInput): Rect2D {
		return Rect2D.fromCoordinates(
			this.horzDisplayLeft,
			this.displayMargins.top,
			input.viewSize.width - this.displayMargins.right,
			this.displayMargins.top + this.displayHeight
		);
	}

	protected override calculateOverviewBounds(input: AxisLayoutInput): Rect2D {
		return Rect2D.fromCoordinates(
			this.horzOverviewLeft,
			this.overviewMargins.top,
			input.viewSize.width - this.overviewMargins.right,
			this.overviewMargins.top + this.overviewHeight
		);
	}
}

class HorizontalCenterAxisLayout extends BaseAxisLayout {
}

class NoneAxisLayout extends BaseAxisLayout {
}

function createAxisLayout(format: LayoutFormat): AxisLayout {
	switch (format) {
		case LayoutFormat.HorizontalLeft:
			return new HorizontalLeftAxisLayout();
		case LayoutFormat.HorizontalCenter:
			return new HorizontalCenterAxisLayout();
		case LayoutFormat.Vertical:
			return new VerticalAxisLayout();
		case LayoutFormat.None:
			return new NoneAxisLayout();
		default:
			throw new Error(`[AxisLayoutService] - Invalid layout format: ${format}`);
	}
}

////////////////////////

export interface Tick {
	date: HDate;
	label: string;
	// Relative position of the tick in the timeline.
	tlRatio: number;
}

class TickCalculator {
	constructor(private timeline: Timeline, private dateFormat: HDateFormat) { }

	calculate(): Tick[] {
		const interval = this.intervalInYears();
		if (interval === 0) {
			return [];
		}

		const tlStartYear = this.timeline.from.year;
		const tlDuration = this.timeline.duration;

		// Add ticks for half the timeline duration on each side.
		// const margin = (this.timeline.to.year - this.timeline.from.year) / 2;
		const margin = 0;
		const from = Math.ceil((tlStartYear - margin) / interval) * interval;
		const to = Math.floor((this.timeline.to.year + margin) / interval) * interval;

		const ticks: Tick[] = [];
		for (let year = from; year <= to; year += interval) {
			const date = new HDate(year);
			const ratio = year < tlStartYear ?
				-duration(date, this.timeline.from) / tlDuration :
				duration(this.timeline.from, date) / tlDuration;
			ticks.push({
				date,
				label: this.dateFormat.format(date),
				tlRatio: ratio
			});
		}

		return ticks;
	}

	private intervalInYears(): number {
		const years = this.timeline.to.year - this.timeline.from.year;
		if (years === 0) {
			return 0;
		}
		const log = Math.log10(years);
		return Math.pow(10, Math.floor(log));
	}
}

////////////////////////

@Injectable({
	providedIn: 'root'
})
export class AxisLayoutService {
	private timelineService = inject(TimelineService);
	layoutFormat = signal<LayoutFormat>(LayoutFormat.HorizontalCenter);
	private axisLayout: AxisLayout = createAxisLayout(this.layoutFormat());
	private input = DEFAULT_INPUT;
	private ticks: Tick[] = [];

	// The visible area of the timeline.
	private _displayBounds = signal<Rect2D>(Rect2D.fromCoordinates(0, 0, 0, 0));
	// Virtual start and end positions of the timeline. They can be outside the visible area.
	private _startPosition = signal<Point2D>(new Point2D(0, 0));
	private _endPosition = signal<Point2D>(new Point2D(0, 0));
	// The position of the start and end marker labels.
	private _startLabelPosition = signal<Point2D>(new Point2D(0, 0));
	private _endLabelPosition = signal<Point2D>(new Point2D(0, 0));
	// Positions of the ticks and their labels.
	private _tickPositions = signal<Point2D[]>([]);
	private _tickLabelPositions = signal<Point2D[]>([]);

	// The visible area of the overview.
	private _overviewBounds = signal<Rect2D>(Rect2D.fromCoordinates(0, 0, 0, 0));
	// The area of the overview axis. Usually slightly smaller than the overview bounds.
	private _overviewAxisBounds = signal<Rect2D>(Rect2D.fromCoordinates(0, 0, 0, 0));
	// The area of the overview axis that is displayed in the timeline.
	private _overviewDisplayedBounds = signal<Rect2D>(Rect2D.fromCoordinates(0, 0, 0, 0));

	get displayBounds(): Signal<Rect2D> {
		return this._displayBounds.asReadonly();
	}
	get startPosition(): Signal<Point2D> {
		return this._startPosition.asReadonly();
	}
	get endPosition(): Signal<Point2D> {
		return this._endPosition.asReadonly();
	}
	get startLabelPosition(): Signal<Point2D> {
		return this._startLabelPosition.asReadonly();
	}
	get endLabelPosition(): Signal<Point2D> {
		return this._endLabelPosition.asReadonly();
	}
	get labelRotation(): Signal<number> {
		return computed(() => this.axisLayout.labelRotation);
	}
	get periodBoundsHeight(): Signal<number> {
		return computed(() => this.axisLayout.periodBoundsHeight);
	}
	getTickLabel(index: number): string {
		return this.ticks[index].label;
	}
	get tickPositions(): Signal<Point2D[]> {
		return this._tickPositions.asReadonly();
	}
	get tickLabelPositions(): Signal<Point2D[]> {
		return this._tickLabelPositions.asReadonly();
	}
	get overviewBounds(): Signal<Rect2D> {
		return this._overviewBounds.asReadonly();
	}
	get overviewAxisBounds(): Signal<Rect2D> {
		return this._overviewAxisBounds.asReadonly();
	}
	get overviewDisplayedBounds(): Signal<Rect2D> {
		return this._overviewDisplayedBounds.asReadonly();
	}
	get axisMarkerSize(): Signal<Size2D> {
		return computed(() => this.axisLayout.axisMarkerSize);
	}
	get eventMarkerSize(): Signal<Size2D> {
		return computed(() => this.axisLayout.eventMarkerSize);
	}
	get tickMarkerSize(): Signal<Size2D> {
		return computed(() => this.axisLayout.tickMarkerSize);
	}
	get overviewMarkerSize(): Signal<Size2D> {
		return computed(() => this.axisLayout.overviewMarkerSize);
	}
	get overviewEventMarkerSize(): Signal<Size2D> {
		return computed(() => this.axisLayout.overviewEventMarkerSize);
	}
	get overviewPeriodBoundsHeight(): Signal<number> {
		return computed(() => this.axisLayout.overviewPeriodBoundsHeight);
	}

	setLayoutFormat(format: LayoutFormat): void {
		const currentViewport = this.axisLayout.viewport;

		this.layoutFormat.set(format);
		this.axisLayout = createAxisLayout(this.layoutFormat());

		this.calculateLayout(this.input, currentViewport);
	}

	resetLayout(resetTickLabels: boolean = false) {
		if (resetTickLabels) {
			this.calculateTicks();
		}
		this.calculateLayout(this.input, DEFAULT_VIEWPORT);
	}

	updateLayout(input: AxisLayoutInput): void {
		this.input = input;
		this.calculateLayout(input, this.axisLayout.viewport);
	}

	private calculateLayout(input: AxisLayoutInput, targetViewport: AxisViewport): void {
		this.axisLayout.calculate(input, targetViewport, this.ticks);
		this.updateSignals();
	}

	private calculateTicks(): void {
		const calculator = new TickCalculator(this.timelineService.timeline, this.input.dateFormat);
		this.ticks = calculator.calculate();
	}

	pan(start: Point2D, delta: Point2D): void {
		this.axisLayout.pan(start, delta);
		this.updateSignals();
	}

	zoom(at: Point2D, factor: number): void {
		this.axisLayout.zoom(at, factor);
		this.updateSignals();
	}

	private updateSignals(): void {
		this._displayBounds.set(this.axisLayout.displayBounds);
		this._startPosition.set(this.axisLayout.startPosition);
		this._endPosition.set(this.axisLayout.endPosition);
		this._startLabelPosition.set(this.axisLayout.startLabelPosition);
		this._endLabelPosition.set(this.axisLayout.endLabelPosition);
		this._tickPositions.set(this.axisLayout.tickPositions);
		this._tickLabelPositions.set(this.axisLayout.tickLabelPositions);
		this._overviewBounds.set(this.axisLayout.overviewBounds);
		this._overviewAxisBounds.set(this.axisLayout.overviewAxisBounds);
		this._overviewDisplayedBounds.set(this.axisLayout.overviewDisplayedBounds);
	}
}
