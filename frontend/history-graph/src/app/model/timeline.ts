import { HDate, HPeriod } from "./historic-date";
import { HEvent } from "./historic-event";

export class Timeline {
	constructor(
		public readonly title: string,
		public readonly period: HPeriod,
		public readonly events: HEvent[] = [],
	) {}

	get to() {
		return this.period.to;
	}

	get from() {
		return this.period.from;
	}
}

export function makeDefaultTimeline(): Timeline {
	return new Timeline(
		'Space Flight History',
		new HPeriod(new HDate(1955), new HDate(2026)),
		[
			new HEvent(
				new HDate(1957, 4, 10),
				'Sputnik 1 Launch',
				'The Soviet Union launches Sputnik 1, the first artificial satellite to orbit Earth, marking the beginning of the Space Age.'
			),
			new HEvent(
				new HDate(1957, 3, 11),
				'Sputnik 2 Launch',
				'The Soviet Union launches Sputnik 2, carrying the dog Laika, the first animal to orbit Earth.'
			),
			new HEvent(
				new HDate(1958, 1, 31),
				'Explorer 1 Launch',
				'The United States launches Explorer 1, its first artificial satellite.'
			),
			new HEvent(
				new HDate(1961, 4, 12),
				'Vostok 1 - First Human in Space',
				'Yuri Gagarin (Soviet Union) becomes the first human in space, orbiting Earth once in Vostok 1.'
			),
			new HEvent(
				new HDate(1961, 5, 5),
				'Freedom 7 - First American in Space',
				'Alan Shepard becomes the first American in space, making a suborbital flight in Freedom 7.'
			),
			new HEvent(
				new HDate(1962, 2, 20),
				'Friendship 7 - First American to Orbit Earth',
				'John Glenn becomes the first American to orbit Earth in Friendship 7.'
			),
			new HEvent(
				new HPeriod(new HDate(1963, 6, 16), new HDate(1963, 6, 19)),
				'Vostok 6 - First Woman in Space',
				'Valentina Tereshkova (Soviet Union) becomes the first woman in space.'
			),
			new HEvent(
				new HDate(1965, 3, 18),
				'Voskhod 2 - First Spacewalk',
				'Alexei Leonov (Soviet Union) performs the first spacewalk.'
			),
			new HEvent(
				new HPeriod(new HDate(1969, 7, 20), new HDate(1969, 7, 24)),
				'Apollo 11 - First Moon Landing',
				'Neil Armstrong and Buzz Aldrin become the first humans to land on the Moon.'
			),
			new HEvent(
				new HDate(1971, 4, 19),
				'Salyut 1 - First Space Station',
				'The Soviet Union launches Salyut 1, the first space station.'
			),
			new HEvent(
				new HPeriod(new HDate(1981, 4, 12), new HDate(1981, 4, 14)),
				'STS-1 - First Space Shuttle Flight',
				'The United States launches the Space Shuttle Columbia on its first flight, STS-1.'
			),
			new HEvent(
				new HPeriod(new HDate(1998, 11, 20), new HDate(1998, 12, 1)),
				'ISS Assembly Begins',
				'The first module of the International Space Station (ISS), Zarya, is launched.'
			),
			new HEvent(
				new HPeriod(new HDate(2000), new HDate(2024)),
				'Continuous ISS Habitation',
				'The International Space Station has been continuously inhabited since November 2, 2000.'
			),
			new HEvent(
				new HDate(2001, 4, 28),
				'Dennis Tito - First Space Tourist',
				'Dennis Tito becomes the first paying space tourist, visiting the ISS.'
			),
			new HEvent(
				new HDate(2012, 8, 6),
				'Curiosity Rover Landing',
				'The Curiosity rover lands on Mars.'
			),
			new HEvent(
				new HDate(2020, 5, 30),
				'SpaceX Crew Dragon Demo-2',
				'SpaceX becomes the first private company to launch humans into orbit.'
			),
			new HEvent(
				new HDate(2021, 2, 18),
				'Perseverance Rover Landing',
				'The Perseverance rover lands on Mars, carrying the Ingenuity helicopter.'
			),
			new HEvent(
				new HDate(2022, 12, 11),
				'Artemis 1 - Uncrewed Lunar Orbit',
				'The Artemis 1 mission successfully completes an uncrewed test flight around the Moon.'
			),
			new HEvent(
				new HDate(2024, 1, 19),
				'SLIM Moon Landing',
				'Japan\'s SLIM lander achieves a precision landing on the Moon.'
			),
		]
	);
}