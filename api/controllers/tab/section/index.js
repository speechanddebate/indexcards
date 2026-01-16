import { UnexpectedError } from '../../../helpers/problem.js';
import db from '../../../data/db.js';
// General CRUD for the section itself

export async function updateSectionGET(req, res) {
	const section = await db.summon(db.section, req.params.sectionId);
	res.status(200).json(section);
}

// This will not create a section because the section ID is already encoded
// here.  So instead just update the existing section

export async function updateSection(req, res) {
	const section = await db.summon(db.section, req.params.sectionId);
	const updates = req.body;
	delete updates.id;
	try {
		await section.update(updates);
	} catch (err) {
		return UnexpectedError(req, res, err.message);
	}
	res.status(200).json(section);
}

export async function deleteSection(req, res) {
	try {
		await db.section.destroy({
			where: { id: req.params.sectionId },
		});
	} catch (err) {
		return UnexpectedError(req, res, err.message);
	}
	res.status(200).json({
		error: false,
		message: 'Section deleted',
	});
}

// No default export; use named exports
