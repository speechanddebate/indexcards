// I never thought I'd say this about anything, but dear lord JS date handling
// makes me miss DateTime in Perl.
import { DateTime } from 'luxon';

export const isSameDay = (startDate, endDate, tzString) => {

	const fullOptions = {
		year  : 'numeric',
		month : 'numeric',
		day   : 'numeric',
	};

	if (tzString) {
		const newStart = convertTZ(startDate, tzString);
		const newEnd   = convertTZ(endDate, tzString);
		return isSameDay(newStart, newEnd);
	}

	const startString = startDate.toLocaleDateString('en-US', fullOptions);
	const endString = endDate.toLocaleDateString('en-US', fullOptions);

	if (startString === endString) {
		return true;
	}

	return false;
};

export const convertTZ = (date, tzString) => {
	return new Date(
		(typeof date === 'string' ? new Date(date) : date)
		.toLocaleString('en-US', {timeZone: tzString})
	);
};

// For mode, 'time' is time only (9:00 AM to 2:30 PM)
// 'date' is date only (Feb 1st-4th, Dec 31-Jan 2nd)
// 'datetime' is (Feb 1st - 7th, 9:00 AM to 8:00 PM)
// 'full' is (Feb 1st 9:00 AM - Feb 7th, 5:00 PM)

//  Convert the various inputs to an luxon DateTime object, if possible, scoped
//  to the locale and the timezone supplied. Inputs are assumed to always be
//  UTC unless the dt/ISO say otherwise.

export const parseDateTime = ( dateProps) => {

	let date;

	if (dateProps.dt) {
		date = DateTime.fromJSDate(dateProps.dt)
			.setZone(dateProps.tz || 'UTC')
			.setLocale(dateProps.locale || 'en-US');

	} else if (dateProps.dtISO) {
		date = DateTime.fromISO(dateProps.dtISO)
			.setZone(dateProps.tz || 'UTC')
			.setLocale(dateProps.locale || 'en-US');

	} else if (dateProps.dtString) {
		date = DateTime.fromSQL(dateProps.dtString)
			.setZone(dateProps.tz || 'UTC')
			.setLocale(dateProps.locale || 'en-US');

	} else {
		date = DateTime.local();
	}

	return date;
};

// Helper function to show the "EST" or "CDT" user friendly short TZ string in a pinch.
export const shortZone = (tzString = 'UTC', locale = 'en-US') => {

	return DateTime.now()
		.setZone(tzString)
		.setLocale(locale)
		.offsetNameShort;
};

// Helper function to get the week of the year by ISO reckoning.  Used for sorting.

export const getWeek = (date) => {
	if (!(date instanceof Date)) date = new Date();

	// ISO week date weeks start on Monday, so correct the day number
	const nDay = (date.getDay() + 6) % 7;

	// ISO 8601 states that week 1 is the week with the first Thursday of that year
	// Set the target date to the Thursday in the target week
	date.setDate(date.getDate() - nDay + 3);

	// Store the millisecond value of the target date
	const n1stThursday = date.valueOf();

	// Set the target to the first Thursday of the year
	// First, set the target to January 1st
	date.setMonth(0, 1);

	// Not a Thursday? Correct the date to the next Thursday
	if (date.getDay() !== 4) {
		date.setMonth(0, 1 + ((4 - date.getDay()) + 7) % 7);
	}

	// The week number is the number of weeks between the first Thursday of the year
	// and the Thursday in the target week (604800000 = 7 * 24 * 3600 * 1000)
	return 1 + Math.ceil((n1stThursday - date) / 604800000);
};

export const getPast = ({ days, months, years, hours, minutes }) => {

	const today = new Date();
	const lastWeek = new Date(
		today.getFullYear() - (years || 0 ),
		today.getMonth() - (months || 0),
		today.getDate() - (days || 0),
		today.getHours() - (hours || 0),
		today.getMinutes() - (minutes || 0),
	);
	return lastWeek;
};

export const getFuture = ({ days, months, years, hours, minutes }) => {

	const today = new Date();

	const lastWeek = new Date(
		today.getFullYear() + (years || 0),
		today.getMonth() + (months || 0),
		today.getDate() + (days || 0),
		today.getHours() + (hours || 0),
		today.getMinutes() + (minutes || 0),
	);

	return lastWeek;
};

// Format a Date only
export const showDate =  (dateProps) => {

	const dt = dateProps.dateTime || parseDateTime(dateProps);
	if (!dt) return '';

	if (dateProps.format === 'iso'
		|| dateProps.format === 'sortable'
	) {
		return dt.setZone('UTC').toISODate() || '';
	}

	let options = {};

	if (dateProps.format === 'full') {
		options = {
			weekday : 'long',
			year    : 'numeric',
			month   : 'long',
			day     : 'numeric',
		};
	} else if (dateProps.format === 'long') {
		options = {
			weekday : 'short',
			year    : 'numeric',
			month   : 'long',
			day     : 'numeric',
		};
	} else if (dateProps.format === 'medium') {
		options = {
			weekday : 'short',
			month   : 'short',
			day     : 'numeric',
		};
	} else if (dateProps.format === 'short') {
		options = {
			month  : 'short',
			day    : 'numeric',
		};
	} else {
		options = DateTime.DATE_FULL;
	}

	const dateString = dt.toLocaleString(options, {locale  : dateProps.locale || 'en-US'});
	return dateString || '';
};

// Format a Time only
export const showTime = (dateProps) => {

	const dt = dateProps.dateTime || parseDateTime(dateProps);
	if (!dt) return '';

	if (dateProps.format === 'iso'
		|| dateProps.format === 'sortable'
	) {
		return dt.setZone('UTC').toISOTime() || '';
	}

	let options = {};

	if (dateProps.format === 'full') {
		// US: '09:30:14 PM'  UK : '21:30:14'
		options = DateTime.TIME_WITH_SECONDS;
	} else if (dateProps.format === 'military') {
		// 21:30
		options = DateTime.TIME_24_SIMPLE;
	} else {
		// US: '09:30 PM'  UK : '21:30'
		options = DateTime.TIME_SIMPLE;
	}

	if (dateProps.format == 'daytime') {
		options.weekday = 'short';
	}

	// Showing time zones is a PITA.
	if (dateProps.showTz) {
		options.timeZoneName = 'short';
	} else if (dateProps.showFullTz) {
		options.timeZoneName = 'long';
	} else {
		delete options.timeZoneName;
	}

	let string = dt.toLocaleString(options, {locale: dateProps.locale || 'en-US'});

	if (dateProps.format === 'short') {
		string = string.replace(' PM', 'p').replace(' AM', 'a');
	}

	return string || '';
};

// Format a Date and Time combined
export const showDateTime =  (dateProps) => {

	const dt = dateProps.dateTime || parseDateTime(dateProps);
	if (!dt) return '';

	if (dateProps.format === 'iso'
		|| dateProps.format === 'sortable'
	) {
		return dt.setZone('UTC').toISO() || '';
	}

	const newProps = {...dateProps, dateTime: dt};
	let fullDate = showDate(newProps);
	fullDate += ` ${dateProps.joinWord || ''}`;
	fullDate += ` ${showTime(newProps)}`;
	return fullDate;
};

// Format a range of Dates and Times depending on the mode setting
export const showDateRange = (rangeProps) => {

	const startDtProps = {
		dt             : rangeProps.startDt,
		dtISO          : rangeProps.startISO,
		dtString       : rangeProps.startString,
		tz             : rangeProps.tz,
		locale         : rangeProps.locale,
		showTz         : false,
		showFullTz     : false,
	};

	const endDtProps = {
		dt           : rangeProps.endDt,
		dtISO        : rangeProps.endISO,
		dtString     : rangeProps.endString,
		tz           : rangeProps.tz,
		locale       : rangeProps.locale,
		showTz       : false,
		showFullTz   : false,
	};

	startDtProps.dateTime = rangeProps.startDateTime || parseDateTime(startDtProps);
	endDtProps.dateTime   = rangeProps.endDateTime || parseDateTime(endDtProps);

	if (!startDtProps.dateTime || !endDtProps.dateTime) {
		return { error: 'Start or End Date Missing' };
	}

	if (rangeProps.mode === 'full') {

		let fullOutput = '';

		fullOutput += showDate({
			...rangeProps,
			...startDtProps,
		});

		if (endDtProps.dateTime.toLocaleString({ day: 'numeric' })
			!== startDtProps.dateTime.toLocaleString({ day: 'numeric' })
		) {

			fullOutput += ' - ';
			fullOutput += showDate({
				...rangeProps,
				...endDtProps,
			});

			if (rangeProps.showTz && rangeProps.tz) {
				fullOutput += shortZone(rangeProps.tz, rangeProps.locale);
			}
		}

		return {
			fullOutput,
		};
	}

	let dateOutput = '';
	let timeOutput = '';
	let diffPoint = '';

	if (rangeProps.mode !== 'time') {

		// Find the point where the dates differ, if they do at all

		if (endDtProps.dateTime.toLocaleString({ year: 'numeric' })
			!== startDtProps.dateTime.toLocaleString({ year: 'numeric' })
		) {
			diffPoint = 'year';
		} else if (endDtProps.dateTime.toLocaleString({ month: 'numeric' })
			!== startDtProps.dateTime.toLocaleString({ month: 'numeric' })
		) {
			diffPoint = 'month';
		} else if (endDtProps.dateTime.toLocaleString({ day: 'numeric' })
			!== startDtProps.dateTime.toLocaleString({ day: 'numeric' })
		) {
			diffPoint = 'day';
		}

		if (diffPoint === 'month') {

			switch (rangeProps.format) {
				case 'short':
					dateOutput = ` ${ startDtProps.dateTime.toLocaleString({ month: 'numeric', day: 'numeric' }) }`;
					dateOutput += ` - ${ endDtProps.dateTime.toLocaleString({ month: 'numeric', day: 'numeric' }) }`;
					break;

				case 'long' :
					dateOutput = ` ${ startDtProps.dateTime.toLocaleString({ month: 'long' , day: 'numeric' }) }`;
					dateOutput += ` - ${ endDtProps.dateTime.toLocaleString({ month: 'long'  , day: 'numeric' }) }`;
					break;

				case 'full' :
					dateOutput = ` ${ startDtProps.dateTime.toLocaleString({ month: 'long' , day: 'numeric' }) }`;
					dateOutput += ` - ${ endDtProps.dateTime.toLocaleString({ month: 'long'  , day: 'numeric' }) }`;
					dateOutput += ` (
						${endDtProps.dateTime.toLocaleString({ weekday: 'short' })} — ${startDtProps.dateTime.toLocaleString({ weekday: 'short' })}
					)`;
					break;

				default:
					dateOutput = ` ${ startDtProps.dateTime.toLocaleString({ month: 'short' , day: 'numeric' }) }`;
					dateOutput += ` - ${ endDtProps.dateTime.toLocaleString({ month: 'short'  , day: 'numeric' }) }`;
			}

			if (rangeProps.format !== 'short') {
				dateOutput += `, ${startDtProps.dateTime.toLocaleString({ year : 'numeric' })}`;
			}

		} else if (diffPoint === 'day') {

			switch (rangeProps.format) {
				case 'short':
					dateOutput = ` ${ startDtProps.dateTime.toLocaleString({ month: 'numeric' }) }/`;
					break;

				case 'long' :
					dateOutput = ` ${ startDtProps.dateTime.toLocaleString({ month: 'long' }) } `;
					break;

				case 'medday':
					dateOutput = ` ${ startDtProps.dateTime.toLocaleString({ weekday: 'short' }) },`;
					dateOutput += ` ${ startDtProps.dateTime.toLocaleString({ month: 'short' }) } `;
					break;

				default:
					dateOutput = ` ${ startDtProps.dateTime.toLocaleString({ month: 'short' }) } `;
			}

			dateOutput += `${ startDtProps.dateTime.toLocaleString({ day: 'numeric' }) }`;

			if (rangeProps.format === 'medday') {
				dateOutput += ` to`;
				dateOutput += ` ${ endDtProps.dateTime.toLocaleString({ weekday: 'short' }) },`;
				dateOutput += ` ${ startDtProps.dateTime.toLocaleString({ month: 'short' }) }`;
			} else {
				dateOutput += ` -`;
			}

			dateOutput += ` ${ endDtProps.dateTime.toLocaleString({ day: 'numeric' }) }`;

			if (rangeProps.format !== 'short') {
				dateOutput += `, ${ startDtProps.dateTime.toLocaleString({ year : 'numeric' }) } `;
			}

		} else {

			switch (rangeProps.format) {
				case 'short':
					dateOutput = ` ${ startDtProps.dateTime.toLocaleString({ month: 'numeric' , day: 'numeric' }) }`;
					break;

				case 'medday':
					dateOutput = ` ${ startDtProps.dateTime.toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY) }`;
					break;

				case 'full' :
					dateOutput = ` ${ startDtProps.dateTime.toLocaleString(DateTime.DATE_FULL) }`;
					break;

				case 'long' :
					dateOutput = ` ${ startDtProps.dateTime.toLocaleString(DateTime.DATE_HUGE) }`;
					break;

				default:
					dateOutput = ` ${ startDtProps.dateTime.toLocaleString(DateTime.DATE_MED) }`;
			}
		}
	}

	if (rangeProps.mode === 'time'
		|| (rangeProps.mode === 'datetime' && diffPoint == '')
	) {

		switch (rangeProps.format) {

			case 'short':
				timeOutput += ` ${ startDtProps.dateTime.toLocaleString(DateTime.TIME_SIMPLE) }`
					.replace(' AM', 'a')
					.replace(' PM', 'p');

				timeOutput += ` - ${ endDtProps.dateTime.toLocaleString(DateTime.TIME_SIMPLE) }`
					.replace(' AM', 'a')
					.replace(' PM', 'p');

				break;

			default :
				timeOutput += ` ${ startDtProps.dateTime.toLocaleString(DateTime.TIME_SIMPLE) }`;
				timeOutput += ` - ${ endDtProps.dateTime.toLocaleString(DateTime.TIME_SIMPLE) }`;
		}
	}

	if (rangeProps.mode === 'date') {
		if (rangeProps.showFullTz) {
			dateOutput += ` - ${startDtProps.dateTime.toFormat('z')}`;
		} else if (rangeProps.showTz) {
			dateOutput += ` - ${startDtProps.dateTime.toFormat('ZZZZ')}`;
		}
	} else {
		if (rangeProps.showFullTz) {
			timeOutput += ` ${startDtProps.dateTime.toFormat('z')}`;
		} else if (rangeProps.showTz) {
			timeOutput += ` ${startDtProps.dateTime.toFormat('ZZZZ')}`;
		}
	}

	return {
		dateOutput,
		timeOutput,
	};
};

export default showDateRange;
