import { describe, it, expect, beforeAll } from 'vitest';
import webpageRepo from './webpageRepo.js';
import tournRepo from './tournRepo.js';

describe('getWebpages', () => {

    var tourn, tournWebpage, nonTournWebpage, unpublishedWebPage;

    beforeAll( async() => {
        tourn = await tournRepo.createTourn({ name: 'Test Tournament' });
        tournWebpage = await webpageRepo.createWebpage({ title: 'Tournament Webpage', tournId: tourn, published: true });
        nonTournWebpage = await webpageRepo.createWebpage({ title: 'Non-Tournament Webpage', published: true });
        unpublishedWebPage = await webpageRepo.createWebpage({ title: 'Unpublished Webpage', published: false });
    });

    it('returns published webpages by default', async () => {

        const result = await webpageRepo.getWebpages();
        //for each result
        result.forEach(page => {
            expect(page.published).toBe(true)
        });
    });

    it('includes unpublished webpages if includeUnpublished is true', async () => {
        const result = await webpageRepo.getWebpages({ opts: { includeUnpublished: true } });
        expect(result).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ id: unpublishedWebPage }),
            ])
        );
    });

    it('filters by tournId in scope', async () => {
        const result = await webpageRepo.getWebpages({ scope: { tournId: tourn } });
        expect(result).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ id: tournWebpage }),
            ])
        );
        // All results should have tournId equal to tourn
        result.forEach(page => {
            expect(page.tournId).toBe(tourn);
        });
    });

    it('filters by sitewide in scope', async () => {
        const siteWide = await webpageRepo.createWebpage({ title: 'Sitewide Webpage', sitewide: true, published: true });
        const result = await webpageRepo.getWebpages({ scope: { sitewide: true } });
        expect(result).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ id: siteWide }),
            ])
        );
        // All results should have sitewide equal to true
        result.forEach(page => {
            expect(page.sitewide).toBe(true);
        });
    });

    it('filters by slug in scope', async () => {
        const slug = 'tournament-webpage';
        const slugWebpage = await webpageRepo.createWebpage({ title: 'Tournament Webpage', slug, published: true });
        const result = await webpageRepo.getWebpages({ scope: { slug } });
        expect(result).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ id: slugWebpage }),
            ])
        );
        // All results should have slug equal to 'tournament-webpage'
        result.forEach(page => {
            expect(page.slug).toBe(slug);
        });
    });
    it('throws on invalid scope key', async () => {
        await expect(webpageRepo.getWebpages({ scope: { invalid: 1 } }))
            .rejects.toThrow('Invalid webpage scope key: invalid');
    });
});