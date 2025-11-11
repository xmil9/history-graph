import { computed, Injectable, Signal, signal } from "@angular/core";
import { LayoutFormat } from "./layout-types";
import { Point2D, Size2D } from "../graphics/gfx-coord-2d";

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

	calculate(input: AxisLayoutInput): void;
	pan(delta: Point2D): void;
	zoom(at: Point2D, factor: number): void;
	clear(): void;
}

class DefaultAxisLayout implements AxisLayout {
	startPos: Point2D = new Point2D(0, 0);
	endPos: Point2D = new Point2D(0, 0);
	static readonly axisHOffset = 50;
	static readonly axisTopOffset = 100;

	calculate(input: AxisLayoutInput): void {
		this.startPos = new Point2D(DefaultAxisLayout.axisHOffset, DefaultAxisLayout.axisTopOffset);
		this.endPos = new Point2D(
			input.viewSize.width - DefaultAxisLayout.axisHOffset,
			DefaultAxisLayout.axisTopOffset
		);
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

class VerticalAxisLayout implements AxisLayout {
	startPos: Point2D = new Point2D(0, 0);
	endPos: Point2D = new Point2D(0, 0);
	static readonly axisHOffset = 50;
	static readonly axisTopOffset = 100;

	calculate(input: AxisLayoutInput): void {
		this.startPos = new Point2D(DefaultAxisLayout.axisHOffset, DefaultAxisLayout.axisTopOffset);
		this.endPos = new Point2D(
			input.viewSize.width - DefaultAxisLayout.axisHOffset,
			DefaultAxisLayout.axisTopOffset
		);
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
		case LayoutFormat.Vertical:
			return new VerticalAxisLayout();
		case LayoutFormat.Horizontal:
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

	get startPos(): Signal<Point2D> {
		return this._startPos.asReadonly();
	}

	get endPos(): Signal<Point2D> {
		return this._endPos.asReadonly();
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
	}

	pan(delta: Point2D): void {
		this.axisLayout.pan(delta);
		this._startPos.set(this.axisLayout.startPos);
		this._endPos.set(this.axisLayout.endPos);
	}

	zoom(at: Point2D, factor: number): void {
		this.axisLayout.zoom(at, factor);
		this._startPos.set(this.axisLayout.startPos);
		this._endPos.set(this.axisLayout.endPos);
	}
}
