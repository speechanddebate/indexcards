
import fileRepo, { fileInclude } from './fileRepo.js';
import factories from '../../tests/factories/index.js';

describe('FileRepo', () => {
	describe('buildFileQuery', () => {
		it('does not return unpublished files by default', async () => {
			const { fileId } = await factories.file.createTestFile({published: false});
			// Arrange
			const file = await fileRepo.getFile(fileId);

			// Assert
			expect(file).toBeNull();
		});

		it('returns unpublished files when unpublished is true', async () => {
			const { fileId } = await factories.file.createTestFile({published: false});
			// Arrange
			const file = await fileRepo.getFile(fileId, { unpublished: true });

			// Assert
			expect(file).toBeDefined();
		});

	});
	describe('fileInclude', () => {
		it('returns base file include config', () => {
			const inc = fileInclude();
			expect(inc.model).toBeDefined();
			expect(Array.isArray(inc.include)).toBe(true);
		});
	});

	describe('getFiles', () => {
		it('returns error when invalid scope is provided', async () => {
			// Arrange
			let errorCaught = null;

			// Act
			try {
				await fileRepo.getFiles({
					scope: { invalidScope: 123 },
				});
			} catch (error) {
				errorCaught = error;
			}

			// Assert
			expect(errorCaught).toBeInstanceOf(Error);
		});
		it('returns only published tourn files when given tournId', async () => {
			// Arrange
			const { tournId } = await factories.tourn.createTestTourn();

			await factories.file.createTestFile({ tournId });
			const { fileId: publishedFileId } = await factories.file.createTestFile({ tournId, published: true });

			// Act
			const files = await fileRepo.getFiles({ tournId });

			// Assert
			expect(files).toBeInstanceOf(Array);
			//expect oneof the files to match the created file
			const matchedFile = files.find(f => f.id === publishedFileId);
			expect(matchedFile).toBeDefined();
			//expect all files to have tournId and published = true
			for (const f of files) {
				expect(f.tournId).toBe(tournId);
				expect(f.published).toBe(true);
			}
		});
	});
	describe('createFiles', async () => {
		it('creates files successfully', async () => {
			const fileId = await fileRepo.createFile();
			const file = await fileRepo.getFile(fileId,{unpublished: true});

			//ensure that id, updatedAt and createdAt are present and not null
			expect(file).toHaveProperty('id');
			expect(file.id).not.toBeNull();
			expect(file).toHaveProperty('updatedAt');
			expect(file.updatedAt).not.toBeNull();
			expect(file).toHaveProperty('createdAt');
			expect(file.createdAt).not.toBeNull();
		});
	});
});

