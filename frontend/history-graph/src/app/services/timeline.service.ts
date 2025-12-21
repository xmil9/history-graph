import { inject, Injectable, signal, Signal } from '@angular/core';
import { BehaviorSubject, finalize, take } from 'rxjs';
import { makeDefaultTimeline, Timeline } from '../model/timeline';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { parseTimeline } from '../model/timeline-input';

@Injectable({
	providedIn: 'root'
})
export class TimelineService {
	private http = inject(HttpClient);
	isLoading = signal(false);

	private timelineSubject = new BehaviorSubject<Timeline>(makeDefaultTimeline());

	// Reactive access to the timeline
	public timeline$ = this.timelineSubject.asObservable();

	// Synchronous access to the timeline
	get timeline(): Timeline {
		return this.timelineSubject.value;
	}

	timelineAsSignal(): Signal<Timeline> {
		return toSignal(this.timelineSubject.asObservable(), {
			initialValue: this.timelineSubject.value
		});	
	}

	setTimeline(timeline: Timeline): void {
		this.timelineSubject.next(timeline);
	}

	generateTimeline(topic: string): void {
		const url = 'http://localhost:3000/api/generate-timeline?topic=' + encodeURIComponent(topic);
		console.debug(url);
		this.isLoading.set(true);
		
		this.http.get<any>(url).pipe(
			take(1),
			finalize(() => this.isLoading.set(false))
		).subscribe({
			next: (timelineInput) => {
				console.debug(timelineInput);
				try {
					this.timelineSubject.next(parseTimeline(timelineInput));
				} catch (e) {
					console.error('Failed to parse timeline:', e);
				}
			},
			error: (err) => console.error('Failed to fetch timeline:', err)
		});
	}
}
