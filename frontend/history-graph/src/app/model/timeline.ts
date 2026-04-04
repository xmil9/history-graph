import { HDate, HPeriod } from "./historic-date";
import { GeoLocation } from "./geo-location";
import { HEvent } from "./historic-event";
import { IdGenerator } from "./id-generator";

export class Timeline {
	constructor(
		public readonly id: number,
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

export function makeDefaultTimelines(idGen: IdGenerator): Timeline[] {
	return [
		makeSpaceFlightTimeline(idGen.nextId()),
		makeAstronomyTimeline(idGen.nextId()),
	];
}

function makeSpaceFlightTimeline(id: number): Timeline {
	let eventIdx = 0;
	return new Timeline(
		id,
		'Space Flight History',
		new HPeriod(new HDate(1955), new HDate(2026)),
		[
			new HEvent(
				new HDate(1957, 10, 4),
				'Sputnik 1 Launch',
				id,
				eventIdx++,
				'The Soviet Union launches Sputnik 1, the first artificial satellite to orbit Earth, marking the beginning of the Space Age.',
				new GeoLocation(45.920, 63.342) // Baikonur Cosmodrome
			),
			new HEvent(
				new HDate(1957, 11, 3),
				'Sputnik 2 Launch',
				id,
				eventIdx++,
				'The Soviet Union launches Sputnik 2, carrying the dog Laika, the first animal to orbit Earth.',
				new GeoLocation(45.920, 63.342) // Baikonur Cosmodrome
			),
			new HEvent(
				new HDate(1958, 1, 31),
				'Explorer 1 Launch',
				id,
				eventIdx++,
				'The United States launches Explorer 1, its first artificial satellite.',
				new GeoLocation(28.450, -80.527) // Cape Canaveral
			),
			new HEvent(
				new HDate(1961, 4, 12),
				'Vostok 1 - First Human in Space',
				id,
				eventIdx++,
				'Yuri Gagarin (Soviet Union) becomes the first human in space, orbiting Earth once in Vostok 1.',
				new GeoLocation(45.920, 63.342) // Baikonur Cosmodrome
			),
			new HEvent(
				new HDate(1961, 5, 5),
				'Freedom 7 - First American in Space',
				id,
				eventIdx++,
				'Alan Shepard becomes the first American in space, making a suborbital flight in Freedom 7.',
				new GeoLocation(28.450, -80.527) // Cape Canaveral
			),
			new HEvent(
				new HDate(1962, 2, 20),
				'Friendship 7 - First American to Orbit Earth',
				id,
				eventIdx++,
				'John Glenn becomes the first American to orbit Earth in Friendship 7.',
				new GeoLocation(28.450, -80.527) // Cape Canaveral
			),
			new HEvent(
				new HPeriod(new HDate(1963, 6, 16), new HDate(1963, 6, 19)),
				'Vostok 6 - First Woman in Space',
				id,
				eventIdx++,
				'Valentina Tereshkova (Soviet Union) becomes the first woman in space.',
				new GeoLocation(45.920, 63.342) // Baikonur Cosmodrome
			),
			new HEvent(
				new HDate(1965, 3, 18),
				'Voskhod 2 - First Spacewalk',
				id,
				eventIdx++,
				'Alexei Leonov (Soviet Union) performs the first spacewalk.',
				new GeoLocation(45.920, 63.342) // Baikonur Cosmodrome
			),
			new HEvent(
				new HPeriod(new HDate(1969, 7, 20), new HDate(1969, 7, 24)),
				'Apollo 11 - First Moon Landing',
				id,
				eventIdx++,
				'Neil Armstrong and Buzz Aldrin become the first humans to land on the Moon.',
				new GeoLocation(28.572, -80.648) // Kennedy Space Center
			),
			new HEvent(
				new HDate(1971, 4, 19),
				'Salyut 1 - First Space Station',
				id,
				eventIdx++,
				'The Soviet Union launches Salyut 1, the first space station.',
				new GeoLocation(45.920, 63.342) // Baikonur Cosmodrome
			),
			new HEvent(
				new HPeriod(new HDate(1981, 4, 12), new HDate(1981, 4, 14)),
				'STS-1 - First Space Shuttle Flight',
				id,
				eventIdx++,
				'The United States launches the Space Shuttle Columbia on its first flight, STS-1.',
				new GeoLocation(28.572, -80.648) // Kennedy Space Center
			),
			new HEvent(
				new HPeriod(new HDate(1998, 11, 20), new HDate(1998, 12, 1)),
				'ISS Assembly Begins',
				id,
				eventIdx++,
				'The first module of the International Space Station (ISS), Zarya, is launched.',
				new GeoLocation(45.920, 63.342) // Baikonur Cosmodrome
			),
			new HEvent(
				new HPeriod(new HDate(2000), new HDate(2024)),
				'Continuous ISS Habitation',
				id,
				eventIdx++,
				'The International Space Station has been continuously inhabited since November 2, 2000.',
				new GeoLocation(45.920, 63.342) // Baikonur Cosmodrome
			),
			new HEvent(
				new HDate(2001, 4, 28),
				'Dennis Tito - First Space Tourist',
				id,
				eventIdx++,
				'Dennis Tito becomes the first paying space tourist, visiting the ISS.',
				new GeoLocation(45.920, 63.342) // Baikonur Cosmodrome
			),
			new HEvent(
				new HDate(2012, 8, 6),
				'Curiosity Rover Landing',
				id,
				eventIdx++,
				'The Curiosity rover lands on Mars.',
				new GeoLocation(28.450, -80.527) // Cape Canaveral (Launch)
			),
			new HEvent(
				new HDate(2020, 5, 30),
				'SpaceX Crew Dragon Demo-2',
				id,
				eventIdx++,
				'SpaceX becomes the first private company to launch humans into orbit.',
				new GeoLocation(28.572, -80.648) // Kennedy Space Center
			),
			new HEvent(
				new HDate(2021, 2, 18),
				'Perseverance Rover Landing',
				id,
				eventIdx++,
				'The Perseverance rover lands on Mars, carrying the Ingenuity helicopter.',
				new GeoLocation(28.450, -80.527) // Cape Canaveral (Launch)
			),
			new HEvent(
				new HDate(2022, 12, 11),
				'Artemis 1 - Uncrewed Lunar Orbit',
				id,
				eventIdx++,
				'The Artemis 1 mission successfully completes an uncrewed test flight around the Moon.',
				new GeoLocation(28.572, -80.648) // Kennedy Space Center
			),
			new HEvent(
				new HDate(2024, 1, 19),
				'SLIM Moon Landing',
				id,
				eventIdx++,
				'Japan\'s SLIM lander achieves a precision landing on the Moon.',
				new GeoLocation(30.400, 130.970) // Tanegashima Space Center
			),
		]
	);
}

function makeAstronomyTimeline(id: number): Timeline {
	let eventIdx = 0;
	return new Timeline(
		id,
		'Astronomy Timeline',
		new HPeriod(new HDate(-3000), new HDate(2026)),
		[
			new HEvent(
				new HPeriod(new HDate(-3000), new HDate(-2000)),
				'Early Babylonian Astronomy',
				id,
				eventIdx++,
				'Babylonians develop systematic astronomical observations, recording positions of stars and planets, and laying the groundwork for astrology.',
				new GeoLocation(32.536, 44.420) // Babylon
			),
			new HEvent(
				new HPeriod(new HDate(-2500), new HDate(-2000)),
				'Egyptian Astronomy',
				id,
				eventIdx++,
				'Egyptians develop a solar calendar based on the rising of Sirius and construct astronomical alignments in monuments like pyramids.',
				new GeoLocation(29.979, 31.134) // Giza
			),
			new HEvent(
				new HPeriod(new HDate(-600), new HDate(-500)),
				'Thales of Miletus',
				id,
				eventIdx++,
				'Thales predicts a solar eclipse, demonstrating a naturalistic understanding of celestial events.',
				new GeoLocation(37.530, 27.276) // Miletus
			),
			new HEvent(
				new HPeriod(new HDate(-350), new HDate(-300)),
				'Aristotle\'s Cosmology',
				id,
				eventIdx++,
				'Aristotle proposes a geocentric model of the universe with Earth at the center and celestial spheres carrying the planets and stars.',
				new GeoLocation(37.983, 23.727) // Athens
			),
			new HEvent(
				new HPeriod(new HDate(-280), new HDate(-220)),
				'Aristarchus of Samos',
				id,
				eventIdx++,
				'Aristarchus proposes a heliocentric model of the solar system, but it is not widely accepted.',
				new GeoLocation(37.750, 26.966) // Samos
			),
			new HEvent(
				new HPeriod(new HDate(150), new HDate(170)),
				'Ptolemy\'s Almagest',
				id,
				eventIdx++,
				'Ptolemy compiles a comprehensive astronomical treatise, the Almagest, which presents a detailed geocentric model and becomes the standard reference for over 1400 years.',
				new GeoLocation(31.200, 29.918) // Alexandria
			),
			new HEvent(
				new HPeriod(new HDate(800), new HDate(873)),
				'Islamic Golden Age Astronomy',
				id,
				eventIdx++,
				'Islamic scholars translate and preserve Greek astronomical texts, make new observations, and develop improved astronomical instruments.',
				new GeoLocation(33.315, 44.366) // Baghdad
			),
			new HEvent(
				new HDate(1543),
				'Copernicus\' De Revolutionibus',
				id,
				eventIdx++,
				'Nicolaus Copernicus publishes \'De Revolutionibus Orbium Coelestium\', presenting a detailed heliocentric model of the solar system.',
				new GeoLocation(54.358, 19.682) // Frombork
			),
			new HEvent(
				new HPeriod(new HDate(1609), new HDate(1610)),
				'Galileo\'s Telescopic Observations',
				id,
				eventIdx++,
				'Galileo Galilei uses a telescope to observe the Moon, Jupiter\'s moons, and phases of Venus, providing strong evidence for the heliocentric model.',
				new GeoLocation(45.406, 11.876) // Padua
			),
			new HEvent(
				new HDate(1687),
				'Newton\'s Principia Mathematica',
				id,
				eventIdx++,
				'Isaac Newton publishes \'Principia Mathematica\', formulating the law of universal gravitation and providing a physical explanation for Kepler\'s laws of planetary motion.',
				new GeoLocation(52.205, 0.119) // Cambridge
			),
			new HEvent(
				new HDate(1705),
				'Huygens\' Cosmotheoros',
				id,
				eventIdx++,
				'Christiaan Huygens publishes \'Cosmotheoros\', speculating on the possibility of life on other planets.',
				new GeoLocation(52.070, 4.300) // The Hague
			),
			new HEvent(
				new HDate(1781),
				'Herschel Discovers Uranus',
				id,
				eventIdx++,
				'William Herschel discovers the planet Uranus, expanding the known solar system.',
				new GeoLocation(51.381, -2.359) // Bath
			),
			new HEvent(
				new HPeriod(new HDate(1838), new HDate(1840)),
				'First Stellar Parallax Measurements',
				id,
				eventIdx++,
				'Friedrich Bessel, Thomas Henderson, and Friedrich Georg Wilhelm Struve independently measure the parallax of stars, providing the first direct evidence of stellar distances.',
				new GeoLocation(54.706, 20.510) // Königsberg
			),
			new HEvent(
				new HPeriod(new HDate(1924), new HDate(1925)),
				'Hubble Discovers Galaxies',
				id,
				eventIdx++,
				'Edwin Hubble proves that nebulae are actually galaxies outside our own Milky Way, revolutionizing our understanding of the universe\'s scale.',
				new GeoLocation(34.225, -118.057) // Mount Wilson Observatory
			),
			new HEvent(
				new HDate(1929),
				'Hubble\'s Law',
				id,
				eventIdx++,
				'Edwin Hubble discovers the relationship between a galaxy\'s distance and its recession velocity, now known as Hubble\'s Law, providing evidence for the expanding universe.',
				new GeoLocation(34.225, -118.057) // Mount Wilson Observatory
			),
			new HEvent(
				new HPeriod(new HDate(1964), new HDate(1965)),
				'Discovery of the Cosmic Microwave Background',
				id,
				eventIdx++,
				'Arno Penzias and Robert Wilson discover the cosmic microwave background radiation, providing strong evidence for the Big Bang theory.',
				new GeoLocation(40.390, -74.184) // Holmdel Horn Antenna
			),
			new HEvent(
				new HDate(1990),
				'Hubble Space Telescope Launched',
				id,
				eventIdx++,
				'The Hubble Space Telescope is launched into orbit, providing unprecedented views of the universe.',
				new GeoLocation(28.572, -80.648) // Kennedy Space Center
			),
			new HEvent(
				new HDate(1995),
				'First Exoplanet Discovery',
				id,
				eventIdx++,
				'Michel Mayor and Didier Queloz discover 51 Pegasi b, the first exoplanet orbiting a Sun-like star.',
				new GeoLocation(43.929, 5.713) // Haute-Provence Observatory
			),
			new HEvent(
				new HDate(2009),
				'Kepler Space Telescope Launched',
				id,
				eventIdx++,
				'The Kepler Space Telescope is launched, dedicated to discovering Earth-sized planets orbiting other stars.',
				new GeoLocation(28.450, -80.527) // Cape Canaveral
			),
			new HEvent(
				new HDate(2015),
				'First Direct Image of an Exoplanet',
				id,
				eventIdx++,
				'Scientists capture the first direct image of an exoplanet, Beta Pictoris b.',
				new GeoLocation(-24.627, -70.404) // Paranal Observatory (VLT)
			),
			new HEvent(
				new HDate(2019),
				'First Image of a Black Hole',
				id,
				eventIdx++,
				'The Event Horizon Telescope captures the first image of a black hole, located in the galaxy M87.',
				new GeoLocation(42.381, -71.128) // Harvard-Smithsonian Center for Astrophysics
			),
			new HEvent(
				new HDate(2021),
				'James Webb Space Telescope Launched',
				id,
				eventIdx++,
				'The James Webb Space Telescope is launched, promising to revolutionize our understanding of the early universe and exoplanets.',
				new GeoLocation(5.239, -52.768) // Guiana Space Centre
			)
	  	]
	);
}
