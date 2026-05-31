import judgeRepo from '../../repos/judgeRepo.js';
import chapterJudgeRepo from '../../repos/chapterJudgeRepo.js';

async function unlinkedSearch(req, res) {
	let { first, last } = req.valid.query;

	if (!first || !last) {
		first = req.actor.Person.first;
		last = req.actor.Person.last;
	}

	const [unlinkedJudges, unlinkedChapterJudges] = await Promise.all([
		judgeRepo.unlinkedSearch({ first, last }),
		chapterJudgeRepo.unlinkedSearch({ first, last }),
	]);

	let results = [];
	unlinkedJudges.forEach(j => {
		results.push({
			id: j.id,
			type: 'judge',
			first: j.first,
			last: j.last,
			tournName: j.tourn_name || null,
			schoolName: j.school_name || null,
		});
	});
	unlinkedChapterJudges.forEach(cj => {
		results.push({
			id: cj.id,
			type: 'chapter_judge',
			first: cj.first,
			last: cj.last,
			tournCount: Number(cj.tourn_count ?? 0),
			schoolName: cj.chapter_name || null,
		});
	});
	return res.status(200).json(results);
}

export default {
	unlinkedSearch,
};