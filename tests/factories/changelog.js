import changeLogRepo from '../../api/repos/changeLogRepo.js';

export function createChangeLogData(overrides = {}) {
	return {
		...overrides,
	};
}

export async function createTestChangeLog(overrides = {}) {
	const data = createChangeLogData(overrides);
	const changeLogId = await changeLogRepo.createChangeLog(data);

	return {
		changeLogId,
		getChangeLog: () => changeLogRepo.getChangeLog(changeLogId),
	};
}

export default {
	createTestChangeLog,
	createChangeLogData,
};