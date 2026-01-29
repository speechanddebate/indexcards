import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';
import siteRepo from './siteRepo.js';
import tournRepo from './tournRepo.js';

let testTourn = null;

describe('getSites', () => {
    beforeAll(async () => {
       testTourn = await tournRepo.createTourn({ name: 'Test Tournament', webname: 'testtourn' });
       
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