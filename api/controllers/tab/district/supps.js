// Functions governing supplements, especially the Great Divide
// introduce in 2024 Des Moines nats

export const divideSchools = {

	GET: async (req, res) => {

		const numTeams = req.params.numTeams || 2;

		const allDistricts = await req.db.sequelize.query(`
			select
				district.id, district.name, district.code,
				count(entry.id) as suppCount
			from district, school, entry, event_setting supp
				where school.tourn = :tournId
				and school.district = district.id
				and school.id = entry.school
				and entry.event = supp.event
				and supp.tag = 'supp'
			group by district.id
			order by suppCount DESC
		`, {
			replacements : { tournId: req.params.tournId },
			type         : req.db.sequelize.QueryTypes.SELECT,
		});

		let teamCounter = numTeams;

		await req.db.sequelize.query(`
			delete ss.*
				from school_setting ss, school
			where school.tourn = :tournId
				and school.id = ss.school
				and ss.tag = 'supp_tag'
		`, {
			replacements : { tournId: req.params.tournId },
			type         : req.db.sequelize.QueryTypes.DELETE,
		});

		for await (const district of allDistricts) {

			teamCounter--;
			if (teamCounter < 1) {
				teamCounter = numTeams;
			}

			const team = teamCounter;
			const schools = await req.db.School.findAll({ where: { district: district.id } });

			for await (const school of schools) {
				const schoolSetting = {
					school : school.id,
					tag    : 'supp_site',
					value  : team,
				};
				await req.db.schoolSetting.create(schoolSetting);
			}
		}

		res.status(200).json(allDistricts);

	},
};

export default divideSchools;
