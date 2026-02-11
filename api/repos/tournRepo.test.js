
import tournRepo from './tournRepo.js';
import fileRepo from './fileRepo.js';

describe('getTournFiles', () => {
	it('calls fileRepo.getFiles with merged scope and options', async () => {
		// Arrange
		const spy = vi
      .spyOn(fileRepo, 'getFiles')
      .mockResolvedValue([]);

		const opts = {
			includeUnpublished: true,
		};

		// Act
		await tournRepo.getFiles(7, opts);

		// Assert
		expect(spy).toHaveBeenCalledExactlyOnceWith({ tournId: 7 }, {
			includeUnpublished: true,
		});

		spy.mockRestore();
	});
});
