import sectionRepo, { sectionInclude } from './sectionRepo.js';
import factories from '../../tests/factories/index.js';

describe('SectionRepo', () => {
	describe('buildSectionQuery', () => {
		it('does not include associations by default', async () => {
			const { sectionId } = await factories.section.create();

			const section = await sectionRepo.getSection(sectionId);

			expect(section).toBeDefined();
			expect(section.Round).toBeUndefined();
			expect(section.Ballots).toBeUndefined();
		});
		it('includes ballots when requested', async () => {
			const { sectionId } = await factories.section.create();

			const section = await sectionRepo.getSection(
				sectionId,
				{ include: { Ballots: true } }
			);

			expect(section).toBeDefined();
			expect(section.Ballots).toBeDefined();
			expect(Array.isArray(section.Ballots)).toBe(true);
		});
		it('includes settings when requested', async () => {
			const { sectionId } = await factories.section.create();

			const section = await sectionRepo.getSection(
				sectionId,
				{ settings: true }
			);

			expect(section).toBeDefined();
			expect(section.settings).toBeDefined();
		});
		it('includes Round when requested', async () => {
			const { roundId } = await factories.round.create();
			const { sectionId } = await factories.section.create({ round: roundId });

			const section = await sectionRepo.getSection(
				sectionId,
				{ include: { Round: true } }
			);

			expect(section).toBeDefined();
			expect(section.Round).toBeDefined();
		});
	});
	describe('sectionInclude', () => {
		it('returns base section include config', () => {
			const inc = sectionInclude();
			expect(inc.model).toBeDefined();
			expect(Array.isArray(inc.include)).toBe(true);
		});
	});
	describe('getSection', () => {
		it('retrieves section by id', async () => {
			const sectionData = factories.section.createSectionData();
			const resultId = await sectionRepo.createSection(sectionData);
			expect(resultId).toBeDefined();
			const result = await sectionRepo.getSection(resultId);
			expect(result).toBeDefined();
			expect(result.name).toBe(sectionData.name);
		});
		it('throws an error when id is not provided', async () => {
			await expect(sectionRepo.getSection()).rejects.toThrow();
		});
	});
	describe('getSections', () => {
		it('retrieves all sections for a given round', async () => {
			const { roundId } = await factories.round.create();
			const { sectionId: section1Id } = await factories.section.create({ round: roundId });
			const { sectionId: section2Id } = await factories.section.create({ round: roundId });

			const results = await sectionRepo.getSections({ roundId });
			expect(results).toBeDefined();
			expect(results.length).toBeGreaterThanOrEqual(2);
			results.forEach(s => {
				expect(s.round, `expected roundId to be ${roundId} but was ${s.round}`).toBe(roundId);
			});
			expect(results.map(s => s.id)).toEqual(expect.arrayContaining([section1Id, section2Id]));
		});
		it('retrieves all sections when no scope is provided', async () => {
			const { sectionId: section1Id } = await factories.section.create();
			const { sectionId: section2Id } = await factories.section.create();

			const results = await sectionRepo.getSections();
			expect(results).toBeDefined();
			expect(results.length).toBeGreaterThanOrEqual(2);
			expect(results.map(s => s.id)).toEqual(expect.arrayContaining([section1Id, section2Id]));
		});
	});
	describe('createSection', () => {
		it('creates section when provided valid data', async () => {
			const section = factories.section.createSectionData();
			const resultId = await sectionRepo.createSection(section);
			expect(resultId).toBeDefined();
			const result = await sectionRepo.getSection(resultId);
			expect(result).toBeDefined();
			expect(result.name).toBe(section.name);
			expect(result.tournId).toBe(section.tournId);
		});
	});
	describe('updateSection', () => {
		it('updates section when provided valid data', async () => {
			const { sectionId } = await factories.section.create();
			const newData = factories.section.createSectionData({letter: 'Z'});
			const result = await sectionRepo.updateSection(sectionId, newData);
			expect(result).toBe(true);
			const updated = await sectionRepo.getSection(sectionId);
			expect(updated).toBeDefined();
			expect(updated.letter).toBe('Z');
		});
		it('returns false when trying to update a non-existent section', async () => {
			const result = await sectionRepo.updateSection(999999, { name: 'Non-existent' }); // unlikely sectionId
			expect(result).toBe(false);
		});
		it('throws an error when id is not provided', async () => {
			await expect(sectionRepo.updateSection(null, { name: 'No ID' })).rejects.toThrow('updateSection: id is required');
		});
	});
	describe('deleteSection', () => {
		it('deletes a section and returns true', async () => {
			// Arrange
			const { sectionId } = await factories.section.create();
			// Act
			const result = await sectionRepo.deleteSection(sectionId);
			// Assert
			expect(result).toBe(true);
			const deleted = await sectionRepo.getSection(sectionId);
			expect(deleted).toBeNull();
		});
		it('returns false when trying to delete a non-existent section', async () => {
			const result = await sectionRepo.deleteSection(999999); // unlikely sectionId
			expect(result).toBe(false);
		});
		it('throws an error when id is not provided', async () => {
			await expect(sectionRepo.deleteSection()).rejects.toThrow('deleteSection: id is required');
		});
	});
	describe('getCurrentBallots', async () => {
		it('returns a current ballot when one exists', async () => {
			const data = await factories.person.createBallot();

			const result = await sectionRepo.getCurrentBallots(data.personId);

			expect(result).instanceof(Array);
			const ballot = result[0];
			expect(ballot).toBeDefined();
			expect(ballot.Judge.id).toBe(data.judgeId);
		});
	});
});
