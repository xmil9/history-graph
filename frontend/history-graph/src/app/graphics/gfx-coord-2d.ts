export class Point2D {
	constructor(
		public x: number,
		public y: number,
	) {}
}

export class Rect2D {
	constructor(
		private tr: Point2D,
		private bl: Point2D,
	) {}

	get width(): number {
		return this.bl.x - this.tr.x;
	}

	get height(): number {
		return this.bl.y - this.tr.y;
	}

	get center(): Point2D {
		return new Point2D(
			(this.tr.x + this.bl.x) / 2,
			(this.tr.y + this.bl.y) / 2,
		);
	}

	get top(): number {
		return this.tr.y;
	}

	get bottom(): number {
		return this.bl.y;
	}

	get left(): number {
		return this.tr.x;
	}

	get right(): number {
		return this.bl.x;
	}

	get topLeft(): Point2D {
		return new Point2D(this.tr.x, this.tr.y);
	}

	get topRight(): Point2D {
		return new Point2D(this.bl.x, this.tr.y);
	}

	get bottomLeft(): Point2D {
		return new Point2D(this.tr.x, this.bl.y);
	}

	get bottomRight(): Point2D {
		return new Point2D(this.bl.x, this.bl.y);
	}
}

export class Size2D {
	public width: number;
	public height: number;
	
	constructor(width: number, height?: number) {
		this.width = width;
		this.height = height ?? width;
	}
}
