import { computed, Injectable, Signal, signal } from "@angular/core";
import { LayoutFormat } from "./layout-types";
import { Point2D, Rect2D, Size2D, INVALID_POSITION_SENTINEL } from "../graphics/gfx-coord-2d";
import { DEFAULT_TEXT_STYLE, TextStyle } from "../graphics/gfx-style";

// External data that affects the layout of events.
export interface AxisLayoutInput {
	viewSize: Size2D;
	textStyle: TextStyle;
}

const DEFAULT_INPUT: AxisLayoutInput = {
	viewSize: new Size2D(0, 0),
	textStyle: DEFAULT_TEXT_STYLE,
};

interface AxisLayout {
	startPos: Point2D;
	endPos: Point2D;
	displayBounds: Rect2D;
	axisMarkerSize: Size2D;
	eventMarkerSize: Size2D;
	startLabelPos: Point2D;
	endLabelPos: Point2D;
	labelRotation: number;
	overviewBounds: Rect2D;
	overviewAxisBounds: Rect2D;
	overviewDisplayedBounds: Rect2D;
	overviewMarkerSize: Size2D;
	overviewEventMarkerSize: Size2D;

	calculate(input: AxisLayoutInput): void;
	pan(start: Point2D, delta: Point2D): void;
	zoom(at: Point2D, factor: number): void;
}

class BaseAxisLayout implements AxisLayout {
	startPos: Point2D = new Point2D(0, 0);
	endPos: Point2D = new Point2D(0, 0);
	displayBounds: Rect2D = Rect2D.fromCoordinates(0, 0, 0, 0);
	axisMarkerSize: Size2D = new Size2D(16);
	eventMarkerSize: Size2D = new Size2D(8);
	startLabelPos: Point2D = new Point2D(0, 0);
	endLabelPos: Point2D = new Point2D(0, 0);
	labelRotation: number = 0;
	overviewBounds: Rect2D = Rect2D.fromCoordinates(0, 0, 0, 0);
	overviewAxisBounds: Rect2D = Rect2D.fromCoordinates(0, 0, 0, 0);
	overviewDisplayedBounds: Rect2D = Rect2D.fromCoordinates(0, 0, 0, 0);
	overviewMarkerSize: Size2D = new Size2D(10);
	overviewEventMarkerSize: Size2D = new Size2D(5);
	protected input = DEFAULT_INPUT;
	protected readonly displayMargins = Rect2D.fromCoordinates(50, 150, 50, 0);
	protected readonly displayHeight = 150;
	protected readonly overviewMargins = Rect2D.fromCoordinates(50, 125, 50, 0);
	protected readonly overviewHeight = 20;

	calculate(input: AxisLayoutInput): void {
		this.input = input;

		this.displayBounds = this.calculateDisplayBounds(input);
		this.startPos = this.calculateStartPos(input);
		this.endPos = this.calculateEndPos(input);
		this.startLabelPos = this.calculateStartLabelPos(input);
		this.endLabelPos = this.calculateEndLabelPos(input);
		this.overviewBounds = this.calculateOverviewBounds(input);
		this.overviewAxisBounds = this.calculateOverviewAxisBounds(input);
		this.overviewDisplayedBounds = this.calculateOverviewDisplayedBounds(input);
	}

	protected calculateDisplayBounds(input: AxisLayoutInput): Rect2D {
		return Rect2D.fromCoordinates(
			this.displayMargins.left,
			this.displayMargins.top,
			input.viewSize.width - this.displayMargins.right,
			this.displayMargins.top + this.displayHeight
		);
	}

	protected calculateOverviewBounds(input: AxisLayoutInput): Rect2D {
		return Rect2D.fromCoordinates(
			this.overviewMargins.left,
			this.overviewMargins.top,
			input.viewSize.width - this.overviewMargins.right,
			this.overviewMargins.top + this.overviewHeight
		);
	}

	protected calculateOverviewAxisBounds(input: AxisLayoutInput): Rect2D {
		const bounds = this.calculateOverviewBounds(input);
		return Rect2D.fromCoordinates(
			bounds.left + this.overviewMarkerSize.width, bounds.top,
			bounds.right - this.overviewMarkerSize.width, bounds.bottom
		);
	}

	protected calculateOverviewDisplayedBounds(input: AxisLayoutInput): Rect2D {
		const virtualTimelineWidth = this.endPos.x - this.startPos.x;

		const displayedLeftRatio = (this.startPos.x - this.displayBounds.left) / virtualTimelineWidth;
		let displayedLeft =
			this.overviewAxisBounds.left - (displayedLeftRatio * this.overviewAxisBounds.width);
		if (displayedLeft < this.overviewAxisBounds.left) {
			displayedLeft = this.overviewAxisBounds.left;
		}
		if (displayedLeft > this.overviewAxisBounds.right) {
			displayedLeft = this.overviewAxisBounds.right;
		}

		const displayedRightRatio = (this.endPos.x - this.displayBounds.right) / virtualTimelineWidth;
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

	protected calculateStartPos(input: AxisLayoutInput): Point2D {
		return new Point2D(this.displayBounds.left, this.displayBounds.center.y);
	}

	protected calculateEndPos(input: AxisLayoutInput): Point2D {
		return new Point2D(this.displayBounds.right, this.displayBounds.center.y);
	}

	protected calculateStartLabelPos(input: AxisLayoutInput): Point2D {
		return this.calculateLabelPosition(this.startPos, input);
	}

	protected calculateEndLabelPos(input: AxisLayoutInput): Point2D {
		return this.calculateLabelPosition(this.endPos, input);
	}

	protected calculateLabelPosition(pos: Point2D, input: AxisLayoutInput): Point2D {
		if (!this.isInAxisView(pos)) {
			return new Point2D(INVALID_POSITION_SENTINEL, INVALID_POSITION_SENTINEL);
		}
		return new Point2D(pos.x - 15, pos.y + this.overviewMarkerSize.height / 2 + 20);
	}

	protected isInAxisView(pos: Point2D): boolean {
		return this.displayBounds.contains(pos);
	}

	protected isInOverviewView(pos: Point2D): boolean {
		return this.overviewBounds.contains(pos);
	}

	pan(start: Point2D, delta: Point2D): void {
		if (!this.isInAxisView(start) && !this.isInOverviewView(start)) {
			return;
		}

		this.startPos = new Point2D(this.startPos.x + delta.x, this.startPos.y + delta.y);
		this.endPos = new Point2D(this.endPos.x + delta.x, this.endPos.y + delta.y);
		this.startLabelPos = this.calculateLabelPosition(this.startPos, this.input);
		this.endLabelPos = this.calculateLabelPosition(this.endPos, this.input);
		this.overviewDisplayedBounds = this.calculateOverviewDisplayedBounds(this.input);
	}

	zoom(at: Point2D, factor: number): void {
		if (!this.isInAxisView(at) && !this.isInOverviewView(at)) {
			return;
		}

		let centerX = at.x;
		if (centerX < this.startPos.x) {
			centerX = this.startPos.x;
		} else if (centerX > this.endPos.x) {
			centerX = this.endPos.x;
		}

		const startDelta = (this.startPos.x - centerX) * factor;
		this.startPos = new Point2D(centerX + startDelta, this.startPos.y);

		const endDelta = (this.endPos.x - centerX) * factor;
		this.endPos = new Point2D(centerX + endDelta, this.endPos.y);

		this.startLabelPos = this.calculateLabelPosition(this.startPos, this.input);
		this.endLabelPos = this.calculateLabelPosition(this.endPos, this.input);

		this.overviewDisplayedBounds = this.calculateOverviewDisplayedBounds(this.input);
	}
}

class VerticalAxisLayout extends BaseAxisLayout {
	override labelRotation: number = 90;

	protected override calculateLabelPosition(pos: Point2D, input: AxisLayoutInput): Point2D {
		if (!super.isInAxisView(pos)) {
			return new Point2D(INVALID_POSITION_SENTINEL, INVALID_POSITION_SENTINEL);
		}
		return new Point2D(pos.x - 5, pos.y + this.overviewMarkerSize.height / 2 + 7);
	}
}

class HorizontalAxisLayout extends BaseAxisLayout {
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

class NoneAxisLayout extends BaseAxisLayout {
}

function createAxisLayout(format: LayoutFormat): AxisLayout {
	switch (format) {
		case LayoutFormat.Horizontal:
			return new HorizontalAxisLayout();
		case LayoutFormat.Vertical:
			return new VerticalAxisLayout();
		case LayoutFormat.None:
			return new NoneAxisLayout();
		default:
			throw new Error(`[AxisLayoutService] - Invalid layout format: ${format}`);
	}
}

////////////////////////

@Injectable({
	providedIn: 'root'
})
export class AxisLayoutService {
	layoutFormat = signal<LayoutFormat>(LayoutFormat.Horizontal);
	private axisLayout: AxisLayout = createAxisLayout(this.layoutFormat());
	private input = DEFAULT_INPUT;
	
	// Virtual start and end positions of the timeline. They can be outside the visible area.
	private _startPos = signal<Point2D>(new Point2D(0, 0));
	private _endPos = signal<Point2D>(new Point2D(0, 0));
	// The visible area of the timeline.
	private _displayBounds = signal<Rect2D>(Rect2D.fromCoordinates(0, 0, 0, 0));
	// The position of the start and end marker labels.
	private _startLabelPos = signal<Point2D>(new Point2D(0, 0));
	private _endLabelPos = signal<Point2D>(new Point2D(0, 0));
	// The visible area of the overview.
	private _overviewBounds = signal<Rect2D>(Rect2D.fromCoordinates(0, 0, 0, 0));
	// The area of the overview axis. Usually slightly smaller than the overview bounds.
	private _overviewAxisBounds = signal<Rect2D>(Rect2D.fromCoordinates(0, 0, 0, 0));
	// The area of the overview axis that is displayed in the timeline.
	private _overviewDisplayedBounds = signal<Rect2D>(Rect2D.fromCoordinates(0, 0, 0, 0));


	get startPos(): Signal<Point2D> {
		return this._startPos.asReadonly();
	}
	get endPos(): Signal<Point2D> {
		return this._endPos.asReadonly();
	}
	get displayBounds(): Signal<Rect2D> {
		return this._displayBounds.asReadonly();
	}
	get startLabelPos(): Signal<Point2D> {
		return this._startLabelPos.asReadonly();
	}
	get endLabelPos(): Signal<Point2D> {
		return this._endLabelPos.asReadonly();
	}
	get labelRotation(): Signal<number> {
		return computed(() => this.axisLayout.labelRotation);
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
	get overviewMarkerSize(): Signal<Size2D> {
		return computed(() => this.axisLayout.overviewMarkerSize);
	}
	get overviewEventMarkerSize(): Signal<Size2D> {
		return computed(() => this.axisLayout.overviewEventMarkerSize);
	}

	setLayoutFormat(format: LayoutFormat): void {
		this.layoutFormat.set(format);
		this.axisLayout = createAxisLayout(this.layoutFormat());
		this.calculateLayout(this.input);
	}

	calculateLayout(input: AxisLayoutInput): void {
		this.input = input;
		this.axisLayout.calculate(this.input);
		this.updateSignals();
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
		this._startPos.set(this.axisLayout.startPos);
		this._endPos.set(this.axisLayout.endPos);
		this._displayBounds.set(this.axisLayout.displayBounds);
		this._startLabelPos.set(this.axisLayout.startLabelPos);
		this._endLabelPos.set(this.axisLayout.endLabelPos);
		this._overviewBounds.set(this.axisLayout.overviewBounds);
		this._overviewAxisBounds.set(this.axisLayout.overviewAxisBounds);
		this._overviewDisplayedBounds.set(this.axisLayout.overviewDisplayedBounds);
	}
}
