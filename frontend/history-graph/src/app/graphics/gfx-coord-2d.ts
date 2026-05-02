/**
 * Sentinel value used to indicate an out-of-bounds or invalid position.
 * This value is large enough to be extremely unlikely as a real coordinate,
 * but small enough to be valid for SVG parsing (unlike Number.MAX_VALUE).
 */
export const INVALID_POSITION_SENTINEL = 1e10; // 10,000,000,000

export class Point2D {
	constructor(
		public readonly x: number,
		public readonly y: number,
	) {}

	static empty(): Point2D {
		return new Point2D(0, 0);
	}

	static invalid(): Point2D {
		return new Point2D(INVALID_POSITION_SENTINEL, INVALID_POSITION_SENTINEL);
	}

	translate(x: number, y: number): Point2D {
		return new Point2D(this.x + x, this.y + y);
	}
}

export class Rect2D {
	constructor(
		private readonly tl: Point2D,
		private readonly br: Point2D,
	) {}

	static fromCoordinates(left: number, top: number, right: number, bottom: number): Rect2D {
		return new Rect2D(new Point2D(left, top), new Point2D(right, bottom));
	}

	static empty(): Rect2D {
		return new Rect2D(new Point2D(0, 0), new Point2D(0, 0));
	}

	isEmpty(): boolean {
		return this.width === 0 && this.height === 0;
	}

	get width(): number {
		return this.br.x - this.tl.x;
	}

	get height(): number {
		return this.br.y - this.tl.y;
	}

	get center(): Point2D {
		return new Point2D(
			(this.tl.x + this.br.x) / 2,
			(this.tl.y + this.br.y) / 2,
		);
	}

	get top(): number {
		return this.tl.y;
	}

	get bottom(): number {
		return this.br.y;
	}

	get left(): number {
		return this.tl.x;
	}

	get right(): number {
		return this.br.x;
	}

	get topLeft(): Point2D {
		return new Point2D(this.tl.x, this.tl.y);
	}

	get topRight(): Point2D {
		return new Point2D(this.br.x, this.tl.y);
	}

	get bottomLeft(): Point2D {
		return new Point2D(this.tl.x, this.br.y);
	}

	get bottomRight(): Point2D {
		return new Point2D(this.br.x, this.br.y);
	}

	contains(pos: Point2D): boolean {
		return pos.x >= this.tl.x && pos.x <= this.br.x && pos.y >= this.tl.y && pos.y <= this.br.y;
	}

	clampX(x: number): number {
		return Math.max(this.tl.x, Math.min(x, this.br.x));
	}

	clampY(y: number): number {
		return Math.max(this.tl.y, Math.min(y, this.br.y));
	}

	clamp(pos: Point2D): Point2D {
		return new Point2D(this.clampX(pos.x), this.clampY(pos.y));
	}
}

export class Size2D {
	public readonly width: number;
	public readonly height: number;
	
	constructor(width: number, height?: number) {
		this.width = width;
		this.height = height ?? width;
	}

	equals(other: Size2D): boolean {
		return this.width === other.width && this.height === other.height;
	}

	isEmpty(): boolean {
		return this.width <= 0 || this.height <= 0;
	}

	static empty(): Size2D {
		return new Size2D(0);
	}
}

export class Viewport2D {
	constructor(
		public readonly offset: Point2D,
		public readonly scale: number
	) {}

	static identity(): Viewport2D {
		return new Viewport2D(Point2D.empty(), 1);
	}

	translate(offset: Point2D): Viewport2D {
		return new Viewport2D(
			this.offset.translate(offset.x, offset.y),
			this.scale
		);
	}

	zoomAt(center: Point2D, factor: number): Viewport2D {
		if (factor === 0)
			return this;

		const newOffsetX = center.x - (center.x - this.offset.x) * factor;
		
		return new Viewport2D(
			new Point2D(newOffsetX, this.offset.y),
			this.scale * factor
		);
	}

	transformX(val: number): number {
		return val * this.scale + this.offset.x;
	}

	transformY(val: number): number {
		return val * this.scale + this.offset.y;
	}

	transformPoint(pos: Point2D): Point2D {
		return new Point2D(
			pos.x * this.scale + this.offset.x,
			pos.y * this.scale + this.offset.y
		);
	}

	transformRect(rect: Rect2D): Rect2D {
		return new Rect2D(
			this.transformPoint(rect.topLeft),
			this.transformPoint(rect.bottomRight)
		);
	}

	invertX(val: number): number {
		return (val - this.offset.x) / this.scale;
	}

	invertY(val: number): number {
		return (val - this.offset.y) / this.scale;
	}

	invertPoint(pos: Point2D): Point2D {
		return new Point2D(
			(pos.x - this.offset.x) / this.scale,
			(pos.y - this.offset.y) / this.scale
		);
	}

	invertRect(rect: Rect2D): Rect2D {
		return new Rect2D(
			this.invertPoint(rect.topLeft),
			this.invertPoint(rect.bottomRight)
		);
	}
}