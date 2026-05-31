import factories from '../../tests/factories';
import chapterRepo from './chapterRepo';

describe('Chapter Repo', () => {
	describe('getAdmins', () => {
		it('should throw an error if chapterId is not provided', async () => {
			await expect(chapterRepo.getAdmins()).rejects.toThrow('getChapterAdmins: chapterId is required');
		});
		it('should return admins for a chapter', async () => {
			const { chapterId } = await factories.chapter.create();
			const { personId } = await factories.person.create();
			await factories.permission.create({
				chapter: chapterId,
				person: personId,
				tag: 'chapter',
			});
			const admins = await chapterRepo.getAdmins(chapterId);
			expect(Array.isArray(admins)).toBe(true);
			expect(admins.length).toBe(1);
			expect(admins[0].id).toBe(personId);
		});
	});
});