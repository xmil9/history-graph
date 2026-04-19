import { computed, effect, inject, Injectable, Signal, WritableSignal, signal } from '@angular/core';
import { finalize, take } from 'rxjs';
import { makeDefaultTimelines, Timeline } from '../model/timeline';
import { HttpClient } from '@angular/common/http';
import { parseTimeline } from '../model/timeline-input';
import { EventGraphic, HgGraphic, TimelineGraphic, TimelineTheme } from './graphic-types';
import { HDate, HPeriod } from '../model/historic-date';
import { GraphicService } from './graphic-service';
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

	public getTimeline(id: number): TimelineGraphic | undefined {
		if (id === this.	combinedTimeline().timeline.id) {
			return this.combinedTimeline();
		}
		return this.hgGraphic().timelines.find(tl => tl.timeline.id === id);
	}

	private combinedTimeline_: WritableSignal<TimelineGraphic>;
	public get combinedTimeline(): Signal<TimelineGraphic> {
		return this.combinedTimeline_;
	}

	constructor() {
		const defaultTimelines = makeDefaultTimelines(this.timelineIdGen).map(
			timeline => this.makeGraphic(timeline)
		);

		this.hgGraphic = signal(new HgGraphic(defaultTimelines));
		this.combinedTimeline_ = signal(this.calculateCombinedTimeline());

		// Recalculate combined timeline when the graphic changes.
		effect(() => {
			this.combinedTimeline_.set(this.calculateCombinedTimeline());
		});
	}

	private calculateCombinedTimeline(): TimelineGraphic {
		const combinedTitle = 'Overview';

		// Collect the combined data.
		let combinedStart: HDate | undefined = undefined;
		let combinedEnd: HDate | undefined = undefined;
		const combinedEvents: EventGraphic[] = [];

		this.hgGraphic().timelines.map(tlGraphic => {
			if (!combinedStart || tlGraphic.from.less(combinedStart)) {
				combinedStart = tlGraphic.from;
			}
			if (!combinedEnd || tlGraphic.to.greater(combinedEnd)) {
				combinedEnd = tlGraphic.to;
			}

			combinedEvents.push(...tlGraphic.eventGraphics);
		});

		if (!combinedStart) {
			combinedStart = HDate.now();
		}
		if (!combinedEnd) {
			combinedEnd = HDate.now();
		}

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

	toggleTimelineVisibility(id: number): void {
		const tl = this.getTimeline(id);
		if (!tl) {
			return;
		}
		tl.isVisible.set(!tl.isVisible());
	}

	removeTimeline(id: number): void {
		const combinedId = this.combinedTimeline().timeline.id;
		if (id !== combinedId) {
			const timelines = this.hgGraphic().timelines.filter(tl => tl.timeline.id !== id);
			this.hgGraphic.set(new HgGraphic(timelines));
		}
	}

	async addTimeline(topic: string): Promise<void> {
		if (topic === 'run-debug-test') {
			this.runDebugTest();
			return;
		}
		
		const timeline = await this.requestTimeline(topic);
		if (!timeline) {
			return;
		}
		this.hgGraphic.set(new HgGraphic([...this.hgGraphic().timelines, timeline]));
	}

	private requestTimeline(topic: string): Promise<TimelineGraphic | undefined> {
		return new Promise((resolve, reject) => {
			const url = 'http://localhost:3000/api/generate-timeline?topic=' + encodeURIComponent(topic);
			this.isLoading_.set(true);
		
			this.http.get<any>(url).pipe(
				take(1),
				finalize(() => this.isLoading_.set(false))
			).subscribe({
				next: (timelineInput) => {
					try {
						resolve(this.makeGraphicFromInput(timelineInput));
					} catch (e) {
						console.error('Failed to parse timeline:', e);
						resolve(undefined);
					}
				},
				error: (err) => {
					console.error('Failed to fetch timeline:', err);
					resolve(undefined);
				}
			});
		});
	}

	private runDebugTest(): void {
		const input = {
			title: 'Test',
			start_date: '1900',
			end_date: '2020',
			events: [
				{
					label: 'Test Event 1',
					start_date: '1920',
					end_date: '1940'
				},
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
