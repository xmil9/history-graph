import { HDate, HDateFormat, HPeriod } from "../model/historic-date";
import { HgLayout } from "./layout-types";

export enum TickFormat {
	EpochForTimeline,
	EpochForViewedPeriod,
	FixedNumber
}

export interface Tick {
	date: HDate;
	label: string;
}

interface TickRange {
	// Do not use HPeriod here because we have to allow the year value to be zero.
	startYear: number;
	endYear: number;
	interval: number;
}

function invalidTickRange(): TickRange {
	return { startYear: 0, endYear: 0, interval: 0 };
}

function isValidTickRange(range: TickRange): boolean {
	return range.interval > 0;
}

export class TickCalculator {
	private range?: TickRange;

	constructor(private format: TickFormat) { }

	calculateTicks(
		period: HPeriod,
		dateFormat: HDateFormat,
		layout: HgLayout,
		recalcInterval = false
	): Tick[] {
		const tickInterval = recalcInterval ? undefined : this.range?.interval;
		const viewedPeriod = this.getViewedPeriod(period, layout);
		if (viewedPeriod === undefined) {
			return [];
		}

		switch (this.format) {
		case TickFormat.EpochForTimeline:
			this.range = this.calcTimelineEpochTickRange(period, tickInterval);
			break;
		case TickFormat.EpochForViewedPeriod:
			this.range = this.calcViewedEpochTickRange(period, viewedPeriod, tickInterval);
			break;
		case TickFormat.FixedNumber:
			this.range = this.calcFixedNumberTickRange(period, viewedPeriod, 10, tickInterval);
			break;
		}

		if (!isValidTickRange(this.range)) {
			return [];
		}

		const from = this.range.startYear;
		const to = this.range.endYear;
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

	private getViewedPeriod(period: HPeriod, layout: HgLayout): HPeriod | undefined {
		const overview = layout.overview;
		const startRatio = (overview.viewedBounds.left - overview.axisBounds.left) / overview.axisBounds.width;
		const viewedStartYear = Math.floor(period.from.year + startRatio * (period.to.year - period.from.year));
		const endRatio = (overview.viewedBounds.right - overview.axisBounds.left) / overview.axisBounds.width;
		const viewedEndYear = Math.ceil(period.from.year + endRatio * (period.to.year - period.from.year));

		if (viewedStartYear >= viewedEndYear) {
			return undefined;
		}
		return new HPeriod(new HDate(viewedStartYear), new HDate(viewedEndYear));
	}

	// Calculates a tick range that matches the viewport of the given period and a given number of ticks.
	private calcFixedNumberTickRange(
		period: HPeriod,
		viewedPeriod: HPeriod | undefined,
		numTicks: number,
		withInterval?: number
	): TickRange {
		if (viewedPeriod === undefined || numTicks <= 0) {
			return invalidTickRange();
		}

		const viewedYears = viewedPeriod.to.year - viewedPeriod.from.year;

		// Limit number of ticks to one per year.
		if (viewedYears < numTicks) {
			numTicks = viewedYears;
		}

		const interval = withInterval !== undefined ? withInterval : Math.ceil(viewedYears / numTicks);

		return this.calcTickRange(period, viewedPeriod, interval);
	}

	// Calculates the tick range that suits the epoch of the given period.
	// For example, if the period is 100 years long, the interval will be 10 years.
	// If the period is 1000 years long, the interval will be 100 years.
	private calcTimelineEpochTickRange(period: HPeriod, withInterval?: number): TickRange {
		const years = period.to.year - period.from.year;
		if (years === 0) {
			return invalidTickRange();
		}

		let interval = withInterval;
		if (interval === undefined) {
			const log = Math.log10(years);
			interval = Math.pow(10, Math.floor(log));
		}

		return this.calcTickRange(period, period, interval);
	}

	// Calculates the tick range that suits the epoch of the given viewed period.
	// For example, if the viewed period is 100 years long, the interval will be 10 years.
	// If the viewed period is 1000 years long, the interval will be 100 years.
	private calcViewedEpochTickRange(
		period: HPeriod,
		viewedPeriod: HPeriod | undefined,
		withInterval?: number
	): TickRange {
		if (viewedPeriod === undefined) {
			return invalidTickRange();
		}

		const viewedYears = viewedPeriod.to.year - viewedPeriod.from.year;

		let interval = withInterval;
		if (interval === undefined) {
			const log = Math.log10(viewedYears);
			interval = Math.pow(10, Math.floor(log));
		}

		return this.calcTickRange(period, viewedPeriod, interval);
	}

	private calcTickRange(
		period: HPeriod,
		viewedPeriod: HPeriod,
		interval: number
	): TickRange {
		// Always base the tick period on the timeline start year to avoid jumping of ticks when
		// panning.
		const startYear = period.from.year +
			Math.floor(Math.abs(period.from.year - viewedPeriod.from.year) / interval) * interval;
		const endYear = period.from.year +
			Math.ceil(Math.abs(period.from.year - viewedPeriod.to.year) / interval) * interval;

		if (startYear >= endYear)
			return invalidTickRange();

		return { startYear, endYear, interval };
	}
}
