import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import scoreRepo, { scoreInclude } from './scoreRepo.js';
import factories from '../../tests/factories/index.js';


let ballotId = null;

describe('scoreRepo', async () => {
	beforeAll(async () => {
		({ ballotId } = await factories.ballot.createTestBallot());
	});
	describe('buildScoreQuery', () => {
		it('does not include associations by default', async () => {
			const scoreId = await scoreRepo.createScore({ballotId});
		
			const scores = await scoreRepo.getScores({ ballotId });
			const score = scores.find(b => b.id === scoreId);
		
			expect(score).toBeDefined();
			expect(score.judge).toBeUndefined();
			expect(score.ballot).toBeUndefined();
			expect(score.scores).toBeUndefined();
		});
		it('includes ballot when requested', async () => {
			const scoreId = await scoreRepo.createScore({ballotId});
		
			const score = await scoreRepo.getScore(
				scoreId,
				{ include: { ballot: true } }
			);
			
			expect(score).toBeDefined();
			expect(score.ballot).toBeDefined();
			expect(score.ballot.id).toBeDefined();
		});
	});
	describe('scoreInclude', () => {
		it('returns base score include config', () => {
			const inc = scoreInclude();
			expect(inc.model).toBeDefined();
			expect(Array.isArray(inc.include)).toBe(true);
		});
	});
	describe('getScores', async () => {
		
		it('should return an empty array if no scores exist for the ballot', async () => {
			const scores = await scoreRepo.getScores({ ballotId: 999999 }); // unlikely ballotId
			expect(Array.isArray(scores)).toBe(true);
			expect(scores.length).toBe(0);
		});

		it('should return scores for a given ballotId', async () => {
			const scoreId = await scoreRepo.createScore({ ballotId });
			const scores = await scoreRepo.getScores({ ballotId });
			expect(Array.isArray(scores)).toBe(true);
			expect(scores.length).toBeGreaterThan(0);
			const found = scores.find(b => b.id === scoreId);
			expect(found).toBeDefined();
			expect(found.ballotId).toBe(ballotId);
		});

		it('should return all scores when no scope is provided', async () => {
			// Create at least one score to ensure there is data
			await scoreRepo.createScore({ ballotId });
			const scores = await scoreRepo.getScores();
			expect(Array.isArray(scores)).toBe(true);
			expect(scores.length).toBeGreaterThan(0);
		});
	});
	describe('createScore', async () => {
		it('should create a score and retrieve it', async () => {
			const scoreId = await scoreRepo.createScore({ ballotId });
			const score = await scoreRepo.getScore(scoreId);
	
			// Ensure that id, updatedAt and createdAt are present and not null
			expect(score).toHaveProperty('id');
			expect(score.id).not.toBeNull();
			expect(score).toHaveProperty('updatedAt');
			expect(score.updatedAt).not.toBeNull();
			expect(score).toHaveProperty('createdAt');
			expect(score.createdAt).not.toBeNull();
		});
	});

});