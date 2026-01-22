import { toDomain, toPersistence } from './mappers/schoolMapper.js';
import { saveSettings, withSettingsInclude } from './utils/settings.js';
import db from '../data/db.js';

async function getSchool(id, opts = {}) {
	const dbRow = await db.school.findByPk(id, {
		include: [
			...withSettingsInclude({
				model: db.schoolSetting,
				as: 'school_settings',
				settings: opts.settings,
			}),
		],
	});

	if (!dbRow) return null;

	return toDomain(dbRow);
}
async function getSchools(scope, opts = {}) {
	const where = {};
	if (scope.tournId) {
		where.tourn = scope.tournId;
	}
	if (scope.chapterId) {
		where.chapter = scope.chapterId;
	}
	if (scope.regionId) {
		where.region = scope.regionId;
	}
	if (scope.districtId) {
		where.district = scope.districtId;
	}

	const dbRows = await db.school.findAll({
		where,
		include: [
			...withSettingsInclude({
				model: db.schoolSetting,
				as: 'school_settings',
				settings: opts.settings,
			}),
		],
	});

	return dbRows.map(toDomain);
}
async function createSchool(school) {
	const created = await db.school.create(
		toPersistence(school)
	);
	await saveSettings({
		model: db.schoolSetting,
		settings: school.settings,
		ownerKey: 'school',
		ownerId: created.id,
	});

	return created.id;
}
async function updateSchool(id, school) {
	// 1. Update scalar school fields
	const dbRow = toPersistence(school);
	await db.school.update(dbRow, { where: { id } });

	await saveSettings({
		model: db.schoolSetting,
		settings: school.settings,
		ownerKey: 'school',
		ownerId: id,
	});

	return id;
}
async function deleteSchool(id) {
	if (!id) {
		throw new Error('deleteSchool requires id');
	}

	return await db.school.destroy({ where: { id } });
}

export default {
	getSchool,
	getSchools,
	createSchool,
	updateSchool,
	deleteSchool,
};
