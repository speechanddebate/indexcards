
import db from '../../../data/db.js';
export async function getSectionEntries(req, res) {
	const entryQuery = `
		select
			entry.id,
			entry.school,
			region.id region,
			district.id district,
			chapter.state state,
			hybrid.school hybrid,
			ballot.side side
		from (ballot, entry)

			left join school on entry.school = school.id
			left join region on school.region = region.id
			left join district on school.district = district.id
			left join chapter on school.chapter = chapter.state
			left join strike hybrid on hybrid.type = 'hybrid' and hybrid.entry = entry.id

		where ballot.panel = :sectionId
			and ballot.entry = entry.id
			and entry.active = 1
	`;

	const rawEntries = await db.sequelize.query(entryQuery, {
		replacements: { sectionId: req.params.sectionId },
		type: db.sequelize.QueryTypes.SELECT,
	});

	const entries = {};
	entries.Entries = [];
	entries.EntrySchools = {};
	entries.EntryRegions = {};
	entries.EntrydioRegions = {};
	entries.EntryDistricts = {};
	entries.EntryStates = {};

	rawEntries.forEach(  (entry) => {

		entries.Entries.push(entry);

		if (entry.school) {
			entries.EntrySchools[entry.school] = true;
		}
		if (entry.hybrid) {
			entries.EntrySchools[entry.hybrid] = true;
		}
		if (entry.region) {
			entries.EntryRegions[entry.region] = true;
		}
		if (entry.district) {
			entries.EntryDistricts[entry.district] = true;
		}
		if (entry.state) {
			entries.EntryStates[entry.state] = true;
		}
	});

	if (req.return) {
		return entries;
	}

	res.status(200).json(entries);
};
