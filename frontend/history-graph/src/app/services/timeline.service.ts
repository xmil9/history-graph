import { inject, Injectable, signal, Signal } from '@angular/core';
import { BehaviorSubject, finalize, take } from 'rxjs';
import { makeDefaultTimelines, Timeline } from '../model/timeline';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { parseTimeline } from '../model/timeline-input';
import { TimelineGraphic, TimelineGraphics } from './timeline-types';

@Injectable({
	providedIn: 'root'
})
export class TimelineService {
	private http = inject(HttpClient);
	private colors = [
		'rgb(20, 54, 108)',
		'rgb(108, 20, 20)',
		'rgb(20, 108, 20)',
		'rgb(108, 20, 108)',
		'rgb(20, 108, 108)',
		'rgb(108, 108, 20)',
		'rgb(20, 20, 108)',
		'rgb(108, 20, 20)',
	];
	private nextColorIndex = 0;
	isLoading = signal(false);

	private timelinesSubject = new BehaviorSubject<TimelineGraphics>(
		makeDefaultTimelines().map(timeline => this.makeTimelineGraphic(timeline))
	);

	// Reactive access to the timeline
	public timelines$ = this.timelinesSubject.asObservable();

	// Synchronous access to the timeline
	get timelines(): TimelineGraphics {
		return this.timelinesSubject.value;
	}

	timelinesAsSignal(): Signal<TimelineGraphics> {
		return toSignal(this.timelinesSubject.asObservable(), {
			initialValue: this.timelinesSubject.value
		});	
	}

	generateTimeline(topic: string): void {
		if (topic === 'test') {
			this.executeInputTest();
			return;
		}
		
		const url = 'http://localhost:3000/api/generate-timeline?topic=' + encodeURIComponent(topic);
		this.isLoading.set(true);
		
		this.http.get<any>(url).pipe(
			take(1),
			finalize(() => this.isLoading.set(false))
		).subscribe({
			next: (timelineInput) => {
				try {
					this.timelinesSubject.next([this.makeTimelineGraphic(parseTimeline(timelineInput))]);
				} catch (e) {
					console.error('Failed to parse timeline:', e);
				}
			},
			error: (err) => console.error('Failed to fetch timeline:', err)
		});
	}

	private executeInputTest(): void {
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
		this.timelinesSubject.next([this.makeTimelineGraphic(parseTimeline(input))]);
	}

	private makeTimelineGraphic(timeline: Timeline): TimelineGraphic {
		return new TimelineGraphic(
			timeline.title,
			timeline.period,
			timeline.events,
			{
				primaryColor: this.colors[this.nextColorIndex++ % this.colors.length],
				secondaryColor: 'blue'
			}
		);
	}
}
