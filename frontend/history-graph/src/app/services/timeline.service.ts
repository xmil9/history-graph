import { inject, Injectable, Signal } from '@angular/core';
import { BehaviorSubject, take, tap } from 'rxjs';
import { Timeline } from '../model/timeline';
import { HDate, HPeriod } from '../model/historic-date';
import { HEvent } from '../model/historic-event';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';

@Injectable({
	providedIn: 'root'
})
export class TimelineService {
	private http = inject(HttpClient);
	private timelineSubject = new BehaviorSubject<Timeline>(
		new Timeline('England', new HPeriod(new HDate(1000), new HDate(2000)), [
			new HEvent(new HDate(1066, 10, 14), 'Battle of Hastings', 'The Battle of Hastings was a decisive battle in the history of England. It was fought between the English and the Norman French, and resulted in the Norman Conquest of England.'),
			new HEvent(new HPeriod(new HDate(1337), new HDate(1453)), 'Hundred Years\' War', 'The Hundred Years\' War was a series of conflicts between England and France, lasting from 1337 to 1453. It was fought over the issue of succession to the French throne.'),
			new HEvent(new HPeriod(new HDate(1455), new HDate(1487)), 'War of the Roses', 'The War of the Roses was a series of conflicts between the House of York and the House of Lancaster, lasting from 1455 to 1487. It was fought over the issue of succession to the English throne.'),
			new HEvent(new HPeriod(new HDate(1527), new HDate(1603)), 'English Reformation', 'The English Reformation was a period of religious reformation in England, lasting from 1527 to 1603. It was led by King Henry VIII, and resulted in the establishment of the Church of England.'),
			new HEvent(new HPeriod(new HDate(1485), new HDate(1603)), 'Tudor Dynasty', 'The Tudor\'s reign was marked by key events like the end of the Wars of the Roses and the English Reformation, and is known for powerful monarchs like Henry VIII and Elizabeth I.'),
			new HEvent(new HDate(1588), 'Defeat of the Spanish Armada', 'The Defeat of the Spanish Armada was a decisive battle in the history of England. It was fought between the English and the Spanish, and resulted in the defeat of the Spanish Armada.'),
			new HEvent(new HDate(1603, 3, 24), 'Union of the Crowns', 'The Union of the Crowns was the accession of James VI of Scotland to the thrones of England and Ireland as James I on 24 March 1603, and the consequent formation of a personal union between the Kingdoms of England, Scotland, and Ireland.'),
			new HEvent(new HPeriod(new HDate(1643), new HDate(1651)), 'English Civil War', 'The English Civil War was a series of conflicts between the English Parliament and the English monarchy, lasting from 1643 to 1651. It was fought over the issue of succession to the English throne.'),
			new HEvent(new HDate(1660, 5), 'Restoration of the Monarchy', 'The Stuart Restoration was the reinstatement in May 1660 of the Stuart monarchy in England, Scotland, and Ireland. It replaced the Commonwealth of England, established in January 1649 after the execution of Charles I, with his son Charles II.'),
			new HEvent(new HPeriod(new HDate(1688), new HDate(1689)), 'Glorious Revolution', 'The Glorious Revolution, also known as the Revolution of 1688, was the deposition of King James II Stuart in November 1688.'),
			new HEvent(new HDate(1707), 'Act of Union - Scotland joins England', 'The Act of Union in 1707 unified the Kingdom of England and the Kingdom of Scotland, creating a single state called Great Britain.'),
			new HEvent(new HDate(1714), 'Hanoverian Succession', 'The Hanoverian succession was the 1714 transfer of the British throne to the German House of Hanover, established by the Act of Settlement 1701 to ensure a Protestant succession after Queen Anne.'),
			new HEvent(new HDate(1763), 'Treaty of Paris', 'The Treaty of Paris of 1763 ended the French and Indian War/Seven Years’ War between Great Britain and France, as well as their respective allies. In the terms of the treaty, France gave up all its territories in mainland North America, effectively ending any foreign military threat to the British colonies there.'),
			new HEvent(new HDate(1801, 1, 1), 'Act of Union - Ireland joins England', 'The Act of Union of 1800 joined the Kingdom of Great Britain and the Kingdom of Ireland into a single state, the United Kingdom of Great Britain and Ireland, effective January 1, 1801.'),
			new HEvent(new HPeriod(new HDate(1837, 6, 20), new HDate(1901, 1, 22)), 'Reign of Queen Victoria', 'Queen Victoria\'s reign was from 1837 to 1901, lasting nearly 64 years, and was a period of significant industrial, political, and cultural change for Britain.'),
			new HEvent(new HPeriod(new HDate(1914, 7, 28), new HDate(1919, 1, 11)), 'World War I', 'World War I, or the First World War, also known as the Great War, was a global conflict between two coalitions: the Allies and the Central Powers. Major areas of conflict included Europe and the Middle East, as well as parts of Africa and the Asia-Pacific.'),
		])
	);

	// Reactive access to the timeline
	public timeline$ = this.timelineSubject.asObservable();

	// Synchronous access to the timeline
	get timeline(): Timeline {
		return this.timelineSubject.value;
	}

	// 
	timelineAsSignal(): Signal<Timeline> {
		return toSignal(this.timelineSubject.asObservable(), {
			initialValue: this.timelineSubject.value
		});	
	}

	setTimeline(timeline: Timeline): void {
		this.timelineSubject.next(timeline);
	}

	generateTimeline(prompt: string): void {
		const url = 'http://localhost:3000/api/generate-events?prompt=' + encodeURIComponent(prompt);
		console.log(url);
		this.http.get<string>(url).pipe(take(1)).subscribe((events) => {
			console.log(events);
			this.timelineSubject.next(new Timeline('Timeline', new HPeriod(new HDate(1000), new HDate(2000))));
		});
	}
}
