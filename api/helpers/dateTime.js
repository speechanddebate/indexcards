// I never thought I'd say this about anything, but dear lord JS date handling
// makes me miss DateTime in Perl.

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

export const shortZone = (tzString) => {
	const dateZone = new Date().toLocaleDateString('en-US', {
		timeZone     : tzString,
		timeZoneName : 'short',
	});

	const numWords = dateZone.split(' ');
	return numWords[numWords.length - 1];
};

export const getWeek = (date) => {
	if (!(date instanceof Date)) date = new Date();

	// ISO week date weeks start on Monday, so correct the day number
	var nDay = (date.getDay() + 6) % 7;

	// ISO 8601 states that week 1 is the week with the first Thursday of that year
	// Set the target date to the Thursday in the target week
	date.setDate(date.getDate() - nDay + 3);

	// Store the millisecond value of the target date
	var n1stThursday = date.valueOf();

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

export const showDate = ({ date, format, tz, locale }) => {

	const dt = convertTZ(date, tz || 'UTC');

	if (!format || format === 'iso' || format === 'sortable') {
		return dt.toISOString().split('T')[0];
	}

	if (format === 'murica' || format === 'human') {
		return dt.toLocaleDateString(locale || 'en-US');
	}
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
