import { computed, Injectable, Signal, signal } from "@angular/core";
import { LayoutFormat } from "./layout-types";
import { Point2D, Rect2D, Size2D } from "../graphics/gfx-coord-2d";

// External data that affects the layout of events.
export interface AxisLayoutInput {
	viewSize: Size2D;
}

const DEFAULT_INPUT: AxisLayoutInput = {
	viewSize: new Size2D(0, 0),
};

interface AxisLayout {
	startPos: Point2D;
	endPos: Point2D;
	displayBounds: Rect2D;

	calculate(input: AxisLayoutInput): void;
	pan(delta: Point2D): void;
	zoom(at: Point2D, factor: number): void;
	clear(): void;
}

class DefaultAxisLayout implements AxisLayout {
	startPos: Point2D = new Point2D(0, 0);
	endPos: Point2D = new Point2D(0, 0);
	displayBounds: Rect2D = Rect2D.fromCoordinates(0, 0, 0, 0);

	calculate(input: AxisLayoutInput): void {
		this.displayBounds = Rect2D.fromCoordinates(50, 100, input.viewSize.width - 50, 200);
		this.startPos = new Point2D(this.displayBounds.left, this.displayBounds.center.y);
		this.endPos = new Point2D(this.displayBounds.right, this.displayBounds.center.y);
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

	clear(): void {
		this.startPos = new Point2D(0, 0);
		this.endPos = new Point2D(0, 0);
	}
}

class HorizontalAxisLayout implements AxisLayout {
	startPos: Point2D = new Point2D(0, 0);
	endPos: Point2D = new Point2D(0, 0);
	displayBounds: Rect2D = Rect2D.fromCoordinates(0, 0, 0, 0);

	calculate(input: AxisLayoutInput): void {
		this.displayBounds = Rect2D.fromCoordinates(300, 100, input.viewSize.width - 50, 200);
		this.startPos = new Point2D(this.displayBounds.left, this.displayBounds.center.y);
		this.endPos = new Point2D(this.displayBounds.right, this.displayBounds.center.y);
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

	clear(): void {
		this.startPos = new Point2D(0, 0);
		this.endPos = new Point2D(0, 0);
	}
}

function createAxisLayout(format: LayoutFormat): AxisLayout {
	switch (format) {
		case LayoutFormat.Horizontal:
			return new HorizontalAxisLayout();
			case LayoutFormat.Vertical:
		case LayoutFormat.None:
			return new DefaultAxisLayout();
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
	
	private _startPos = signal<Point2D>(new Point2D(0, 0));
	private _endPos = signal<Point2D>(new Point2D(0, 0));
	private _displayBounds = signal<Rect2D>(Rect2D.fromCoordinates(0, 0, 0, 0));

	get startPos(): Signal<Point2D> {
		return this._startPos.asReadonly();
	}

	get endPos(): Signal<Point2D> {
		return this._endPos.asReadonly();
	}

	get displayBounds(): Signal<Rect2D> {
		return this._displayBounds.asReadonly();
	}

	setLayoutFormat(format: LayoutFormat): void {
		this.layoutFormat.set(format);
		this.axisLayout = createAxisLayout(this.layoutFormat());
		this.calculateLayout(this.input);
	}

	calculateLayout(input: AxisLayoutInput): void {
		this.input = input;

		this.axisLayout.calculate(this.input);
		this._startPos.set(this.axisLayout.startPos);
		this._endPos.set(this.axisLayout.endPos);
		this._displayBounds.set(this.axisLayout.displayBounds);
	}

	pan(delta: Point2D): void {
		this.axisLayout.pan(delta);
		this._startPos.set(this.axisLayout.startPos);
		this._endPos.set(this.axisLayout.endPos);
		this._displayBounds.set(this.axisLayout.displayBounds);
	}

	zoom(at: Point2D, factor: number): void {
		this.axisLayout.zoom(at, factor);
		this._startPos.set(this.axisLayout.startPos);
		this._endPos.set(this.axisLayout.endPos);
		this._displayBounds.set(this.axisLayout.displayBounds);
	}

	clear(): void {
		this.axisLayout.clear();
		this._startPos.set(this.axisLayout.startPos);
		this._endPos.set(this.axisLayout.endPos);
		this._displayBounds.set(this.axisLayout.displayBounds);
	}
}
