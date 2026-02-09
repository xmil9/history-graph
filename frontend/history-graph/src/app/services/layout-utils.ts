import { Point2D, Rect2D } from "../graphics/gfx-coord-2d";
import { TextStyle } from "../graphics/gfx-style";
import { HDateFormat } from "../model/historic-date";
import { HEvent } from "../model/historic-event";
import { TimelineViewport } from "./layout-types";

export function calculateViewport(startPosition: Point2D, endPosition: Point2D, displayBounds: Rect2D): TimelineViewport {
	return {
		startRatio: (startPosition.x - displayBounds.left) / displayBounds.width,
		endRatio: (endPosition.x - displayBounds.left) / displayBounds.width,
	};
}

export function formatEventLabel(tlEvent: HEvent, dateFormat: HDateFormat): string {
	return dateFormat.format(tlEvent.when) + ',  ' + tlEvent.label;
}

export function makeFont(style: TextStyle) {
	return `${style.weight} ${style.size}px ${style.font}`
}