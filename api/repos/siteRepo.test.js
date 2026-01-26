import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';
import siteRepo from './siteRepo.js';
import tournRepo from './tournRepo.js';

let testTourn = null;

describe('getSites', () => {
    beforeAll(async () => {
       testTourn = await tournRepo.createTourn({ name: 'Test Tournament', webname: 'testtourn' });
       
    });
    it('should return the list of sites for the given tournament', async () => {
        await siteRepo.createSite({ name: 'Site 1', tournId: testTourn });
        const sites = await siteRepo.getSites({ tournId: testTourn });
        expect(sites).toBeInstanceOf(Array);
        // Check that all sites have the correct tournId
        sites.forEach(site => {
            expect(site.tournId).toBe(testTourn);
        });
    });
    it('should include rooms when requested', async () => {
        await siteRepo.createSite({ name: 'Site 2', tournId: testTourn });
        const sites = await siteRepo.getSites({ tournId: testTourn }, { include: { rooms: true } });
        expect(sites).toBeInstanceOf(Array);
        sites.forEach(site => {
            expect(site.rooms).toBeDefined();
            expect(site.rooms).toBeInstanceOf(Array);
        });
    });
});