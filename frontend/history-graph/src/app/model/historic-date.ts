enum TimeScale {
	// Dates from 5000 BC to current (or 5000 AD if future dates are used).
	Historic,
	// Dates outside of the historic time scale.
	Geological,
}

// Historic time duration. Measured in days.
export type HDuration = number;

// Historic date.
// The circa-property is ignored by all functionality except for the equals comparision. It is purely for
// informational purposes.
export class HDate {
    constructor(
        public readonly year: number,
        public readonly month?: number,	// [1-12]
        public readonly day?: number,	// [1-31]
		public readonly circa = false,
    ) {
		if (this.year === 0)
			throw new Error('Unable to create historic date. Year zero is not a valid year.');
		if (this.month && (this.month < 1 || this.month > 12))
			throw new Error('Unable to create historic date. Month is not valid.');
		if (this.day && (this.day < 1 || this.day > 31))
			throw new Error('Unable to create historic date. Day is not valid.');
		if (!this.month && this.day) {
			console.warn('Invalid historic date. Date cannot have a day set but not a month. Clearing day.')
			this.day = undefined;
		}
	}

	get timeScale(): TimeScale {
		if (this.year < -5000 || this.year > 5000)
			return TimeScale.Geological;
		return TimeScale.Historic;
	}

	equals(other: HDate): boolean {
		return this.year === other.year &&
			this.month === other.month &&
			this.day === other.day &&
			this.circa === other.circa;
	}

	less(other: HDate): boolean {
		if (this.year !== other.year)
			return this.year < other.year;

		const month = this.month ?? 1; 
		const otherMonth = other.month ?? 1; 
		if (month !== otherMonth)
			return month < otherMonth;

		const day = this.day ?? 1; 
		const otherDay = other.day ?? 1; 
		if (day !== otherDay)
			return day < otherDay;

		return false;
	}

	lessEqual(other: HDate): boolean {
		if (this.equals(other))
			return true;
		return this.less(other);
	}

	greater(other: HDate): boolean {
		return !this.lessEqual(other);
	}

	greaterEqual(other: HDate): boolean {
		return !this.less(other);
	}

	timeLeftInMonth(): HDuration {
		if (!this.month)
			return 0;

		let time = this.day ? -this.day : 0;
		if (this.month === 2)
			time += isLeapYear(this.year) ? 29 : 28;
		else
			time += DaysInMonth[this.month - 1];
		return time;
	}

	timePassedInMonth(): HDuration {
		return this.month ? (this.day ?? 0) : 0;
	}

	timeLeftInYear() : HDuration {
		if (!this.month)
			return daysInYear(this.year);

		let time = this.timeLeftInMonth();
		for (let i = this.month; i <= 12; ++i)
			time += DaysInMonth[i - 1];
		return time;
	}

	timePassedInYear() : HDuration {
		if (!this.month)
			return 0;

		let time = this.timePassedInMonth();
		for (let i = this.month; i >= 1; --i)
			time += DaysInMonth[i - 1];
		return time;
	}
}

const DaysInMonth = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

// Calculation for Greagorian calendar. Used after 1582.
export function isGregorianLeapYear(year: number): boolean {
	if (year % 4 !== 0)
		return false;
	if (year % 100 !== 0)
		return true;
	if (year % 400 === 0)
		return true;
	return false;
}

// Calculation for Julian calendar. Used before 1582.
export function isJulianLeapYear(year: number): boolean {
	if (year % 4 !== 0)
		return false;
	return false;
}

export function isLeapYear(year: number): boolean {
	// For simplicity use calculation for Gregorian calendar.
	return isGregorianLeapYear(year);
}

export function daysInYear(year: number): number {
	return isLeapYear(year) ? 366 : 365;
}

export function historicDuration(from: HDate, to: HDate): HDuration {
	if (from.greater(to))
		return -historicDuration(to, from);

	let d = 0;
	if (from.year !== to.year) {
		d += from.timeLeftInYear();
		d += to.timePassedInYear();
		for (let i = from.year + 1; i < to.year; ++i)
			d += daysInYear(i);
	} else if (from.month !== to.month) {
		d += from.timeLeftInMonth();
		d += to.timePassedInMonth();
		for (let i = (from.month ?? 1) + 1; i < (to.month ?? 1); ++i)
			d += DaysInMonth[i];
	} else if (from.day !== to.day) {
		d += (to.day ?? 1) - (from.day ?? 1);
	}

	return d;
}

export function geologicalDuration(from: HDate, to: HDate): HDuration {
	// Only consider years.
	return (to.year - from.year) * 365;
}

export function duration(from: HDate, to: HDate): HDuration {
	if (from.timeScale === TimeScale.Geological || to.timeScale === TimeScale.Geological)
		return geologicalDuration(from, to);
	return historicDuration(from, to);
}

// Historic time period. A span between two dates.
export class HPeriod {
	constructor(
		public readonly from: HDate,
		public readonly to: HDate,
	) {
		if (from.greaterEqual(to))
			throw new Error('Unable to create historic period. Start date must be less than end date.');
	}

	contains(date: HDate): boolean {
		return date.greaterEqual(this.from) && date.less(this.to);
	}

	position(date: HDate): number | undefined {
		if (!this.contains(date))
			return undefined;
		return duration(this.from, date) / duration(this.from, this.to);
	}
}

///////////////////

export type DateSeparator = '/' | '.' | '-' | ' ';

export const MonthAbbreviations = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];
export const MonthFullNames = [
	'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ];

export const DayAbbreviations = [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ];
export const DayFullNames = [
	'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ];

// YY - two-digit year, e.g. 24
// YYYY - four-digit year, e.g. 2024
// M - one-digit month for months below 10, e.g. 3
// MM - two-digit month, e.g. 03
// MMM - three-letter abbreviation for month, e.g. Mar
// MMMM - month spelled out in full, e.g. March
// D - one-digit day of the month for days below 10, e.g. 2
// DD - two-digit day of the month, e.g. 02
// DDD - three-letter abbreviation for day of the week, e.g. Fri
// DDDD - day of the week spelled out in full, e.g. Friday

export interface HDateFormat {
    format(date: HDate): string;
}

export class MDYYYYFormat implements HDateFormat {
	constructor(private readonly separator: DateSeparator) {
	}

    format(date: HDate): string {
		let s = '';
		if (date.month)
			s += `${date.month}${this.separator}`;
		if (date.month && date.day)
			s += `${date.day}${this.separator}`;
		s += date.year.toString();
        return s;
    }
}

export class MMMDYYYYFormat implements HDateFormat {
    format(date: HDate): string {
		let s = '';
		if (date.month)
			s += `${MonthAbbreviations[date.month - 1]} `;
		if (date.month && date.day)
			s += `${date.day} `;
		s += date.year.toString();
        return s;
    }
}

export const DEFAULT_DATE_FORMAT: HDateFormat = new MDYYYYFormat('-');
