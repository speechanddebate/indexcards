import entryRepo from './entryRepo.js';
import db from '../data/db.js';
import factories from '../../tests/factories/index.js';
describe('entryRepo', () => {
	describe('buildEntryQuery', () => {
		it('should build a query with default options', async () => {
			const { entryId } =  await factories.entry.createTestEntry();

			const result = await entryRepo.getEntry(entryId);

			expect(result).toBeDefined();
			expect(result.id).toBe(entryId);
		});
		it('should include students when specified', async () => {
			const { entryId } =  await factories.entry.createTestEntry();
			const { studentId } = await factories.student.createTestStudent();

			await db.entryStudent.create({
				entry: entryId,
				student: studentId,
			});

			const result = await entryRepo.getEntry(entryId, { include: { students: true } });

			expect(result).toBeDefined();
			expect(result.id).toBe(entryId);
			expect(result.Students).toBeDefined();
			expect(Array.isArray(result.Students)).toBe(true);
			expect(result.Students.some(student => student.id)).toBe(true);
		});
	});

});