import { UnexpectedError } from '../../../helpers/problem';

// General CRUD for the category itself
export const updateCategory = {

	GET: async (req, res) => {
		const category = await req.db.summon(req.db.category, req.params.categoryId);
		res.status(200).json(category);
	},

	POST: async (req, res) => {
		const category = await req.db.summon(req.db.category, req.params.categoryId);
		const updates = req.body;
		delete updates.id;

		try {
			await category.update(updates);
		} catch (err) {
			return UnexpectedError(req, res, err.message);
		}
		res.status(200).json(category);
	},

	DELETE: async (req, res) => {
		try {
			await req.db.category.destroy({
				where: { id: req.params.categoryId },
			});
		} catch (err) {
			return UnexpectedError(req, res, err.message);
		}

		res.status(200).json({
			error: false,
			message: 'Category deleted',
		});
	},
};

export const randomizeNames = {

	GET: async (req, res) => {

		const judges = await req.db.judge.findAll({ where: { category: req.params.categoryId } });

		const firstNames = await req.db.sequelize.query(`
			select
				person.first
			from person
			order by RAND()
			limit :limit
		`, {
			replacements:  { limit: judges.length },
			type: req.db.sequelize.QueryTypes.SELECT,
		});

		const lastNames = await req.db.sequelize.query(`
			select
				person.last
			from person
			order by RAND()
			limit :limit
		`, {
			replacements:  { limit: judges.length },
			type: req.db.sequelize.QueryTypes.SELECT,
		});

		const promises = [];

		judges.forEach( (judge) => {
			judge.last = lastNames.shift().last;
			judge.first = firstNames.shift().first;
			promises.push(judge.save());
		});

		await Promise.all(promises);
		return res.status(200).json(`Category ${req.params.categoryId} has been renamed semi-anonymously`);
	},
};

export default updateCategory;
