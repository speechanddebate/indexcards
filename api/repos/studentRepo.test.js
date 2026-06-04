import factories from '../../tests/factories/index.js';
import db from '../data/db.js';
import studentRepo from './studentRepo.js';

describe('unlinkedSearch', () => {
	it('returns only students matching unlinked and filter criteria', async () => {
		const stamp = Date.now();
		const firstPrefix = `ULF${stamp}`;
		const lastPrefix = `ULL${stamp}`;
		const schoolYear = new Date().getFullYear();
		const { chapterId } = await factories.chapter.create();

		const { studentId: includedId } = await factories.student.create({
			first: `${firstPrefix}A`,
			last: `${lastPrefix}A`,
			chapter: chapterId,
		});

		const { studentId: linkedByPersonId } = await factories.student.create({
			first: `${firstPrefix}B`,
			last: `${lastPrefix}B`,
			person: 123,
			chapter: chapterId,
		});

		const { studentId: linkedByRequestId } = await factories.student.create({
			first: `${firstPrefix}C`,
			last: `${lastPrefix}C`,
			person_request: 321,
			chapter: chapterId,
		});

		await factories.student.create({
			first: `${firstPrefix}D`,
			last: `${lastPrefix}D`,
			chapter: chapterId,
		});

		await factories.student.create({
			first: `${firstPrefix}E`,
			last: `X${lastPrefix}`,
			chapter: chapterId,
		});

		const results = await studentRepo.unlinkedSearch({
			first: firstPrefix,
			last: lastPrefix,
		}, {
			schoolYear,
		});

		expect(Array.isArray(results)).toBe(true);
		expect(results.some(s => s.id === includedId)).toBe(true);
		expect(results.some(s => s.id === linkedByPersonId)).toBe(false);
		expect(results.some(s => s.id === linkedByRequestId)).toBe(false);
		const included = results.find(s => s.id === includedId);
		expect(included).toBeDefined();
		expect(included.chapter_id).toBe(chapterId);
	});

	it('counts distinct tournaments for each matched student', async () => {
		const stamp = Date.now();
		const firstPrefix = `TCF${stamp}`;
		const lastPrefix = `TCL${stamp}`;
		const schoolYear = new Date().getFullYear();
		const { chapterId } = await factories.chapter.create();
		const { studentId } = await factories.student.create({
			first: `${firstPrefix}Main`,
			last: `${lastPrefix}Main`,
			chapter: chapterId,
		});

		const { tournId: tournA } = await factories.tourn.createTestTourn({ name: `Tourn A ${stamp}` });
		const { tournId: tournB } = await factories.tourn.createTestTourn({ name: `Tourn B ${stamp}` });

		const { eventId: eventA1 } = await factories.event.createTestEvent({ tournId: tournA, name: `EA1 ${stamp}` });
		const { eventId: eventA2 } = await factories.event.createTestEvent({ tournId: tournA, name: `EA2 ${stamp}` });
		const { eventId: eventB1 } = await factories.event.createTestEvent({ tournId: tournB, name: `EB1 ${stamp}` });

		const { entryId: entryA1 } = await factories.entry.createTestEntry({ event: eventA1 });
		const { entryId: entryA2 } = await factories.entry.createTestEntry({ event: eventA2 });
		const { entryId: entryB1 } = await factories.entry.createTestEntry({ event: eventB1 });

		await db.entryStudent.create({ entry: entryA1, student: studentId });
		await db.entryStudent.create({ entry: entryA2, student: studentId });
		await db.entryStudent.create({ entry: entryB1, student: studentId });

		const results = await studentRepo.unlinkedSearch({
			first: firstPrefix,
			last: lastPrefix,
		}, {
			schoolYear,
		});

		const studentResult = results.find(s => s.id === studentId);
		expect(studentResult).toBeDefined();
		expect(Number(studentResult.tourn_count)).toBe(2);
	});

	it('throws an error if required parameters are missing', async () => {
		await expect(studentRepo.unlinkedSearch({})).rejects.toThrow('unlinkedSearch requires first and last parameters');
		await expect(studentRepo.unlinkedSearch({ first: 'Test' })).rejects.toThrow('unlinkedSearch requires first and last parameters');
		await expect(studentRepo.unlinkedSearch({ last: 'Test' })).rejects.toThrow('unlinkedSearch requires first and last parameters');
	});
	it('defaults schoolYear to current year if not provided', async () => {
		const stamp = Date.now();
		const firstPrefix = `SYF${stamp}`;
		const lastPrefix = `SYL${stamp}`;
		const currentYear = new Date().getFullYear();
		const { chapterId } = await factories.chapter.create();
		const { studentId: includedId } = await factories.student.create({
			first: `${firstPrefix}A`,
			last: `${lastPrefix}A`,
			chapter: chapterId,
		});

		await factories.student.create({
			first: `${firstPrefix}B`,
			last: `${lastPrefix}B`,
			chapter: chapterId,
		});

		const results = await studentRepo.unlinkedSearch({
			first: firstPrefix,
			last: lastPrefix,
		});

		expect(results.some(s => s.id === includedId)).toBe(true);
		expect(results.some(s => s.grad_year === currentYear - 1)).toBe(false);
	});
});
