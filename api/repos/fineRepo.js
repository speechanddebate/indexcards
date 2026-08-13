import db from '../data/db.js';

async function getFines(person,tourn){
	const data = await db.sequelize.query(`
		SELECT
			fine.id,
			fine.reason,
			fine.amount,
			fine.levied_at AS leviedAt,
			fine.tourn,
			currency.value AS currency,
			school.name AS school

		FROM fine

		JOIN tourn
			ON tourn.id = fine.tourn

		LEFT JOIN school
			ON fine.school = school.id

		LEFT JOIN tourn_setting currency
			ON currency.tourn = tourn.id
			AND currency.tag = 'currency'

		WHERE (
			fine.person = :person
			OR EXISTS (
				SELECT 1
				FROM permission
				WHERE permission.person = :person
					AND permission.chapter = school.chapter
					AND permission.tag = 'chapter'
			)
		)
		AND tourn.id = :tourn
		AND fine.deleted = 0
`,{
		replacements: {
			person,
			tourn,
		},
		type: db.Sequelize.QueryTypes.SELECT,
	});
	return data;
}

export default {
	getFines,
};
