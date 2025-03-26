// Functions to establish access parameters
import getNSDA from '../../../helpers/nsda.js';
import { multiObjectify } from '../../../helpers/objectify.js';

export const syncNatsAppearances = {

	GET: async (req, res) => {

		const chapterNats = await getNSDA('/reports/nats-appearances');

		const existingChapters = multiObjectify(await req.db.sequelize.query(`
			select chapter.id chapter, chapter.nsda id, cs.id csid, cs.value
			from chapter
				left join chapter_setting cs
					on cs.chapter = chapter.id
					and cs.tag = 'nats_appearances'
			where chapter.nsda > 0
			order by chapter.id, chapter.nsda
		`, {
			type : req.db.sequelize.QueryTypes.SELECT,
		}));

		const updateChapter = `update chapter_setting set value = :value where id = :csid`;
		const createChapter = `insert into chapter_setting (tag, chapter, value) VALUES ('nats_appearances', :chapter, :value)`;

		const counters = {
			chapters : 0,
			students : 0,
		};

		// Use the for/of structure so it returns before the report can be
		// issued for success/failure.

		for await (const chapter of chapterNats.data) {
			if (existingChapters[chapter.school_id]) {
				for await (const existing of existingChapters[chapter.school_id]) {
					if (existing.csid) {
						if (parseInt(existing.value) !== parseInt(chapter.Appearances)) {
							await req.db.sequelize.query(
								updateChapter, {
									replacements : {
										value    : chapter.Appearances,
										csid     : existing.csid,
									},
									type : req.db.sequelize.QueryTypes.UPDATE,
								}
							);
							counters.chapters++;
						}
					} else {
						await req.db.sequelize.query(
							createChapter, {
								replacements : {
									value    : chapter.Appearances,
									chapter  : existing.chapter,
								},
								type : req.db.sequelize.QueryTypes.INSERT,
							}
						);
						counters.chapters++;
					}
				}
			}
		}

		const studentNats = await getNSDA('/reports/member-nats-appearances');
		const existingStudents = multiObjectify(await req.db.sequelize.query(`
			select
				student.id student, student.nsda, ss.id ssid, ss.value
			from student
				left join student_setting ss
					on ss.student = student.id
					and ss.tag = 'nats_appearances'
			where student.nsda > 0
				and student.retired != 1
			order by student.nsda
		`, {
			type : req.db.sequelize.QueryTypes.SELECT,
		}));

		// And then the individual students

		const updateStudent = `update student_setting set value = :value where id = :ssid`;
		const createStudent = `insert into student_setting (tag, student, value) VALUES ('nats_appearances', :student, :value)`;

		for await (const student of studentNats.data) {

			if (existingStudents[student.person_id]) {
				for await (const existing of existingStudents[student.person_id]) {
					if (existing.ssid) {
						if (parseInt(existing.value) !== parseInt(student.appearances)) {

							await req.db.sequelize.query(
								updateStudent, {
									replacements : {
										value    : student.appearances,
										ssid     : existing.ssid,
									},
									type : req.db.sequelize.QueryTypes.UPDATE,
								}
							);
							counters.students++;
						}
					} else {
						await req.db.sequelize.query(
							createStudent, {
								replacements : {
									value    : student.appearances,
									student  : existing.student,
								},
								type : req.db.sequelize.QueryTypes.INSERT,
							}
						);
						counters.students++;
					}
				}
			}
		}

		res.status(200).json({
			error   : false,
			message : `${counters.chapters} chapters and ${counters.students} students nats appearances updated`,
		});
	},
};

export const natsIndividualHonors = {

	GET: async (req, res) => {

		const db = req.db;

		const studentResults = await db.sequelize.query(`
			select
				student.id studentId, student.first, student.last, student.nsda studentNSDA,
				school.id schoolId, school.name schoolName, chapter.nsda chapterNSDA,
				result.rank, result.place,
				round.name roundName, round.label roundLabel,
				event.abbr eventAbbr, event.name eventName, nsda_code.value nsdaCode,
				tourn.name tournName, tourn.start tournDate

			from (entry, result, result_set, entry_student es, student, event, tourn, tourn_setting ts, ballot, panel, round)
				left join event_setting nsda_code
					on nsda_code.event = event.id
					and nsda_code.tag = 'nsda_event_category'
				left join school on entry.school = school.id
				left join chapter on school.chapter = chapter.id

			where ts.tag = 'nsda_nats'
				and ts.tourn = tourn.id
				and tourn.id = event.tourn
				and event.id = entry.event
				and entry.id = es.entry
				and es.student = student.id
				and entry.id = result.entry
				and result.result_set = result_set.id
				and result_set.label = 'Final Places'
				and entry.id = ballot.entry
				and ballot.panel = panel.id
				and panel.round = round.id
				and round.type = 'final'

				and NOT EXISTS (
					select dq.value
					from entry_setting dq
					where dq.entry = entry.id
					and dq.tag = 'dq'
				)
			group by student.id, event.id
			order by tourn.start DESC, event.abbr, result.place
		`, {
			type: db.sequelize.QueryTypes.SELECT,
		});

		res.status(200).json(studentResults);
	},
};

export default syncNatsAppearances;
