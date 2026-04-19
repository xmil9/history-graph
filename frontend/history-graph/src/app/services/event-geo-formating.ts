import { HDateFormat } from "../model/historic-date";
import { EventGraphic } from "./graphic-types";
import { formatEventLabel } from "./layout-utils";

export function formatEventAsHtml(
	tlEvent: EventGraphic,
	dateFormat: HDateFormat
): string {
	return `` +
		`<h4>${formatEventLabel(tlEvent.hEvent, dateFormat)}</h4>` +
		`<div>${tlEvent.hEvent.description}</div>`;
}

export function formatEventsAsHtml(tlEvents: Array<EventGraphic>, dateFormat: HDateFormat): string {
	if (!tlEvents)
		return '';
	if (tlEvents.length === 1)
		return formatEventAsHtml(tlEvents[0], dateFormat);

	let html = `<h3>${tlEvents.length} Events</h3>`;
	tlEvents.forEach(tlEvent => {
		html += formatEventAsHtml(tlEvent, dateFormat);
	});

	return html;
}
