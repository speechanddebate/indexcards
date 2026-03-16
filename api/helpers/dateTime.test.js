import * as dt from './dateTime.js';
describe('schoolYearDateRange', () => {
	it('should return the correct start and end dates for the current school year', () => {
		const { start, end } = dt.schoolYearDateRange();
		const now = new Date();
		const startYear = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
		expect(start).toEqual(new Date(startYear, 6, 1));
		expect(end).toEqual(new Date(startYear + 1, 5, 30));
	});
	it('should return the correct start and end dates for a date before July (Jan 1, 2022)', () => {
		const date = new Date(2022, 0, 1); // January 1, 2022 — before July, so school year is 2021–2022
		const { start, end } = dt.schoolYearDateRange(date);
		expect(start).toEqual(new Date(2021, 6, 1));
		expect(end).toEqual(new Date(2022, 5, 30));
	});
	it('should return the correct start and end dates for a date on or after July (Aug 1, 2022)', () => {
		const date = new Date(2022, 7, 1); // August 1, 2022 — after July, so school year is 2022–2023
		const { start, end } = dt.schoolYearDateRange(date);
		expect(start).toEqual(new Date(2022, 6, 1));
		expect(end).toEqual(new Date(2023, 5, 30));
	});

});