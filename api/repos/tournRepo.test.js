
import tournRepo, { tournInclude } from './tournRepo.js';
import factories from '../../tests/factories/index.js';

describe('tournRepo', () => {
	describe('buildTournQuery', () => {
		it('does not include associations by default', async () => {
			const { tournId } = await factories.tourn.createTestTourn();

			const tourn = await tournRepo.getTourn(tournId);

			expect(tourn).toBeDefined();
			expect(tourn.Sites).toBeUndefined();
		});
		it('does not include hidden tourns by default', async () => {
			const tournData = factories.tourn.createTournData({ hidden: 1 });
			const tournId = await tournRepo.createTourn(tournData);

			const tourn = await tournRepo.getTourn(tournId);

			expect(tourn).toBeNull();
		});
		it('includes hidden tourns when specified', async () => {
			const tournData = factories.tourn.createTournData({ hidden: 1 });
			const tournId = await tournRepo.createTourn(tournData);

			const tourn = await tournRepo.getTourn(tournId, { unpublished: true });

			expect(tourn).toBeDefined();
			expect(tourn.id).toBe(tournId);
		});
		it('includes associations when specified', async () => {
			const { tournId } = await factories.tourn.createTestTourn();

			let tourn = await tournRepo.getTourn(tournId, { include: { pages: true } });

			expect(tourn).toBeDefined();
			expect(tourn.webpages).toBeDefined();
			expect(Array.isArray(tourn.webpages)).toBe(true);

			tourn = await tournRepo.getTourn(tournId, { include: { files: true } });

			expect(tourn).toBeDefined();
			expect(tourn.files).toBeDefined();
			expect(Array.isArray(tourn.files)).toBe(true);
		});
		it('includes settings when specified', async () => {
			const settings = { testSetting: 'testValue' };
			const { tournId } = await factories.tourn.createTestTourn({ settings });

			const tourn = await tournRepo.getTourn(tournId, { settings: true });

			expect(tourn).toBeDefined();
			expect(tourn.settings).toBeDefined();
			expect(tourn.settings.testSetting).toBe(settings.testSetting);
		});
	});
	describe('TournInclude', () => {
		it('returns base tourn include config', () => {
			const inc = tournInclude();
			expect(inc.model).toBeDefined();
			expect(Array.isArray(inc.include)).toBe(true);
		});
	});
	describe('getTourn', () => {
		it('retrieves tourn by id', async () => {
			const tournData = factories.tourn.createTournData();
			const resultId = await tournRepo.createTourn(tournData);
			expect(resultId).toBeDefined();
			const result = await tournRepo.getTourn(resultId);
			expect(result).toBeDefined();
			expect(result.name).toBe(tournData.name);
		});
		it('retrieves tourn by webname', async () => {
			const tournData = factories.tourn.createTournData();
			const resultId = await tournRepo.createTourn(tournData);
			expect(resultId).toBeDefined();
			const result = await tournRepo.getTourn(tournData.webname);
			expect(result).toBeDefined();
		});
		it('returns null if tourn not found', async () => {
			const result = await tournRepo.getTourn(999999);
			expect(result).toBeNull();
		});
		it('throws an error if tournId is not provided', async () => {
			await expect(tournRepo.getTourn()).rejects.toThrow();
		});

	});
	describe('createTourn', () => {
		it('creates a tourn', async () => {
			const tournData = factories.tourn.createTournData();
			const resultId = await tournRepo.createTourn(tournData);
			expect(resultId).toBeDefined();
			const result = await tournRepo.getTourn(resultId);
			expect(result).toBeDefined();
			expect(result.name).toBe(tournData.name);
		});
		it('creates a tourn with settings', async () => {
			const tournData = factories.tourn.createTournData({ settings: { testSetting: 'testValue' } });
			const resultId = await tournRepo.createTourn(tournData);
			expect(resultId).toBeDefined();
			const result = await tournRepo.getTourn(resultId, { settings: true });
			expect(result).toBeDefined();
			expect(result.settings).toBeDefined();
			expect(result.settings.testSetting).toBe(tournData.settings.testSetting);
		});
		it('throws an error if data is missing', async () => {
			await expect(tournRepo.createTourn()).rejects.toThrow();
		});
	});
	describe('updateTourn', () => {
		it('updates a tourn', async () => {
			const { tournId } = await factories.tourn.createTestTourn();
			const updates = { name: 'Updated Tournament Name' };
			const result = await tournRepo.updateTourn(tournId, updates);
			expect(result).toBe(true);

			const updatedTourn = await tournRepo.getTourn(tournId);
			expect(updatedTourn.name).toBe(updates.name);
		});
		it('returns false if tourn does not exist', async () => {
			const updates = { name: 'Updated Tournament Name' };
			const result = await tournRepo.updateTourn(999999, updates);
			expect(result).toBe(false);
		});
		it('throws an error if tournId is not provided', async () => {
			const updates = { name: 'Updated Tournament Name' };
			await expect(tournRepo.updateTourn(null, updates)).rejects.toThrow('updateTourn: tournId is required');
		});
		it('throws an error if updates are not provided', async () => {
			const { tournId } = await factories.tourn.createTestTourn();
			await expect(tournRepo.updateTourn(tournId, null)).rejects.toThrow('updateTourn: updates are required');
		});
		it('updates settings when provided', async () => {
			const data = factories.tourn.createTournData({ settings: { testSetting: 'oldValue' } });
			const tournId = await tournRepo.createTourn(data);
			const updates = { ...data, settings: { testSetting: 'newValue' } };
			const result = await tournRepo.updateTourn(tournId, updates);
			expect(result).toBe(true);

			const updatedTourn = await tournRepo.getTourn(tournId, { settings: true });
			expect(updatedTourn.settings).toBeDefined();
			expect(updatedTourn.settings.testSetting).toBe(updates.settings.testSetting);
		});
	});
	describe('deleteTourn', () => {
		it('deletes a tourn', async () => {
			const { tournId } = await factories.tourn.createTestTourn();
			const result = await tournRepo.deleteTourn(tournId);
			expect(result).toBe(true);
		});
		it('returns false if tourn does not exist', async () => {
			const result = await tournRepo.deleteTourn(999999);
			expect(result).toBe(false);
		});
		it('throws an error if tournId is not provided', async () => {
			await expect(tournRepo.deleteTourn()).rejects.toThrow('deleteTourn: tournId is required');
		});
	});
});