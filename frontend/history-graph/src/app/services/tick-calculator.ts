import { duration, HDate, HDateFormat, HPeriod } from "../model/historic-date";

export interface Tick {
	date: HDate;
	label: string;
	// Relative position of the tick in the timeline.
	tlRatio: number;
}

export function calculateTicks(period: HPeriod, dateFormat: HDateFormat): Tick[] {
	const interval = intervalInYears(period);
		if (interval === 0) {
			return [];
		}

		const tlStartYear = period.from.year;
		const tlDuration = period.duration;

		// Add ticks for half the timeline duration on each side.
		// const margin = (this.timeline.to.year - this.timeline.from.year) / 2;
		const margin = 0;
		const from = Math.ceil((tlStartYear - margin) / interval) * interval;
		const to = Math.floor((period.to.year + margin) / interval) * interval;

		const ticks: Tick[] = [];
		for (let year = from; year <= to; year += interval) {
			const date = new HDate(year);
			const ratio = year < tlStartYear ?
				-duration(date, period.from) / tlDuration :
				duration(period.from, date) / tlDuration;
			ticks.push({
				date,
				label: dateFormat.format(date),
				tlRatio: ratio
			});
		}

		return ticks;
}

function intervalInYears(period: HPeriod): number {
	const years = period.to.year - period.from.year;
	if (years === 0) {
		return 0;
	}
	const log = Math.log10(years);
	return Math.pow(10, Math.floor(log));
}
