import { Component, computed, inject, input, Signal } from '@angular/core';
import { LineStyle } from '../../../graphics/gfx-style';
import { Point2D } from '../../../graphics/gfx-coord-2d';
import { LayoutService } from '../../../services/layout.service';
import { TimelineService } from '../../../services/timeline.service';
import { EventGraphic, TimelineGraphic } from '../../../services/graphic-types';
import { EventPosition, TimelineLayout } from '../../../services/layout-types';
import { HEvent } from '../../../model/historic-event';

export const DEFAULT_EVENT_MAP_LINE_STYLE: LineStyle = {
	color: '#333333',
	width: 1
};

@Component({
	selector: '[event-mapping]',
	imports: [],
	templateUrl: './event-mapping.html',
	styleUrl: './event-mapping.css'
})
export class EventMapping {
	private layoutService = inject(LayoutService);
	private timelineService = inject(TimelineService);

	// Content
	get combinedTimeline(): TimelineGraphic {
		return this.timelineService.combinedTimeline();
	}
	
	// Positioning
	private getTimelineLayout(hEvent: HEvent): TimelineLayout {
		const timelineId = hEvent.timelineId;
		const match = this.layoutService.layout.timelines.items.find(
			(tlLayout) => tlLayout.timelineId === timelineId);
		if (match === undefined) {
			throw new Error(`Timeline layout not found for timeline id ${timelineId}`);
		}
		return match;
	}

	getOverviewEventPositions(combinedEventIdx: number): EventPosition {
		return this.layoutService.layout.overview.combinedEventPositions[combinedEventIdx];
	}
	getEventPositionsInView(hEvent: HEvent): Point2D | undefined {
		const tlLayout = this.getTimelineLayout(hEvent);
		const eventIdx = hEvent.eventIdx;
		const startPos = tlLayout.eventPositions[eventIdx].start;
		return tlLayout.axis.contains(startPos) ? startPos : undefined;
	}
	getEventEndPositionsInView(hEvent: HEvent): Point2D | undefined {
		const tlLayout = this.getTimelineLayout(hEvent);
		const eventIdx = hEvent.eventIdx;
		const endPos = tlLayout.eventPositions[eventIdx].end;
		return (endPos && tlLayout.axis.contains(endPos)) ? endPos : undefined;
	}

	// Styling
	lineStyle = input<LineStyle>(DEFAULT_EVENT_MAP_LINE_STYLE);
	opacity = input<number>(0.5);
	getEventLineColor(eventGraphic: EventGraphic): string {
		return eventGraphic.theme.primaryColor;
	}
}
