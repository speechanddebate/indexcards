// Updates the NSDA Learn course status for a category's worth of judges.
import { syncLearnResults } from '../../../helpers/nsda.js';
import db from '../../../data/db.js';

// Update NSDA Learn course status for a category's judges
export async function updateCategoryLearn(req, res) {
	const judges = await db.sequelize.query(
		`select judge.id judgeId, judge.person id, judge.first, judge.last, person.nsda, person.email from judge, person where judge.category = :categoryId and judge.person = person.id`,
		{
			replacements: { categoryId: req.params.categoryId },
			type: db.sequelize.QueryTypes.SELECT,
		}
	);

	const promises = [];
	judges.forEach((judge) => {
		const promise = syncLearnResults(judge);
		promises.push(promise);
	});

	return res.status(200).json(`Updated all ${judges.length} judge NSDA Learn status`);
}
