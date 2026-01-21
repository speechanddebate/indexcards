import schoolRepo from '../repos/schoolRepo.js';

export async function generateBackup(tournId, scope, scopeId, opts = {}) {
	validateScope(scope, opts);

	const backupData = {
		createdAt : new Date().toISOString(),
		scope,
	};

	switch (scope) {
		case 'tournament':
			break;

		case 'category':
			break;

		case 'event':
			break;

		case 'school':
			backupData.data = await backupSchool(scopeId,tournId, opts);
			break;

		default:
			throw new Error(`Unhandled backup scope: ${scope}`);
	}

	return backupData;
}
async function backupSchool(schoolId, tournId, opts = {}) {
	const school = await schoolRepo.getSchool(schoolId);
	if (!school) {
		throw {
			code: 'NOT_FOUND',
			detail: `School with id ${schoolId} not found.`,
		};
	}
	if (school.tournId !== tournId) {
		throw {
			code: 'FORBIDDEN',
			detail: `School with id ${schoolId} does not belong to tournament with id ${tournId}.`,
		};
	}
	return	school;
};

function validateScope(scope, opts = {}) {
	const validScopes = ['tournament', 'category', 'event', 'school'];
	if (!validScopes.includes(scope)) {
		throw {
			code: 'BAD_REQUEST',
			detail: `Invalid scope. Valid scopes are: ${validScopes.join(', ')}`,
		};
	}
	if (scope !== 'tournament') {
		if (!opts.scopeId || !Number.isInteger(opts.scopeId)) {
			throw {
				code: 'BAD_REQUEST',
				detail: 'scopeId must be provided and be an integer when scope is not tournament',
			};
		}
	}
}

export default {
	generateBackup,
};