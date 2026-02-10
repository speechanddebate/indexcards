import siteRepo, { siteInclude } from "./siteRepo.js";
import factories from '../../tests/factories/index.js';
import { describe, expect } from "vitest";

describe("SiteRepo", () => {
	describe('buildSiteQuery', () => {
		it('does not include associations by default', async () => {
			const { siteId } = await factories.site.createTestSite();
		
			const site = await siteRepo.getSite(siteId);
		
			expect(site).toBeDefined();
			expect(site.rooms).toBeUndefined();
			expect(site.circuit).toBeUndefined();
		});
		it('includes rooms when requested', async () => {
			const {siteId} = await factories.site.createTestSite();
			const { roomId } = await factories.room.createTestRoom({ siteId });
		
			const site = await siteRepo.getSite(
				siteId,
				{ include: { rooms: true } }
			);
		
			expect(site).toBeDefined();
			expect(site.rooms).not.toBeNull();
			expect(Array.isArray(site.rooms)).toBe(true);
			expect(site.rooms.some(r => r.id === roomId)).toBe(true);
		});
	});
	describe('siteInclude', () => {
		it('returns base site include config', () => {
			const inc = siteInclude();
			expect(inc.model).toBeDefined();
			expect(Array.isArray(inc.include)).toBe(true);
		});
	});
	describe('getSite', () => {
		it('retrieves site by id', async () => {
			const siteData = factories.site.createSiteData();
			const resultId = await siteRepo.createSite(siteData);
			expect(resultId).toBeDefined();
			const result = await siteRepo.getSite(resultId);
			expect(result).toBeDefined();
			expect(result.name).toBe(siteData.name);
		});
		it('retrieves site with tournId and filters by tournId in scope', async () => {
			const { tournId } = await factories.tourn.createTestTourn();
			const { siteId } = await factories.site.createTestSite({ tournId });

			const result = await siteRepo.getSite({siteId, tournId });
			expect(result).toBeDefined();
			expect(result.id).toBe(siteId);
		});
		it('throws an error when siteId is not provided in scope', async () => {
			await expect(siteRepo.getSite({ tournId: 1 })).rejects.toThrow('getSite: siteId is required');
		});
		it('throws an error when id is not provided', async () => {
			await expect(siteRepo.getSite()).rejects.toThrow();
		});
	});
	describe('getSites', () => {
		it('retrieves all sites for a given circuit', async () => {
			const { circuitId } = await factories.circuit.createTestCircuit();
			const { siteId: site1Id } = await factories.site.createTestSite({ circuitId });
			const { siteId: site2Id } = await factories.site.createTestSite({ circuitId });

			const results = await siteRepo.getSites({ circuitId });
			expect(results).toBeDefined();
			expect(results.length).toBeGreaterThanOrEqual(2);
			results.forEach(s => {
				expect(s.circuitId, `expected circuitId to be ${circuitId} but was ${s.circuitId}`).toBe(circuitId);
			});
			expect(results.map(s => s.id)).toEqual(expect.arrayContaining([site1Id, site2Id]));
		});
		it('retrieves all sites for a given tourn', async () => {
			const { tournId } = await factories.tourn.createTestTourn();
			const { siteId: site1Id } = await factories.site.createTestSite({ tournId });
			const { siteId: site2Id } = await factories.site.createTestSite({ tournId });

			const results = await siteRepo.getSites({ tournId });
			expect(results).toBeDefined();
			expect(results.length).toBe(2);
			expect(results.map(s => s.id)).toEqual(expect.arrayContaining([site1Id, site2Id]));

		});
		it('retrieves all sites when no scope is provided', async () => {
			const { siteId: site1Id } = await factories.site.createTestSite();
			const { siteId: site2Id } = await factories.site.createTestSite();

			const results = await siteRepo.getSites();
			expect(results).toBeDefined();
			expect(results.length).toBeGreaterThanOrEqual(2);
			expect(results.map(s => s.id)).toEqual(expect.arrayContaining([site1Id, site2Id]));
		});
	});
	describe('createSite', () => {
		it('creates site when provided valid data', async () => {
			const site = factories.site.createSiteData();
			const resultId = await siteRepo.createSite(site);
			expect(resultId).toBeDefined();
			const result = await siteRepo.getSite(resultId);	
			expect(result).toBeDefined();
			expect(result.name).toBe(site.name);
			expect(result.tournId).toBe(site.tournId);
		});
	});
	describe('updateSite', () => {
		it('updates site when provided valid data', async () => {
			const { siteId } = await factories.site.createTestSite();
			const newData = factories.site.createSiteData({name: 'new site name'});
			const result = await siteRepo.updateSite(siteId, newData);
			const updated = await siteRepo.getSite(siteId);
			expect(result).toBe(true);
			expect(updated).toBeDefined();
			expect(updated.name).toBe('new site name');
		});
		it('returns false when trying to update a non-existent site', async () => {
			await siteRepo.updateSite(999999, { name: 'Non-existent' }); // unlikely siteId
		});
		it('throws an error when id is not provided', async () => {
			await expect(siteRepo.updateSite(null, { name: 'No ID' })).rejects.toThrow();
		});
	});
	describe('deleteSite', () => {
		it('deletes a site and returns true', async () => {
			// Arrange
			const { siteId } = await factories.site.createTestSite();
			// Act
			const result = await siteRepo.deleteSite(siteId);
			// Assert
			expect(result).toBe(true);
			const deleted = await siteRepo.getSite(siteId);
			expect(deleted).toBeNull();
		});
		it('returns false when trying to delete a non-existent site', async () => {
			const result = await siteRepo.deleteSite(999999); // unlikely siteId
			expect(result).toBe(false);
		});
		it('throws an error when id is not provided', async () => {
			await expect(siteRepo.deleteSite()).rejects.toThrow();
		});
	});
});