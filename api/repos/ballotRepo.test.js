import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import ballotRepo, { ballotInclude} from './ballotRepo.js';
import factories from '../../tests/factories/index.js';


let sectionId = null;

describe('ballotRepo', async () => {
	beforeAll(async () => {
		({ sectionId } = await factories.section.createTestSection());
	});
	describe('buildBallotQuery', () => {
		it('does not include associations by default', async () => {
			const ballotId = await ballotRepo.createBallot({sectionId});
		
			const ballots = await ballotRepo.getBallots({ sectionId });
			const ballot = ballots.find(b => b.id === ballotId);
		
			expect(ballot).toBeDefined();
			expect(ballot.judge).toBeUndefined();
			expect(ballot.section).toBeUndefined();
			expect(ballot.scores).toBeUndefined();
		});
		it('includes judge when requested', async () => {
			const { judgeId } = await factories.judge.createTestJudge();
			const ballotId = await ballotRepo.createBallot({sectionId, judgeId});
		
			const ballot = await ballotRepo.getBallot(
				ballotId,
				{ include: { judge: true } }
			);
		
			expect(ballot).toBeDefined();
			expect(ballot.judge).toBeDefined();
			expect(ballot.judge.id).toBeDefined();
		});
		it('includes scores when requested', async () => {
			const ballotId = await ballotRepo.createBallot({sectionId});
		
			const ballot = await ballotRepo.getBallot(
				ballotId,
				{ include: { scores: true } }
			);
		
			expect(ballot).toBeDefined();
			expect(ballot.scores).toBeDefined();
			expect(Array.isArray(ballot.scores)).toBe(true);
		});
		it('includes section when requested', async () => {
			const ballotId = await ballotRepo.createBallot({sectionId});
		
			const ballot = await ballotRepo.getBallot(
				ballotId,
				{ include: { section: true } }
			);
			
			expect(ballot).toBeDefined();
			expect(ballot.section).toBeDefined();
			expect(ballot.section.id).toBeDefined();
		});
	});
	describe('ballotInclude', () => {
		it('returns base ballot include config', () => {
			const inc = ballotInclude();
			expect(inc.model).toBeDefined();
			expect(Array.isArray(inc.include)).toBe(true);
		});
	});
	describe('getBallots', async () => {
		
		it('should return an empty array if no ballots exist for the section', async () => {
			const ballots = await ballotRepo.getBallots({ sectionId: 999999 }); // unlikely sectionId
			expect(Array.isArray(ballots)).toBe(true);
			expect(ballots.length).toBe(0);
		});

		it('should return ballots for a given sectionId', async () => {
			const ballotId = await ballotRepo.createBallot({ sectionId });
			const ballots = await ballotRepo.getBallots({ sectionId });
			expect(Array.isArray(ballots)).toBe(true);
			expect(ballots.length).toBeGreaterThan(0);
			const found = ballots.find(b => b.id === ballotId);
			expect(found).toBeDefined();
			expect(found.sectionId).toBe(sectionId);
		});
	});
	describe('createBallot', async () => {
		it('should create a ballot and retrieve it', async () => {
			const ballotId = await ballotRepo.createBallot({ sectionId });
			const ballot = await ballotRepo.getBallot(ballotId);
	
			//ensure that id, updatedAt and createdAt are present and not null
			expect(ballot).toHaveProperty('id');
			expect(ballot.id).not.toBeNull();
			expect(ballot).toHaveProperty('updatedAt');
			expect(ballot.updatedAt).not.toBeNull();
			expect(ballot).toHaveProperty('createdAt');
			expect(ballot.createdAt).not.toBeNull();
		});
	});

});