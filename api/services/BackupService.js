import tournRepo from '../repos/tournRepo.js';
import categoryRepo from '../repos/categoryRepo.js';
import schoolRepo from '../repos/schoolRepo.js';
import siteRepo from '../repos/siteRepo.js';
import webpageRepo from '../repos/webpageRepo.js';

export async function generateBackup(tournId, scope, scopeId, opts = {}) {
	opts.settings = true;
	validateScope(scope, opts);

	const backupData = {
		createdAt : new Date().toISOString(),
		scope,
	};

	switch (scope) {
		case 'tournament':
			backupData.data = await backupTournament(tournId, opts);
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

async function backupTournament(tournId, opts = {}) {
	const tourn = await tournRepo.getTourn(tournId, { settings: opts.settings });
	tourn.webpages = await webpageRepo.getWebpages({ scope: { tournId }, opts: { includeUnpublished: true } });
	tourn.sites = await siteRepo.getSites({ tournId },{include: {rooms: true}});
	tourn.categories = await categoryRepo.getCategories({ tournId }, { settings: opts.settings });
	return tourn;
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