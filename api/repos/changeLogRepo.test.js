import changeLogRepo from './changeLogRepo.js';
import factories from '../../tests/factories/index.js';
describe('changeLogRepo', () => {
	it('fetches a changelog with a given id', async () => {
		const { changeLogId } = await factories.changeLog.createTestChangeLog({ description: 'Test Change Log' });
		const changeLog = await changeLogRepo.getChangeLog(changeLogId);
		expect(changeLog).toBeTruthy();
		expect(changeLog.description).toBe('Test Change Log');
	});
	it('returns null if no changelog is found', async () => {
		const changeLog = await changeLogRepo.getChangeLog(999999);
		expect(changeLog).toBeNull();
	});
	it('creates a changelog and returns its id', async () => {
		const changeLogData = { description: 'New Change Log' };
		const changeLogId = await changeLogRepo.createChangeLog(changeLogData);
		expect(changeLogId).toBeTruthy();
		const createdChangeLog = await changeLogRepo.getChangeLog(changeLogId);
		expect(createdChangeLog).toBeTruthy();
		expect(createdChangeLog.description).toBe('New Change Log');
	});
});