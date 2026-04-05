import { EventGraphic } from "./graphic-types";

export function formatEventAsHtml(
	tlEvent: EventGraphic
): string {
	return `` +
		`<h4>${tlEvent.hEvent.label}</h4>` +
		`<div>${tlEvent.hEvent.description}</div>`;
}

export function formatEventsAsHtml(tlEvents: Array<EventGraphic>): string {
	if (!tlEvents)
		return '';
	if (tlEvents.length === 1)
		return formatEventAsHtml(tlEvents[0]);

	let html = `<h3>${tlEvents.length} Events</h3>`;
	tlEvents.forEach(tlEvent => {
		html += formatEventAsHtml(tlEvent);
	});

	return html;
}
