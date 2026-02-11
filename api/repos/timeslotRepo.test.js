import timeslotRepo, { timeslotInclude } from "./timeslotRepo.js";
import factories from '../../tests/factories/index.js';
import { describe, expect, it } from "vitest";
import { ValidationError } from '../helpers/errors/errors.js';

describe("TimeslotRepo", () => {
	describe('buildTimeslotQuery', () => {
		it('does not include associations by default', async () => {
			const { timeslotId } = await factories.timeslot.createTestTimeslot();
		
			const timeslot = await timeslotRepo.getTimeslot(timeslotId);
		
			expect(timeslot).toBeDefined();
			expect(timeslot.Rounds).toBeUndefined();
		});
		it('includes rounds when requested', async () => {
			const {timeslotId} = await factories.timeslot.createTestTimeslot();
			const { roundId } = await factories.round.createTestRound({ timeslotId });
		
			const timeslot = await timeslotRepo.getTimeslot(
				timeslotId,
				{ include: { rounds: true } }
			);
		
			expect(timeslot).toBeDefined();
			expect(timeslot.Rounds).not.toBeNull();
			expect(Array.isArray(timeslot.Rounds)).toBe(true);
			//expect all rounds timeslotId to match the timeslotId
			timeslot.Rounds.forEach(r => {
				expect(r.timeslot).toBe(timeslotId);
			});
		});
	});
	describe('timeslotInclude', () => {
		it('returns base timeslot include config', () => {
			const inc = timeslotInclude();
			expect(inc.model).toBeDefined();
			expect(Array.isArray(inc.include)).toBe(true);
		});
	});
	describe('getTimeslot', () => {
		it('retrieves timeslot by id', async () => {
			const timeslotData = factories.timeslot.createTimeslotData();
			const resultId = await timeslotRepo.createTimeslot(timeslotData);
			expect(resultId).toBeDefined();
			const result = await timeslotRepo.getTimeslot(resultId);
			expect(result).toBeDefined();
			expect(result.name).toBe(timeslotData.name);
		});
		it('retrieves timeslot with tournId and filters by tournId in scope', async () => {
			const { tournId } = await factories.tourn.createTestTourn();
			const { timeslotId: id } = await factories.timeslot.createTestTimeslot({ tournId });

			const result = await timeslotRepo.getTimeslot({id, tournId });
			expect(result).toBeDefined();
			expect(result.id).toBe(id);
		});
		it('throws an error when id is not provided in scope', async () => {
			await expect(timeslotRepo.getTimeslot({ tournId: 1 })).rejects.toThrow('getTimeslot: id is required');
		});
		it('throws an error when id is not provided', async () => {
			await expect(timeslotRepo.getTimeslot()).rejects.toThrow();
		});
	});
	describe('getTimeslots', () => {
		it('retrieves all timeslots for a given tourn', async () => {
			const { tournId } = await factories.tourn.createTestTourn();
			const { timeslotId: timeslot1Id } = await factories.timeslot.createTestTimeslot({ tournId });
			const { timeslotId: timeslot2Id } = await factories.timeslot.createTestTimeslot({ tournId });

			const results = await timeslotRepo.getTimeslots({ tournId });
			expect(results).toBeDefined();
			expect(results.length).toBe(2);
			expect(results.map(s => s.id)).toEqual(expect.arrayContaining([timeslot1Id, timeslot2Id]));

		});
		it('retrieves all timeslots when no scope is provided', async () => {
			const { timeslotId: timeslot1Id } = await factories.timeslot.createTestTimeslot();
			const { timeslotId: timeslot2Id } = await factories.timeslot.createTestTimeslot();

			const results = await timeslotRepo.getTimeslots();
			expect(results).toBeDefined();
			expect(results.length).toBeGreaterThanOrEqual(2);
			expect(results.map(s => s.id)).toEqual(expect.arrayContaining([timeslot1Id, timeslot2Id]));
		});
	});
	describe('createTimeslot', () => {
		it('creates timeslot when provided valid data', async () => {
			const timeslot = factories.timeslot.createTimeslotData();
			const resultId = await timeslotRepo.createTimeslot(timeslot);
			expect(resultId).toBeDefined();
			const result = await timeslotRepo.getTimeslot(resultId);	
			expect(result).toBeDefined();
			expect(result.name).toBe(timeslot.name);
			expect(result.start.getTime()).toBe(timeslot.start.getTime());
		});
		it('throws a validationError when tournId does not reference an existing tournament', async () => {
			const timeslot = factories.timeslot.createTimeslotData({ tournId: 9999 });
			await expect(timeslotRepo.createTimeslot(timeslot)).rejects.toThrow(ValidationError);
		});
	});
	describe('updateTimeslot', () => {
		it('updates timeslot when provided valid data', async () => {
			const { timeslotId } = await factories.timeslot.createTestTimeslot();
			const newData = factories.timeslot.createTimeslotData({name: 'new timeslot name'});
			const result = await timeslotRepo.updateTimeslot(timeslotId, newData);
			const updated = await timeslotRepo.getTimeslot(timeslotId);
			expect(result).toBe(timeslotId);
			expect(updated).toBeDefined();
			expect(updated.name).toBe('new timeslot name');
		});
		it('throws an error when id is not provided', async () => {
			await expect(timeslotRepo.updateTimeslot(null, { name: 'No ID' })).rejects.toThrow();
		});
	});
	describe('deleteTimeslot', () => {
		it('deletes a timeslot and returns true', async () => {
			// Arrange
			const { timeslotId } = await factories.timeslot.createTestTimeslot();
			// Act
			const result = await timeslotRepo.deleteTimeslot(timeslotId);
			// Assert
			expect(result).toBe(true);
			const deleted = await timeslotRepo.getTimeslot(timeslotId);
			expect(deleted).toBeNull();
		});
		it('returns false when trying to delete a non-existent timeslot', async () => {
			const result = await timeslotRepo.deleteTimeslot(999999); // unlikely timeslotId
			expect(result).toBe(false);
		});
		it('throws an error when id is not provided', async () => {
			await expect(timeslotRepo.deleteTimeslot()).rejects.toThrow();
		});
	});
});