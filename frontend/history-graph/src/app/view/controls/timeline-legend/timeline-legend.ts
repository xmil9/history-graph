import { Component, computed, inject, input } from '@angular/core';
import { TimelineGraphic } from '../../../services/graphic-types';
import { HDateFormat } from '../../../model/historic-date';
import { TimelineService } from '../../../services/timeline.service';
import { DEFAULT_AXIS_BACKGROUND } from '../../../graphics/gfx-style';
import { LayoutService } from '../../../services/layout.service';

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

	legendItems = computed(() =>
		this.timelines().map(tl => ({
			id: tl.timeline.id,
			title: tl.timeline.title,
			from: this.dateFormat().format(tl.timeline.from),
			to: this.dateFormat().format(tl.timeline.to),
			eventCount: tl.timeline.events.length,
			isVisible: tl.isVisible,
			color: tl.theme.primaryColor,
		}))
	);

	combinedLegendItem = computed(() => {
		const tl = this.combinedTimeline();
		return {
			title: tl.timeline.title,
			from: this.dateFormat().format(tl.timeline.from),
			to: this.dateFormat().format(tl.timeline.to),
			eventCount: tl.timeline.events.length,
			isVisible: this.timelineService.combinedTimeline().isVisible,
			color: '#888',
		};
	});

	toggle(id: number): void {
		this.timelineService.toggleTimelineVisibility(id);
		this.layoutService.refreshLayout();
	}

	toggleOverview(): void {
		this.timelineService.toggleOverviewVisibility();
		this.layoutService.refreshLayout();
	}
}
