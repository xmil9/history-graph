import { HDate, HDateFormat, HPeriod } from "../model/historic-date";
import { HgLayout } from "./layout-types";

export interface Tick {
	date: HDate;
	label: string;
}

interface TickRange {
	period: HPeriod;
	interval: number;
}

export class TickCalculator
{
	private range?: TickRange;

	calculateTicks(period: HPeriod, dateFormat: HDateFormat, layout: HgLayout, recalcInterval = false): Tick[] {
		const tickInterval = recalcInterval ? undefined : this.range?.interval;
		this.range = calcViewedTickRange(period, layout, 10, tickInterval);
		// this.range = calcEpochTickRange(period, tickInterval);
		if (this.range.interval === 0) {
			return [];
		}
		
		const from = this.range.period.from.year;
		const to = this.range.period.to.year;
		const interval = this.range.interval;

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
}

///////////////////

// Calculates the tick range that matches the viewport of the given period and the given number of ticks.
function calcViewedTickRange(period: HPeriod, layout: HgLayout, numTicks: number, withInterval?: number): TickRange {
	if (numTicks <= 0) {
		return { period, interval: 0 };
	}
	
	const years = period.to.year - period.from.year;
	if (years === 0) {
		return { period, interval: 0 };
	}

	// Calculate the time period that is displayed.
	const overview = layout.overview;
	const startRatio = (overview.viewedBounds.left - overview.axisBounds.left) / overview.axisBounds.width;
	const viewedStartYear = Math.floor(period.from.year + startRatio * years)	;
	const endRatio = (overview.viewedBounds.right - overview.axisBounds.left) / overview.axisBounds.width;
	const viewedEndYear = Math.ceil(period.from.year + endRatio * years);

	const viewedYears = viewedEndYear - viewedStartYear;

	// For now, no ticks for less than one year time periods.
	if (viewedYears === 0) {
		return { period, interval: 0 };
	}

	// Limit number of ticks to one per year.
	if (viewedYears < numTicks) {
		numTicks = viewedYears;
	}

	const interval = withInterval !== undefined ? withInterval : Math.ceil(viewedYears / numTicks);
	// Always base the tick period on the timeline start year to avoid jumping of ticks when
	// panning.
	const tickStartYear = period.from.year + Math.floor(Math.abs(period.from.year - viewedStartYear) / interval) * interval;
	const tickEndYear = period.from.year + Math.ceil(Math.abs(period.from.year - viewedEndYear) / interval) * interval;

	if (tickStartYear >= tickEndYear)
		return { period, interval: 0};

	const tickPeriod = new HPeriod(
		new HDate(tickStartYear),
		new HDate(tickEndYear)
	);

	return { period: tickPeriod, interval };
}

// Calculates the tick range that suits the epoch of the given period.
// For example, if the period is 100 years long, the interval will be 10 years.
// If the period is 1000 years long, the interval will be 100 years.
function calcEpochTickRange(period: HPeriod, withInterval?: number): TickRange {
	const years = period.to.year - period.from.year;
	if (years === 0) {
		return { period, interval: 0 };
	}
	
	let interval = withInterval;
	if (interval === undefined) {
		const log = Math.log10(years);
		interval = Math.pow(10, Math.floor(log));
	}

	const startYear = Math.ceil(period.from.year / interval) * interval;
	const endYear = Math.floor(period.to.year / interval) * interval;

	return { period: new HPeriod(new HDate(startYear), new HDate(endYear)), interval };
}
