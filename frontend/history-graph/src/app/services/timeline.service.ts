import { computed, effect, inject, Injectable, Signal, WritableSignal, signal } from '@angular/core';
import { finalize, take } from 'rxjs';
import { makeDefaultTimelines, Timeline } from '../model/timeline';
import { HttpClient } from '@angular/common/http';
import { parseTimeline } from '../model/timeline-input';
import { EventGraphic, HgGraphic, TimelineGraphic, TimelineTheme } from './graphic-types';
import { HDate, HPeriod } from '../model/historic-date';
import { GraphicService } from './graphic-service';
import { calculateTicks, Tick } from './tick-calculator';
import { DEFAULT_DATE_FORMAT } from '../model/historic-date';
import { HEvent } from '../model/historic-event';
import { IdGenerator } from '../model/id-generator';

@Injectable({
	providedIn: 'root'
})
export class TimelineService {
	private http = inject(HttpClient);
	private graphicService = inject(GraphicService);
	private timelineIdGen = new IdGenerator();
	
	private isLoading_: WritableSignal<boolean> = signal(false);
	public get isLoading(): Signal<boolean> {
		return this.isLoading_;
	}

	private hgGraphic: WritableSignal<HgGraphic>;
	public get timelines(): Signal<TimelineGraphic[]> {
		return computed(() => this.hgGraphic().timelines);
	}

	private combinedTimeline_: WritableSignal<TimelineGraphic>;
	public get combinedTimeline(): Signal<TimelineGraphic> {
		return this.combinedTimeline_;
	}

	private ticks_: WritableSignal<Tick[]>;
	public get ticks(): Signal<Tick[]> {
		return this.ticks_;
	}

	constructor() {
		const defaultTimelines = makeDefaultTimelines(this.timelineIdGen).map(
			timeline => this.makeGraphic(timeline)
		);

		this.hgGraphic = signal(new HgGraphic(defaultTimelines));
		this.combinedTimeline_ = signal(this.calculateCombinedTimeline());
		this.ticks_ = signal(calculateTicks(this.combinedTimeline().timeline.period, DEFAULT_DATE_FORMAT));

		// Recalculate combined timeline when the graphic changes.
		effect(() => {
			this.combinedTimeline_.set(this.calculateCombinedTimeline());
		});
	}

	private calculateCombinedTimeline(): TimelineGraphic {
		const combinedTitle = 'Combined Timeline';

		// Collect the combined data.
		let combinedStart = new HDate(1);
		let combinedEnd = new HDate(2026);
		const combinedEvents: EventGraphic[] = [];

		this.hgGraphic().timelines.map(tlGraphic => {
			if (tlGraphic.from.less(combinedStart)) {
				combinedStart = tlGraphic.from;
			}
			if (tlGraphic.to.greater(combinedEnd)) {
				combinedEnd = tlGraphic.to;
			}

			combinedEvents.push(...tlGraphic.eventGraphics);
		});

		// Sort the combined events.
		combinedEvents.sort((a, b) => a.hEvent.less(b.hEvent) ? -1 : 1);

		// Create the combined timeline.
		const combinedTimeline = new Timeline(
			0,
			combinedTitle,
			new HPeriod(combinedStart, combinedEnd),
			combinedEvents.map(eventGraphic => eventGraphic.hEvent)
		);
		return this.makeGraphicWithEventThemes(
			combinedTimeline,
			// Preserve the original event themes.
			combinedEvents.map(eventGraphic => eventGraphic.theme)
		);
	}

	generateTimeline(topic: string): void {
		if (topic === 'run-debug-test') {
			this.runDebugTest();
			return;
		}
		
		const url = 'http://localhost:3000/api/generate-timeline?topic=' + encodeURIComponent(topic);
		this.isLoading_.set(true);
		
		this.http.get<any>(url).pipe(
			take(1),
			finalize(() => this.isLoading_.set(false))
		).subscribe({
			next: (timelineInput) => {
				try {
					this.hgGraphic.set(
						new HgGraphic([...this.hgGraphic().timelines, this.makeGraphicFromInput(timelineInput)])
					);
				} catch (e) {
					console.error('Failed to parse timeline:', e);
				}
			},
			error: (err) => console.error('Failed to fetch timeline:', err)
		});
	}

	private runDebugTest(): void {
		const input = {
			title: 'Test',
			start_date: '-4540000000',
			end_date: '2020',
			events: [
				{
					label: 'Test Event 1',
					start_date: '-4540000000',
					end_date: '-1000000000'
				},
				{
					label: 'Test Event 2',
					start_date: '100',
					end_date: '2020'
				}
			]
		};
		this.hgGraphic.set(new HgGraphic([this.makeGraphicFromInput(input)]));
	}

	private makeGraphic(timeline: Timeline): TimelineGraphic {
		return this.graphicService.decorateTimeline(timeline);
	}

	private makeGraphicWithEventThemes(timeline: Timeline, eventThemes: TimelineTheme[]): TimelineGraphic {
		return this.graphicService.decorateTimelineWithEventThemes(timeline, eventThemes);
	}

	private makeGraphicFromInput(input: any): TimelineGraphic {
		return this.makeGraphic(parseTimeline(input, this.timelineIdGen.nextId()));
	}
}
