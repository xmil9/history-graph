import { Component, computed, effect, input, Signal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TimelineService } from '../services/timeline.service';
import { Timeline } from '../model/timeline';
import { Point2D, Rect2D, Size2D } from '../graphics/gfx-coord-2d';
import { duration, MDYYYYFormat } from '../model/historic-date';
import { TimelineEventView } from '../timeline-event-view/timeline-event-view';
import { TimelineAxisView } from '../timeline-axis-view/timeline-axis-view';
import { DEFAULT_LINE_STYLE, DEFAULT_TEXT_STYLE, LineStyle, TextStyle } from '../graphics/gfx-style';

const DEFAULT_TL_TEXT_STYLE: TextStyle = {
	...DEFAULT_TEXT_STYLE,
	size: 14,
	weight: 600,
	rotation: 90,
};

@Component({
	selector: 'timeline',
	imports: [TimelineEventView, TimelineAxisView],
	templateUrl: './timeline-view.html',
	styleUrl: './timeline-view.css'
})
export class TimelineView {
	// Content
	private dateFormat = new MDYYYYFormat('-');
	timeline: Signal<Timeline | undefined>;
	startLabel = computed(() => {
		const timeline = this.timeline();
		return timeline ? this.dateFormat.format(timeline.from) : '';
	});
	endLabel = computed(() => {
		const timeline = this.timeline();
		return timeline ? this.dateFormat.format(timeline.to) : '';
	});
	eventLabels = signal<string[]>([]);
	
	// Positioning
	viewSize = signal(new Size2D(1500, 400));
	axisStartPos = signal(new Point2D(50, 200));
	axisEndPos = signal(new Point2D(this.viewSize().width - 50, 200));
	eventPositions = signal<Point2D[]>([]);

	// Styling
	textStyle = input<TextStyle>(DEFAULT_TL_TEXT_STYLE);
	lineStyle = input<LineStyle>(DEFAULT_LINE_STYLE);

	constructor(private timelineService: TimelineService) {
		this.timeline = toSignal(this.timelineService.timeline$, {
			initialValue: this.timelineService.timeline
		});

		effect(() => {
			this.updateEvents(this.timeline());
		});
	}

	private updateEvents(tl?: Timeline): void {
		if (!tl || tl.events.length === 0) {
			this.eventPositions.set([]);
			this.eventLabels.set([]);
			return;
		}

		const eventPositions: Point2D[] = [];
		const eventLabels = [];
		
		const tlDuration = duration(tl.from, tl.to);
		const tlLength = this.axisEndPos().x - this.axisStartPos().x;
		
		console.debug('Timeline events:', tl.events.length);
		console.debug('Timeline duration (time):', tlDuration);
		console.debug('Timeline length (space):', tlLength);
		
		for (const event of tl.events) {
			// Calculate position based on event date relative to timeline range.
			const eventRatio = duration(tl.from, event.when) / tlDuration;
			const eventX = this.axisStartPos().x + (eventRatio * tlLength);
			
			eventPositions.push(new Point2D(eventX, this.axisStartPos().y));
			eventLabels.push(this.dateFormat.format(event.when) + ' - ' + event.description);
		}
		
		this.eventPositions.set(eventPositions);
		this.eventLabels.set(eventLabels);
	}
}
