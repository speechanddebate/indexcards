import { getAllSalesforceStudents, getOneSalesforceStudent, getSalesforceChapters, getSalesforceStudents, postSalesforceStudents } from '../../helpers/naudl.js';
import db from '../../helpers/litedb.js';

export const syncNAUDLChapters = async () => {

	const naudlChapters = await getSalesforceChapters();

	const tabroomChapters = await db.sequelize.query(`
		select
			chapter.id,
				naudl.id settingId, naudl.value naudlId
		from (chapter, chapter_setting cs)
			left join chapter_setting naudl
				on naudl.chapter = chapter.id
				and naudl.tag = 'naudl_id'
		where chapter.id = cs.chapter
			and cs.tag = 'naudl'
	`, {
		type: db.sequelize.QueryTypes.SELECT,
	});

	const naudlById = {};

	for await (const chapter of naudlChapters) {
		chapter.TRID = parseInt(chapter.Tabroom_teamid__c?.slice(2));
		naudlById[chapter.TRID] = chapter.Id;
	}

	const missing = [];
	const matches = [];
	const mismatches = [];
	const chaptersToPost = [];

	for await (const chapter of tabroomChapters) {

		if (!naudlById[chapter.id]) {
			chaptersToPost.push(chapter.id);
		} else if (!chapter.naudlId) {

			const setting = await db.sequelize.query(`
				insert into chapter_setting
					(chapter, tag, value)
					VALUES (:chapterId, 'naudl_id', :naudlId )
			`, {
				replacements: {
					chapterId: chapter.id,
					naudlId: naudlById[chapter.id]
				},
				type: db.Sequelize.QueryTypes.INSERT
			});

			missing.push(`Setting saved for chapter ${chapter.id} with NAUDL ID ${naudlById[chapter.id]}`);

		} else if (chapter.naudlId !== naudlById[chapter.id] ) {

			const setting = await db.sequelize.query(`
				update chapter_setting
					set value = :naudlId
					where chapter = :chapterId
					and tag = 'naudl_id'
			`, {
				replacements: {
					chapterId: chapter.id,
					naudlId: naudlById[chapter.id]
				},
				type: db.Sequelize.QueryTypes.UPDATE
			});

			mismatches.push(`Setting mismatch: chapter ${chapter.id} set to new NAUDL ID ${naudlById[chapter.id]}`);
		}
	}

	const response = {
		mismatches,
		matches,
		missing,
		chaptersToPost,
	};

	return response;
};

await syncNAUDLChapters();

process.exit();

