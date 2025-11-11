import { computed, Injectable, Signal, signal } from "@angular/core";
import { LayoutFormat } from "./layout-types";
import { Point2D, Rect2D, Size2D } from "../graphics/gfx-coord-2d";
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
	startMarker: Rect2D;
	endMarker: Rect2D;
	startLabelPos: Point2D;
	endLabelPos: Point2D;
	labelRotation: number;

	calculate(input: AxisLayoutInput): void;
	pan(delta: Point2D): void;
	zoom(at: Point2D, factor: number): void;
}

class VerticalAxisLayout implements AxisLayout {
	startPos: Point2D = new Point2D(0, 0);
	endPos: Point2D = new Point2D(0, 0);
	displayBounds: Rect2D = Rect2D.fromCoordinates(0, 0, 0, 0);
	startMarker: Rect2D = Rect2D.fromCoordinates(0, 0, 0, 0);
	endMarker: Rect2D = Rect2D.fromCoordinates(0, 0, 0, 0);
	startLabelPos: Point2D = new Point2D(0, 0);
	endLabelPos: Point2D = new Point2D(0, 0);
	labelRotation: number = 90;
	// The length of the start and end marker dashes.
	private readonly markerLength = 10;

	calculate(input: AxisLayoutInput): void {
		this.displayBounds = Rect2D.fromCoordinates(50, 100, input.viewSize.width - 50, 200);
		this.startPos = new Point2D(this.displayBounds.left, this.displayBounds.center.y);
		this.endPos = new Point2D(this.displayBounds.right, this.displayBounds.center.y);
		this.startMarker = new Rect2D(
			new Point2D(this.displayBounds.left, this.displayBounds.center.y - this.markerLength),
			new Point2D(this.displayBounds.left, this.displayBounds.center.y + this.markerLength)
		);
		this.endMarker = new Rect2D(
			new Point2D(this.displayBounds.right, this.displayBounds.center.y - this.markerLength),
			new Point2D(this.displayBounds.right, this.displayBounds.center.y + this.markerLength)
		);
		this.startLabelPos = this.calculateLabelPosition(this.startPos, this.startMarker, input);
		this.endLabelPos = this.calculateLabelPosition(this.endPos, this.endMarker, input);
	}

	private calculateLabelPosition(pos: Point2D, marker: Rect2D, input: AxisLayoutInput): Point2D {
		return new Point2D(pos.x - input.textStyle.size / 3, marker.bottom + 5);
	}

	pan(delta: Point2D): void {
		this.startPos = new Point2D(this.startPos.x + delta.x, this.startPos.y + delta.y);
		this.endPos = new Point2D(this.endPos.x + delta.x, this.endPos.y + delta.y);
	}

	zoom(at: Point2D, factor: number): void {
		const zoomAreaOffsetY = 50;
		if (at.y > this.startPos.y + zoomAreaOffsetY || at.y < this.endPos.y - zoomAreaOffsetY) {
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
	}
}

class HorizontalAxisLayout implements AxisLayout {
	startPos: Point2D = new Point2D(0, 0);
	endPos: Point2D = new Point2D(0, 0);
	displayBounds: Rect2D = Rect2D.fromCoordinates(0, 0, 0, 0);
	startMarker: Rect2D = Rect2D.fromCoordinates(0, 0, 0, 0);
	endMarker: Rect2D = Rect2D.fromCoordinates(0, 0, 0, 0);
	startLabelPos: Point2D = new Point2D(0, 0);
	endLabelPos: Point2D = new Point2D(0, 0);
	labelRotation: number = 0;
	private input = DEFAULT_INPUT;
	// The length of the start and end marker dashes.
	private readonly markerLength = 10;

	calculate(input: AxisLayoutInput): void {
		this.input = input;

		this.displayBounds = Rect2D.fromCoordinates(300, 100, input.viewSize.width - 50, 200);
		this.startPos = new Point2D(this.displayBounds.left, this.displayBounds.center.y);
		this.endPos = new Point2D(this.displayBounds.right, this.displayBounds.center.y);
		this.startMarker = new Rect2D(
			new Point2D(this.displayBounds.left, this.displayBounds.center.y - this.markerLength),
			new Point2D(this.displayBounds.left, this.displayBounds.center.y + this.markerLength)
		);
		this.endMarker = new Rect2D(
			new Point2D(this.displayBounds.right, this.displayBounds.center.y - this.markerLength),
			new Point2D(this.displayBounds.right, this.displayBounds.center.y + this.markerLength)
		);
		this.startLabelPos = this.calculateLabelPosition(this.startPos, this.startMarker, input);
		this.endLabelPos = this.calculateLabelPosition(this.endPos, this.endMarker, input);
	}

	private calculateLabelPosition(pos: Point2D, marker: Rect2D, input: AxisLayoutInput): Point2D {
		return new Point2D(pos.x - 17, marker.bottom + 20);
	}

	pan(delta: Point2D): void {
		this.startPos = new Point2D(this.startPos.x + delta.x, this.startPos.y + delta.y);
		this.endPos = new Point2D(this.endPos.x + delta.x, this.endPos.y + delta.y);
		this.startLabelPos = this.calculateLabelPosition(this.startPos, this.startMarker, this.input);
		this.endLabelPos = this.calculateLabelPosition(this.endPos, this.endMarker, this.input);
	}

	zoom(at: Point2D, factor: number): void {
		const zoomAreaOffsetY = 50;
		if (at.y > this.startPos.y + zoomAreaOffsetY || at.y < this.endPos.y - zoomAreaOffsetY) {
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

		this.startLabelPos = this.calculateLabelPosition(this.startPos, this.startMarker, this.input);
		this.endLabelPos = this.calculateLabelPosition(this.endPos, this.endMarker, this.input);
	}
}

class NoneAxisLayout implements AxisLayout {
	startPos: Point2D = new Point2D(0, 0);
	endPos: Point2D = new Point2D(0, 0);
	displayBounds: Rect2D = Rect2D.fromCoordinates(0, 0, 0, 0);
	startMarker: Rect2D = Rect2D.fromCoordinates(0, 0, 0, 0);
	endMarker: Rect2D = Rect2D.fromCoordinates(0, 0, 0, 0);
	startLabelPos: Point2D = new Point2D(0, 0);
	endLabelPos: Point2D = new Point2D(0, 0);
	labelRotation: number = 0;
	// The length of the start and end marker dashes.
	private readonly markerLength = 10;

	calculate(input: AxisLayoutInput): void {
		this.displayBounds = Rect2D.fromCoordinates(50, 100, input.viewSize.width - 50, 200);
		this.startPos = new Point2D(this.displayBounds.left, this.displayBounds.center.y);
		this.endPos = new Point2D(this.displayBounds.right, this.displayBounds.center.y);
		this.startMarker = new Rect2D(
			new Point2D(this.displayBounds.left, this.displayBounds.center.y - this.markerLength),
			new Point2D(this.displayBounds.left, this.displayBounds.center.y + this.markerLength)
		);
		this.endMarker = new Rect2D(
			new Point2D(this.displayBounds.right, this.displayBounds.center.y - this.markerLength),
			new Point2D(this.displayBounds.right, this.displayBounds.center.y + this.markerLength)
		);
		this.startLabelPos = this.calculateLabelPosition(this.startPos, this.startMarker, input);
		this.endLabelPos = this.calculateLabelPosition(this.endPos, this.endMarker, input);
	}

	private calculateLabelPosition(pos: Point2D, marker: Rect2D, input: AxisLayoutInput): Point2D {
		return new Point2D(pos.x - 17, marker.bottom + 20);
	}

	pan(delta: Point2D): void {
		this.startPos = new Point2D(this.startPos.x + delta.x, this.startPos.y + delta.y);
		this.endPos = new Point2D(this.endPos.x + delta.x, this.endPos.y + delta.y);
	}

	zoom(at: Point2D, factor: number): void {
		const zoomAreaOffsetY = 50;
		if (at.y > this.startPos.y + zoomAreaOffsetY || at.y < this.endPos.y - zoomAreaOffsetY) {
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
	}
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
	// The position of the start and end marker dashes.
	private _startMarker = signal<Rect2D>(Rect2D.fromCoordinates(0, 0, 0, 0));
	private _endMarker = signal<Rect2D>(Rect2D.fromCoordinates(0, 0, 0, 0));
	// The position of the start and end marker labels.
	private _startLabelPos = signal<Point2D>(new Point2D(0, 0));
	private _endLabelPos = signal<Point2D>(new Point2D(0, 0));

	get startPos(): Signal<Point2D> {
		return this._startPos.asReadonly();
	}
	get endPos(): Signal<Point2D> {
		return this._endPos.asReadonly();
	}
	get displayBounds(): Signal<Rect2D> {
		return this._displayBounds.asReadonly();
	}
	get startMarker(): Signal<Rect2D> {
		return this._startMarker.asReadonly();
	}
	get endMarker(): Signal<Rect2D> {
		return this._endMarker.asReadonly();
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

	pan(delta: Point2D): void {
		this.axisLayout.pan(delta);
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
		this._startMarker.set(this.axisLayout.startMarker);
		this._endMarker.set(this.axisLayout.endMarker);
		this._startLabelPos.set(this.axisLayout.startLabelPos);
		this._endLabelPos.set(this.axisLayout.endLabelPos);
	}
}
