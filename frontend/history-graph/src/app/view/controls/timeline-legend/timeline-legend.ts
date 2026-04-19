import { Component, computed, inject, input, WritableSignal } from '@angular/core';
import { TimelineGraphic } from '../../../services/graphic-types';
import { HDateFormat } from '../../../model/historic-date';
import { TimelineService } from '../../../services/timeline.service';
import { DEFAULT_AXIS_BACKGROUND } from '../../../graphics/gfx-style';
import { LayoutService } from '../../../services/layout.service';

interface LegendItem {
	id: number;
	title: string;
	from: string;
	to: string;
	eventCount: number;
	isVisible: WritableSignal<boolean>;
	color: string;
	canRemove: boolean;
}

function makeLegendItem(tl: TimelineGraphic, dateFormat: HDateFormat, canRemove: boolean, color?: string): LegendItem {
	return {
		id: tl.timeline.id,
		title: tl.timeline.title,
		from: dateFormat.format(tl.timeline.from),
		to: dateFormat.format(tl.timeline.to),
		eventCount: tl.timeline.events.length,
		isVisible: tl.isVisible,
		color: color ?? tl.theme.primaryColor,
		canRemove
	};
}

@Component({
	selector: 'timeline-legend',
	templateUrl: './timeline-legend.html',
	styleUrl: './timeline-legend.css'
})
export class TimelineLegend {
	private timelineService = inject(TimelineService);
	private layoutService = inject(LayoutService);

	timelines = input.required<TimelineGraphic[]>();
	combinedTimeline = input.required<TimelineGraphic>();
	dateFormat = input.required<HDateFormat>();
	background = input<string>(DEFAULT_AXIS_BACKGROUND);

	legendItems = computed(() => {
		const combinedTl = this.combinedTimeline();
		const items = [makeLegendItem(combinedTl, this.dateFormat(), false, '#888')];
		items.push(...this.timelines().map(tl => makeLegendItem(tl, this.dateFormat(), true)));
		return items;
	});

	toggle(id: number): void {
		this.timelineService.toggleTimelineVisibility(id);
		setTimeout(() => this.layoutService.refreshLayout(), 0);
	}

	remove(id: number): void {
		this.timelineService.removeTimeline(id);
		setTimeout(() => this.layoutService.refreshLayout(), 0);
	}
}
