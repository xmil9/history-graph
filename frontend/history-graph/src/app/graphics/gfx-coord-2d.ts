/**
 * Sentinel value used to indicate an out-of-bounds or invalid position.
 * This value is large enough to be extremely unlikely as a real coordinate,
 * but small enough to be valid for SVG parsing (unlike Number.MAX_VALUE).
 */
export const INVALID_POSITION_SENTINEL = 1e10; // 10,000,000,000

export class Point2D {
	constructor(
		public x: number,
		public y: number,
	) {}
}

export const INVALID_POSITION = new Point2D(INVALID_POSITION_SENTINEL, INVALID_POSITION_SENTINEL);

export class Rect2D {
	constructor(
		private tl: Point2D,
		private br: Point2D,
	) {}

	static fromCoordinates(left: number, top: number, right: number, bottom: number): Rect2D {
		return new Rect2D(new Point2D(left, top), new Point2D(right, bottom));
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
}

export class Size2D {
	public width: number;
	public height: number;
	
	constructor(width: number, height?: number) {
		this.width = width;
		this.height = height ?? width;
	}
}
