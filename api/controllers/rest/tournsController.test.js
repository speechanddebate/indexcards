import { createContext } from '../../../tests/httpMocks.ts';
import { getPublishedFiles } from './tournsController';
import fileRepo from '../../repos/fileRepo';
describe('getFiles', () => {
	it('returns empty array when no files found', async () => {
		const { res, req } = createContext({
			valid: {
				params: { tournId: 1 },
			},
		});
		vi.spyOn(fileRepo, 'getFiles').mockResolvedValue([]);

		await getPublishedFiles(req, res);

		expect(res).not.toBeProblemResponse();
		expect(res.body).toEqual([]);
	});
});