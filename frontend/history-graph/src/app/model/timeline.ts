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

	get duration() {
		return this.period.duration;
	}
}

export function makeDefaultTimelines(): Timeline[] {
	return [
		makeSpaceFlightTimeline(),
		makeAstronomyTimeline(),
	];
}

function makeSpaceFlightTimeline(): Timeline {
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

function makeAstronomyTimeline(): Timeline {
	return new Timeline(
		'Astronomy Timeline',
		new HPeriod(new HDate(-3000), new HDate(2026)),
		[
			new HEvent(
				new HPeriod(new HDate(-3000), new HDate(-2000)),
				'Early Babylonian Astronomy',
				'Babylonians develop systematic astronomical observations, recording positions of stars and planets, and laying the groundwork for astrology.'
			),
			new HEvent(
				new HPeriod(new HDate(-2500), new HDate(-2000)),
				'Egyptian Astronomy',
				'Egyptians develop a solar calendar based on the rising of Sirius and construct astronomical alignments in monuments like pyramids.'
			),
			new HEvent(
				new HPeriod(new HDate(-600), new HDate(-500)),
				'Thales of Miletus',
				'Thales predicts a solar eclipse, demonstrating a naturalistic understanding of celestial events.'
			),
			new HEvent(
				new HPeriod(new HDate(-350), new HDate(-300)),
				'Aristotle\'s Cosmology',
				'Aristotle proposes a geocentric model of the universe with Earth at the center and celestial spheres carrying the planets and stars.'
			),
			new HEvent(
				new HPeriod(new HDate(-280), new HDate(-220)),
				'Aristarchus of Samos',
				'Aristarchus proposes a heliocentric model of the solar system, but it is not widely accepted.'
			),
			new HEvent(
				new HPeriod(new HDate(150), new HDate(170)),
				'Ptolemy\'s Almagest',
				'Ptolemy compiles a comprehensive astronomical treatise, the Almagest, which presents a detailed geocentric model and becomes the standard reference for over 1400 years.'
			),
			new HEvent(
				new HPeriod(new HDate(800), new HDate(873)),
				'Islamic Golden Age Astronomy',
				'Islamic scholars translate and preserve Greek astronomical texts, make new observations, and develop improved astronomical instruments.'
			),
			new HEvent(
				new HDate(1543),
				'Copernicus\' De Revolutionibus',
				'Nicolaus Copernicus publishes \'De Revolutionibus Orbium Coelestium\', presenting a detailed heliocentric model of the solar system.'
			),
			new HEvent(
				new HPeriod(new HDate(1609), new HDate(1610)),
				'Galileo\'s Telescopic Observations',
				'Galileo Galilei uses a telescope to observe the Moon, Jupiter\'s moons, and phases of Venus, providing strong evidence for the heliocentric model.'
			),
			new HEvent(
				new HDate(1687),
				'Newton\'s Principia Mathematica',
				'Isaac Newton publishes \'Principia Mathematica\', formulating the law of universal gravitation and providing a physical explanation for Kepler\'s laws of planetary motion.'
			),
			new HEvent(
				new HDate(1705),
				'Huygens\' Cosmotheoros',
				'Christiaan Huygens publishes \'Cosmotheoros\', speculating on the possibility of life on other planets.'
			),
			new HEvent(
				new HDate(1781),
				'Herschel Discovers Uranus',
				'William Herschel discovers the planet Uranus, expanding the known solar system.'
			),
			new HEvent(
				new HPeriod(new HDate(1838), new HDate(1840)),
				'First Stellar Parallax Measurements',
				'Friedrich Bessel, Thomas Henderson, and Friedrich Georg Wilhelm Struve independently measure the parallax of stars, providing the first direct evidence of stellar distances.'
			),
			new HEvent(
				new HPeriod(new HDate(1924), new HDate(1925)),
				'Hubble Discovers Galaxies',
				'Edwin Hubble proves that nebulae are actually galaxies outside our own Milky Way, revolutionizing our understanding of the universe\'s scale.'
			),
			new HEvent(
				new HDate(1929),
				'Hubble\'s Law',
				'Edwin Hubble discovers the relationship between a galaxy\'s distance and its recession velocity, now known as Hubble\'s Law, providing evidence for the expanding universe.'
			),
			new HEvent(
				new HPeriod(new HDate(1964), new HDate(1965)),
				'Discovery of the Cosmic Microwave Background',
				'Arno Penzias and Robert Wilson discover the cosmic microwave background radiation, providing strong evidence for the Big Bang theory.'
			),
			new HEvent(
				new HDate(1990),
				'Hubble Space Telescope Launched',
				'The Hubble Space Telescope is launched into orbit, providing unprecedented views of the universe.'
			),
			new HEvent(
				new HDate(1995),
				'First Exoplanet Discovery',
				'Michel Mayor and Didier Queloz discover 51 Pegasi b, the first exoplanet orbiting a Sun-like star.'
			),
			new HEvent(
				new HDate(2009),
				'Kepler Space Telescope Launched',
				'The Kepler Space Telescope is launched, dedicated to discovering Earth-sized planets orbiting other stars.'
			),
			new HEvent(
				new HDate(2015),
				'First Direct Image of an Exoplanet',
				'Scientists capture the first direct image of an exoplanet, Beta Pictoris b.'
			),
			new HEvent(
				new HDate(2019),
				'First Image of a Black Hole',
				'The Event Horizon Telescope captures the first image of a black hole, located in the galaxy M87.'
			),
			new HEvent(
				new HDate(2021),
				'James Webb Space Telescope Launched',
				'The James Webb Space Telescope is launched, promising to revolutionize our understanding of the early universe and exoplanets.'
			)
	  	]
	);
}
