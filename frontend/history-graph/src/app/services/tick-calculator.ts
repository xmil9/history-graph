import { HDate, HDateFormat, HPeriod } from "../model/historic-date";
import { HgLayout } from "./layout-types";

export interface Tick {
	date: HDate;
	label: string;
}

export function calculateTicks(period: HPeriod, dateFormat: HDateFormat, layout: HgLayout): Tick[] {
		const tickRange = calcViewedTickRange(period, layout, 10);
		// const tickRange = calcEpochTickRange(period);
		if (tickRange.interval === 0) {
			return [];
		}
		
		const from = tickRange.period.from.year;
		const to = tickRange.period.to.year;
		const interval = tickRange.interval;

		const ticks: Tick[] = [];
		for (let year = from; year <= to; year += interval) {
			const date = new HDate(year);
			ticks.push({
				date,
				label: dateFormat.format(date)
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
	if (numTicks <= 0) {
		return { period, interval: 0 };
	}
	
	const years = period.to.year - period.from.year;
	if (years === 0) {
		return { period, interval: 0 };
	}

	const overview = layout.overview;
	const startRatio = (overview.viewedBounds.left - overview.axisBounds.left) / overview.axisBounds.width;
	const startYear = Math.ceil(period.from.year + startRatio * years)	;
	const endRatio = (overview.viewedBounds.right - overview.axisBounds.left) / overview.axisBounds.width;
	const endYear = Math.floor(period.from.year + endRatio * years);

	const viewedYears = endYear - startYear;
	if (viewedYears === 0) {
		return { period, interval: 0 };
	}
	else if (viewedYears < numTicks) {
		numTicks = viewedYears;
	}

	const interval = Math.floor(viewedYears / numTicks);
	const endYearForNonDecimalInterval = startYear + interval * numTicks;

	const viewedPeriod = new HPeriod(
		new HDate(startYear),
		new HDate(endYearForNonDecimalInterval)
	);


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
