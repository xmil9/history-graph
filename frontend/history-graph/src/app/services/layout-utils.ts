import { TextStyle } from "../graphics/gfx-style";
import { HDateFormat } from "../model/historic-date";
import { HEvent } from "../model/historic-event";

export function formatEventLabel(tlEvent: HEvent, dateFormat: HDateFormat): string {
	return dateFormat.format(tlEvent.when) + ',  ' + tlEvent.label;
}

export function makeFont(style: TextStyle) {
	return `${style.weight} ${style.size}px ${style.font}`
}