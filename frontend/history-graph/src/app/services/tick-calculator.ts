import { duration, HDate, HDateFormat, HPeriod } from "../model/historic-date";
import { HgLayout, TimelineViewport } from "./layout-types";

export interface Tick {
	date: HDate;
	label: string;
	// Relative position of the tick in the timeline.
	tlRatio: number;
}

export function calculateTicks(period: HPeriod, dateFormat: HDateFormat, layout: HgLayout): Tick[] {
		// const tickRange = calcViewedTickRange(period, layout, 10);
		const tickRange = calcEpochTickRange(period);
		if (tickRange.interval === 0) {
			return [];
		}
		
		const from = tickRange.period.from.year;
		const to = tickRange.period.to.year;
		const interval = tickRange.interval;
		const periodDuration = period.duration;

		const ticks: Tick[] = [];
		for (let year = from; year <= to; year += interval) {
			const date = new HDate(year);
			const ratio = duration(period.from, date) / periodDuration;
			ticks.push({
				date,
				label: dateFormat.format(date),
				tlRatio: ratio
			});
		}

		return ticks;
}

///////////////////

interface TickRange {
	period: HPeriod;
	interval: number;
}

// Calculates the tick range that matches the viewport of the given period and the given number of ticks.
function calcViewedTickRange(period: HPeriod, layout: HgLayout, numTicks: number): TickRange {
	const years = period.to.year - period.from.year;
	if (years === 0) {
		return { period, interval: 0 };
	}

	const overview = layout.overview;
	const startRatio = (overview.viewedBounds.left - overview.axisBounds.left) / overview.axisBounds.width;
	const startYear = Math.floor(period.from.year + startRatio * years)	;
	const endRatio = (overview.viewedBounds.right - overview.axisBounds.left) / overview.axisBounds.width;
	const endYear = Math.floor(period.from.year + endRatio * years);

	const viewedPeriod = new HPeriod(
		new HDate(startYear),
		new HDate(endYear)
	);

	const viewedYears = viewedPeriod.to.year - viewedPeriod.from.year;
	const interval = Math.floor(viewedYears / numTicks);

	return { period: viewedPeriod, interval };
}

// Calculates the tick range that suits the epoch of the given period.
// For example, if the period is 100 years long, the interval will be 10 years.
// If the period is 1000 years long, the interval will be 100 years.
function calcEpochTickRange(period: HPeriod): TickRange {
	const years = period.to.year - period.from.year;
	if (years === 0) {
		return { period, interval: 0 };
	}
	
	const log = Math.log10(years);
	const interval = Math.pow(10, Math.floor(log));

	const startYear = Math.ceil(period.from.year / interval) * interval;
	const endYear = Math.floor(period.to.year / interval) * interval;

	return { period: new HPeriod(new HDate(startYear), new HDate(endYear)), interval };
}
