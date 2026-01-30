import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';
import siteRepo from './siteRepo.js';
import { createTestTourn } from '/tests/factories/tourn.js';

let tournId = null;

describe('getSites', () => {
    beforeAll(async () => {
       ({ tournId } = await createTestTourn());
    });
    it('should include rooms when requested', async () => {
        await siteRepo.createSite({ name: 'Site 2', tournId: tournId });
        const sites = await siteRepo.getSites({ tournId: tournId }, { include: { rooms: true } });
        expect(sites).toBeInstanceOf(Array);
        sites.forEach(site => {
            expect(site.rooms).toBeDefined();
            expect(site.rooms).toBeInstanceOf(Array);
        });
    });
});