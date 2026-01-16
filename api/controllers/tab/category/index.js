import { UnexpectedError } from '../../../helpers/problem.js';
import db from '../../../data/db.js';

// General CRUD for the category itself
// Get category (read)
export async function getCategory(req, res) {
	const category = await db.summon(db.category, req.params.categoryId);
	res.status(200).json(category);
}

// Update category (update)
export async function updateCategory(req, res) {
	const category = await db.summon(db.category, req.params.categoryId);
	const updates = req.body;
	delete updates.id;

	try {
		await category.update(updates);
	} catch (err) {
		return UnexpectedError(req, res, err.message);
	}
	res.status(200).json(category);
}

// Delete category
export async function deleteCategory(req, res) {
	try {
		await db.category.destroy({
			where: { id: req.params.categoryId },
		});
	} catch (err) {
		return UnexpectedError(req, res, err.message);
	}

	res.status(200).json({
		error: false,
		message: 'Category deleted',
	});
}

// Randomize judge names in category
export async function randomizeNames(req, res) {
	const judges = await db.judge.findAll({ where: { category: req.params.categoryId } });

	const firstNames = await db.sequelize.query(
		`select person.first from person order by RAND() limit :limit`,
		{
			replacements: { limit: judges.length },
			type: db.sequelize.QueryTypes.SELECT,
		}
	);

	const lastNames = await db.sequelize.query(
		`select person.last from person order by RAND() limit :limit`,
		{
			replacements: { limit: judges.length },
			type: db.sequelize.QueryTypes.SELECT,
		}
	);

	const promises = [];
	judges.forEach((judge) => {
		judge.last = lastNames.shift().last;
		judge.first = firstNames.shift().first;
		promises.push(judge.save());
	});

	await Promise.all(promises);
	return res.status(200).json(`Category ${req.params.categoryId} has been renamed semi-anonymously`);
}
