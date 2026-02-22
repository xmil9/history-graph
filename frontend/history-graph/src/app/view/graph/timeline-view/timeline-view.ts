import { Component, computed, inject, input, Signal } from '@angular/core';
import { DEFAULT_LINE_STYLE, DEFAULT_TEXT_STYLE, LineStyle, TextStyle } from '../../../graphics/gfx-style';
import { PreferenceService } from '../../../services/preference.service';
import { HDateFormat } from '../../../model/historic-date';
import { TimelineGraphic } from '../../../services/graphic-types';
import { AxisView } from '../axis-view/axis-view';
import { EventView } from '../event-view/event-view';
import { TimelineService } from '../../../services/timeline.service';

const DEFAULT_TL_TEXT_STYLE: TextStyle = {
	...DEFAULT_TEXT_STYLE,
	size: 18,
	weight: 600,
	rotation: 90,
};

@Component({
	selector: '[tl-timeline]',
	imports: [
		AxisView,
		EventView
	],
	templateUrl: './timeline-view.html',
	styleUrl: './timeline-view.css'
})
export class TimelineView {
	private timelineService = inject(TimelineService);
	private preferenceService = inject(PreferenceService);

	// Content
	dateFormat = computed<HDateFormat>(() => {
		const labeledFormat = this.preferenceService.dateFormat();
		return labeledFormat.format;
	});
	timeline = input.required<TimelineGraphic>();
	timelineIdx = input.required<number>();

	startLabel = computed(() => {
		return this.dateFormat().format(this.timelineService.combinedTimeline().from);
	});
	endLabel = computed(() => {
		return this.dateFormat().format(this.timelineService.combinedTimeline().to);
	});

	// Styling
	textStyle = input<TextStyle>(DEFAULT_TL_TEXT_STYLE);
	lineStyle = input<LineStyle>(DEFAULT_LINE_STYLE);
}
