import db from '../../api/data/db.js';

async function createSchoolData(overrides = {}) {
	return {
		...overrides,
	};
};
async function createTestSchool(props = {}) {
	const schoolData = await createSchoolData(props);

	const school = await db.school.create(schoolData);
	return {
		schoolId: school.id,
	};
}

export default {
	createSchoolData,
	createTestSchool,
};