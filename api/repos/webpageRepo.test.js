import { describe, it, expect, beforeAll} from 'vitest';
import webpageRepo, { webpageInclude } from './webpageRepo.js';
import factories from '../../tests/factories/index.js';

describe('webpageRepo', () => {
	describe('buildWebpageQuery', () => {
		it('does not include unpublished webpages by default', async () => {
			const { webpageId: publishedPageId } = await factories.webpage.createTestWebpage({ published: true });
			const { webpageId: unpublishedPageId } = await factories.webpage.createTestWebpage({ published: false });
			const result = await webpageRepo.getWebpages();
			expect(result).toEqual(
				expect.arrayContaining([
					expect.objectContaining({ id: publishedPageId }),
				])
			);
			expect(result).not.toEqual(
				expect.arrayContaining([
					expect.objectContaining({ id: unpublishedPageId }),
				])
			);
		});
		it('includes unpublished webpages when includeUnpublished is true', async () => {
			const { webpageId: unpublishedPageId } = await factories.webpage.createTestWebpage({ published: false });
			const result = await webpageRepo.getWebpage(unpublishedPageId, { includeUnpublished: true });
			expect(result).toEqual(
				expect.objectContaining({ id: unpublishedPageId }),
			);
		});
	});
	describe('webpageInclude', () => {
		it('returns base webpage include config', () => {
			const inc = webpageInclude();
			expect(inc.model).toBeDefined();
			expect(Array.isArray(inc.include)).toBe(true);
		});
	});
	describe('getWebpage', () => {
		it('throws an error when id is not provided', async () => {
			await expect(webpageRepo.getWebpage()).rejects.toThrow();
		});
		it('retrieves webpage by id', async () => {
			const { webpageId } = await factories.webpage.createTestWebpage();
			const result = await webpageRepo.getWebpage(webpageId);
			expect(result, "Expected result not to be null").not.toBeNull();
			expect(result.id, `Expected webpageId to be ${webpageId} but got ${result.id}`).toBe(webpageId);
		});
	});
	describe('getWebpages', () => {
		let tournId,sitewidePageId, tournPageId, publishedPageId, unpublishedPageId;
		beforeAll(async () => {
			const { tournId: createdTournId } = await factories.tourn.createTestTourn();
			tournId = createdTournId;
			const sitewide = await factories.webpage.createTestWebpage({ published: true, sitewide: true });
			const tourn = await factories.webpage.createTestWebpage({ tournId, published: true });
			const pub = await factories.webpage.createTestWebpage({ slug: 'published-page', published: true });
			const unpub = await factories.webpage.createTestWebpage({ published: false });
		
			sitewidePageId = sitewide.webpageId;
			tournPageId = tourn.webpageId;
			publishedPageId = pub.webpageId;
			unpublishedPageId = unpub.webpageId;
		});
		it('returns an array of webpages', async () => {
			const result = await webpageRepo.getWebpages();
			expect(Array.isArray(result)).toBe(true);
		});
		it('returns only sitewide pages when sitewide scope is provided', async () => {
			const result = await webpageRepo.getWebpages({ sitewide: true });
			expect(result).toEqual(
				expect.arrayContaining([
					expect.objectContaining({ id: sitewidePageId }),
				])
			);
			expect(result).not.toEqual(
				expect.arrayContaining([
					expect.objectContaining({ id: tournPageId }),
					expect.objectContaining({ id: publishedPageId }),
					expect.objectContaining({ id: unpublishedPageId }),
				])
			);	
		});
		it('returns only tourn-specific pages when tournId scope is provided', async () => {
			const result = await webpageRepo.getWebpages({ tournId });
			expect(result).toEqual(
				expect.arrayContaining([
					expect.objectContaining({ id: tournPageId }),
				])
			);
			expect(result).not.toEqual(
				expect.arrayContaining([
					expect.objectContaining({ id: sitewidePageId }),
					expect.objectContaining({ id: publishedPageId }),
					expect.objectContaining({ id: unpublishedPageId }),
				])
			);
		});
		it('does not return unpublished pages by default', async () => {
			const result = await webpageRepo.getWebpages();
			expect(result).not.toEqual(
				expect.arrayContaining([
					expect.objectContaining({ id: unpublishedPageId }),
				])
			);
		});
		it('returns unpublished pages when includeUnpublished is true', async () => {
			const result = await webpageRepo.getWebpages({}, { includeUnpublished: true });
			expect(result).toEqual(
				expect.arrayContaining([
					expect.objectContaining({ id: unpublishedPageId }),
				])
			);
		});
		it('returns pages matching slug when slug scope is provided', async () => {
			const result = await webpageRepo.getWebpages({ slug: 'published-page' });
			expect(result).toEqual(
				expect.arrayContaining([
					expect.objectContaining({ id: publishedPageId }),
				])
			);
			expect(result).not.toEqual(
				expect.arrayContaining([
					expect.objectContaining({ id: sitewidePageId }),
					expect.objectContaining({ id: tournPageId }),
					expect.objectContaining({ id: unpublishedPageId }),
				])
			);
		});
		it('throws an error when invalid scope key is provided', async () => {
			await expect(webpageRepo.getWebpages({ invalidKey: 'value' })).rejects.toThrow('Invalid webpage scope key: invalidKey');
		});
	});
	describe('createWebpage', () => {
		it('creates webpage when provided valid data', async () => {
			const webpageData = factories.webpage.createWebpageData();
			const resultId = await webpageRepo.createWebpage(webpageData);
			expect(resultId).toBeDefined();
			const result = await webpageRepo.getWebpage(resultId);
			expect(result).toBeDefined();
			expect(result.id).toBe(resultId);
			expect(result.createdAt).toBeDefined();
			expect(result.updatedAt).toBeDefined();
			expect(result.title).toBe(webpageData.title);
			expect(result.content).toBe(webpageData.content);
			expect(result.published).toBe(webpageData.published);
		});
	});
	describe('updateWebpage', () => {
		it('updates webpage when provided valid data', async () => {
			const webpageData = factories.webpage.createWebpageData();
			const { webpageId } = await factories.webpage.createTestWebpage(webpageData);
			const updatedData = { ...webpageData, title: 'Updated Title' };
			await webpageRepo.updateWebpage(webpageId, updatedData);
			const result = await webpageRepo.getWebpage(webpageId);
			expect(result).toBeDefined();
			expect(result.id).toBe(webpageId);
			expect(result.title).toBe(updatedData.title);
		});
		it('throws an error when id is not provided', async () => {
			const webpageData = factories.webpage.createWebpageData();
			await expect(webpageRepo.updateWebpage(null, webpageData)).rejects.toThrow('updateWebpage: WebpageId is required for update');
		});
	});
	describe('deleteWebpage', () => {
		it('deletes webpage when provided valid id', async () => {
			const { webpageId } = await factories.webpage.createTestWebpage();
			await webpageRepo.deleteWebpage(webpageId);
			const result = await webpageRepo.getWebpage(webpageId);
			expect(result).toBeNull();
		});
		it('throws an error when id is not provided', async () => {
			await expect(webpageRepo.deleteWebpage()).rejects.toThrow('deleteWebpage: WebpageId is required for delete');
		});
	});
});