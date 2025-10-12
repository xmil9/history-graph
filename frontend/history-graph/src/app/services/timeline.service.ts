import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Timeline } from '../model/timeline';
import { HDate, HPeriod } from '../model/historic-date';
import { HEvent } from '../model/historic-event';

@Injectable({
	providedIn: 'root'
})
export class TimelineService {
	private timelineSubject = new BehaviorSubject<Timeline>(
		new Timeline(new HPeriod(new HDate(1000), new HDate(2000)), [
			new HEvent(new HDate(1066, 10, 14), 'Battle of Hastings'),
			new HEvent(new HPeriod(new HDate(1337), new HDate(1453)), 'Hundred Years\' War'),
			new HEvent(new HPeriod(new HDate(1455), new HDate(1487)), 'War of the Roses'),
			new HEvent(new HDate(1585), 'Beginning of the Tudor Dynasty'),
			new HEvent(new HDate(1533), 'English Reformation'),
			new HEvent(new HDate(1588), 'Defeat of the Spanish Armada'),
			new HEvent(new HDate(1603), 'Union of the Crowns'),
			new HEvent(new HPeriod(new HDate(1643), new HDate(1651)), 'English Civil War'),
			new HEvent(new HDate(1660), 'Restoration of the Monarchy'),
			new HEvent(new HDate(1688), 'Glorious Revolution'),
			new HEvent(new HDate(1707), 'Act of Union - Scotland joins England'),
			new HEvent(new HDate(1714), 'Hanoverian Succession'),
			new HEvent(new HDate(1763), 'Treaty of Paris'),
			new HEvent(new HDate(1801), 'Act of Union - Ireland joins England'),
			new HEvent(new HPeriod(new HDate(1837, 6, 20), new HDate(1901, 1, 22)), 'Reign of Queen Victoria'),
			new HEvent(new HPeriod(new HDate(1901, 7, 28), new HDate(1919, 1, 11)), 'World War I'),
		])
	);

	// Reactive access to the timeline
	public timeline$ = this.timelineSubject.asObservable();

	constructor() {}

	// Synchronous access to the timeline
	get timeline(): Timeline {
		return this.timelineSubject.value;
	}

	setTimeline(timeline: Timeline): void {
		this.timelineSubject.next(timeline);
	}
}
