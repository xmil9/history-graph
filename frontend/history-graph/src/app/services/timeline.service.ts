import { inject, Injectable, signal, Signal } from '@angular/core';
import { BehaviorSubject, finalize, take, tap } from 'rxjs';
import { makeDefaultTimeline, Timeline } from '../model/timeline';
import { HDate, HPeriod } from '../model/historic-date';
import { HEvent } from '../model/historic-event';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';

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

	generateTimeline(prompt: string): void {
		const url = 'http://localhost:3000/api/generate-timeline?prompt=' + encodeURIComponent(prompt);
		console.debug(url);
		this.isLoading.set(true);
		
		this.http.get<any>(url).pipe(
			take(1),
			finalize(() => this.isLoading.set(false))
		).subscribe({
			next: (timelineLooselyTyped) => {
				console.debug(timelineLooselyTyped);
				try {
					this.timelineSubject.next(makeTimeline(timelineLooselyTyped, prompt));
				} catch (e) {
					console.error('Failed to parse timeline:', e);
				}
			},
			error: (err) => console.error('Failed to fetch timeline:', err)
		});
	}
}


function makeTimeline(timelineLooselyTyped: any, prompt: string): Timeline {
	if (!timelineLooselyTyped.start_date || !timelineLooselyTyped.end_date) {
		throw new Error('Start and end dates are required for timeline.');
	}

	return new Timeline(
		timelineLooselyTyped.title || prompt,
		makePeriod(timelineLooselyTyped.start_date, timelineLooselyTyped.end_date),
		makeEvents(timelineLooselyTyped.events)
	);
}

function makeEvents(eventsLooselyTyped: any[]): HEvent[] {
	return eventsLooselyTyped.map((eventLooselyTyped) => {
		if (!eventLooselyTyped.start_date) {
			throw new Error('Start date is required for event ' + eventLooselyTyped.label);
		}

		const startDate = makeDate(eventLooselyTyped.start_date);
		const endDate = eventLooselyTyped.end_date ? makeDate(eventLooselyTyped.end_date) : undefined;
		const isPeriod = endDate && !endDate.equals(startDate);
		
		if (isPeriod) {
			return new HEvent(
				new HPeriod(startDate, endDate),
				eventLooselyTyped.label,
				eventLooselyTyped.description
			);
		}

		return new HEvent(
			startDate,
			eventLooselyTyped.label,
			eventLooselyTyped.description
		);
	});
}

function makePeriod(startDate: string | undefined, endDate: string | undefined): HPeriod {
	if (!startDate || !endDate) {
		throw new Error('Start and end dates are required for period.');
	}
	return new HPeriod(makeDate(startDate), makeDate(endDate));
}

function makeDate(date: string): HDate {
	let BC = false;
	let dateAD = date;
	if (date.startsWith('-')) {
		BC = true;
		dateAD = date.substring(1);
	}
	const [yearAD, month, day] = dateAD.split('-');
	console.debug(yearAD, month, day);
	return new HDate(parseInt(BC ? `-${yearAD}` : yearAD), month ? parseInt(month) : undefined, day ? parseInt(day) : undefined);
}
