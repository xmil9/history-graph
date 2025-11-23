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
		new Timeline('England', new HPeriod(new HDate(1000), new HDate(2000)), [
			new HEvent(new HDate(1066, 10, 14), 'Battle of Hastings', 'The Battle of Hastings was a decisive battle in the history of England. It was fought between the English and the Norman French, and resulted in the Norman Conquest of England.'),
			new HEvent(new HPeriod(new HDate(1337), new HDate(1453)), 'Hundred Years\' War', 'The Hundred Years\' War was a series of conflicts between England and France, lasting from 1337 to 1453. It was fought over the issue of succession to the French throne.'),
			new HEvent(new HPeriod(new HDate(1455), new HDate(1487)), 'War of the Roses', 'The War of the Roses was a series of conflicts between the House of York and the House of Lancaster, lasting from 1455 to 1487. It was fought over the issue of succession to the English throne.'),
			new HEvent(new HDate(1533), 'English Reformation', 'The English Reformation was a period of religious reformation in England, lasting from 1533 to 1687. It was led by King Henry VIII, and resulted in the establishment of the Church of England.'	),
			new HEvent(new HDate(1585), 'Beginning of the Tudor Dynasty'),
			new HEvent(new HDate(1588), 'Defeat of the Spanish Armada', 'The Defeat of the Spanish Armada was a decisive battle in the history of England. It was fought between the English and the Spanish, and resulted in the defeat of the Spanish Armada.'),
			new HEvent(new HDate(1603), 'Union of the Crowns', 'The Union of the Crowns was a period of political unification in England, lasting from 1603 to 1603. It was led by King James I, and resulted in the establishment of the English monarchy.'),
			new HEvent(new HPeriod(new HDate(1643), new HDate(1651)), 'English Civil War', 'The English Civil War was a series of conflicts between the English Parliament and the English monarchy, lasting from 1643 to 1651. It was fought over the issue of succession to the English throne.'),
			new HEvent(new HDate(1660), 'Restoration of the Monarchy', 'The Restoration of the Monarchy was a period of political restoration in England, lasting from 1660 to 1660. It was led by King Charles II, and resulted in the establishment of the English monarchy.'),
			new HEvent(new HDate(1688), 'Glorious Revolution', 'The Glorious Revolution was a period of political revolution in England, lasting from 1688 to 1688. It was led by King William III, and resulted in the establishment of the English monarchy.'),
			new HEvent(new HDate(1707), 'Act of Union - Scotland joins England', 'The Act of Union - Scotland joins England was a period of political union in England, lasting from 1707 to 1707. It was led by King James I, and resulted in the establishment of the English monarchy.'),
			new HEvent(new HDate(1714), 'Hanoverian Succession', 'The Hanoverian Succession was a period of political succession in England, lasting from 1714 to 1714. It was led by King George I, and resulted in the establishment of the English monarchy.'),
			new HEvent(new HDate(1763), 'Treaty of Paris', 'The Treaty of Paris was a period of political treaty in England, lasting from 1763 to 1763. It was led by King George I, and resulted in the establishment of the English monarchy.'),
			new HEvent(new HDate(1801), 'Act of Union - Ireland joins England', 'The Act of Union - Ireland joins England was a period of political union in England, lasting from 1801 to 1801. It was led by King George I, and resulted in the establishment of the English monarchy.'),
			new HEvent(new HPeriod(new HDate(1837, 6, 20), new HDate(1901, 1, 22)), 'Reign of Queen Victoria', 'The Reign of Queen Victoria was a period of political reign in England, lasting from 1837 to 1901. It was led by Queen Victoria, and resulted in the establishment of the English monarchy.'),
			new HEvent(new HPeriod(new HDate(1901, 7, 28), new HDate(1919, 1, 11)), 'World War I', 'The World War I was a period of political war in England, lasting from 1901 to 1919. It was led by King George I, and resulted in the establishment of the English monarchy.'),
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
