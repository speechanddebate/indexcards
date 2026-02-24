import { NotFound, NotImplemented } from '../../helpers/problem.js';
import schoolRepo from '../../repos/schoolRepo.js';

export async function getSchool(req, res) {
	const tournId = Number(req.params.tournId);
	const schoolId = Number(req.params.schoolId);

	const school = await schoolRepo.getSchool(schoolId);
	if (!school || school.tournId !== tournId) {
		return NotFound(req, res, `School with id ${schoolId} not found in tournament ${tournId}.`);
	}

	return res.json(school);
}

export async function getSchools(req, res) {
	const tournId = Number(req.params.tournId);

	const schools = await schoolRepo.getSchools({ tournId });
	return res.json(schools);
}

export async function createSchool(req, res) {
	return NotImplemented(req, res);
}

export async function updateSchool(req, res) {
	return NotImplemented(req, res);
}

export async function deleteSchool(req, res) {
	return NotImplemented(req, res);
}