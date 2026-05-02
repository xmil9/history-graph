import { HDate, HPeriod } from "./historic-date";
import { Point2D, Rect2D, Viewport2D } from "../graphics/gfx-coord-2d";

// Projects dates to a display coordinate system.
export class DateProjection {
	private readonly width: number;
	private readonly yCenter: number;

	constructor(
		public readonly viewport: Viewport2D,
		public readonly display: Rect2D,
		public readonly timePeriod: HPeriod
	) {
		this.width = display.width;
		this.yCenter = display.center.y;
	}

	toPosition(date: HDate): Point2D {
		const dateRatio = this.timePeriod.getRatio(date);
		if (dateRatio === undefined)
			return Point2D.invalid();

		const x = dateRatio * this.width;
		const projectedX = this.viewport.transformX(x);
		return new Point2D(this.display.left + projectedX, this.yCenter);
	}

	toRatio(date: HDate): number | undefined {
		return this.timePeriod.getRatio(date);
	}
}

export const DEFAULT_DATE_PROJECTION = new DateProjection(
	Viewport2D.identity(),
	Rect2D.empty(),
	new HPeriod(new HDate(2025), new HDate(2026))
);
