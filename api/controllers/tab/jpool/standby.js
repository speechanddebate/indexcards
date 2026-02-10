import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import db from '../../../data/db.js';

dayjs.extend(utc);
dayjs.extend(timezone);

// This function will auto populate a pool with standby judges selected
// for school/geographic diversity.

export async function placeJudgesStandby(req, res) {

	let rawJudges = [];

	if (req.body.parentId && req.body.parentId !== 'NaN') {

		let dayStart = '';
		let dayEnd = '';

		const times = await db.sequelize.query(`
			select
				timeslot.start, timeslot.end, tourn.tz
			from timeslot, round, jpool_round jpr, tourn
			where 1=1
				and jpr.jpool      = :jpoolId
				and jpr.round      = round.id
				and round.timeslot = timeslot.id
				and timeslot.tourn = tourn.id
			order by timeslot.start
		`, {
			replacements: { jpoolId: req.body.parentId },
			type: db.sequelize.QueryTypes.SELECT,
		});

		if (times && times.length > 0) {

			dayStart = dayjs(times[0].start)
				.tz(times[0].tz)
				.startOf('day')
				.utc()
				.format('YYYY-MM-DD HH:mm:ss');

			dayEnd = dayjs(times[0].start)
				.tz(times[0].tz)
				.endOf('day')
				.utc()
				.format('YYYY-MM-DD HH:mm:ss');

			const standbyJudgeQuery = `
				select
					judge.id, judge.last, judge.school, region.id region,
						count(distinct panel.id) ballots,
						count(distinct standby.jpool) standbys,
						count(distinct entry.id) entries
				from (judge, jpool_judge jpj)

					left join jpool_judge standby
						on standby.judge = judge.id
						AND EXISTS (
							select jps.id
								from jpool_setting jps, timeslot
							where jps.jpool = standby.jpool
								and jps.tag = 'standby_timeslot'
								and jps.value = timeslot.id
								and timeslot.start > :dayStart
								and timeslot.start < :dayEnd
						)

					left join ballot on ballot.judge = judge.id
					left join panel on panel.id = ballot.panel

					left join school on judge.school = school.id
					left join region on school.region = region.id
					left join entry on entry.school = school.id
						and entry.active = 1

				where jpj.jpool = :parentId
					and jpj.judge = judge.id
				group by judge.id
				order by standbys desc, ballots desc
			`;

			rawJudges = await db.sequelize.query(standbyJudgeQuery, {
				replacements: { parentId: req.body.parentId, dayStart, dayEnd },
				type: db.sequelize.QueryTypes.SELECT,
			});
		}

	} else if (req.body.categoryId) {

		const standbyJudgeQuery = `
			select
				judge.id, judge.school, region.id region,
					count(distinct panel.id) ballots,
					count(distinct standby.jpool) standbys,
					count(distinct entry.id) entries
			from (judge)

				left join jpool_judge standby
					on standby.judge = judge.id
					AND EXISTS (
						select jps.id
							from jpool_setting jps, timeslot
						where jps.jpool = standby.jpool
							and jps.tag = 'standby_timeslot'
					)

				left join ballot on ballot.judge = judge.id
				left join panel on panel.id = ballot.panel

				left join school on judge.school = school.id
				left join region on school.region = region.id
				left join entry on entry.school = school.id and entry.active = 1

			where judge.category = :categoryId
			group by judge.id
			order by standbys desc, ballots desc
		`;

		rawJudges = await db.sequelize.query(standbyJudgeQuery, {
			replacements: { categoryId: req.body.categoryId },
			type: db.sequelize.QueryTypes.SELECT,
		});
	}

	const chosen = {};

	for (const judge of rawJudges) {
		judge.score = (parseInt(judge.standbys) * 1000);
		judge.score += (parseInt(judge.ballots) * 10);
		judge.score += parseInt(judge.entries);
	}

	let counter = req.body.targetCount;

	while (counter > 0) {

		counter--;
		rawJudges.sort( (a, b) => parseInt(a.score) - parseInt(b.score));
		const picked = rawJudges.shift();

		if (picked) {
			chosen[picked.id] = picked;

			for (const judge of rawJudges) {
				if (judge.school === picked.school) {
					judge.score += 5000;
				}
				if (judge.region === picked.region) {
					judge.score += 1000;
				}
			}
		}
	}

	const addJudge = `insert into jpool_judge (judge, jpool) values (:judgeId, :jpoolId)`;

	Object.keys(chosen).forEach( async (judgeId) => {
		await db.sequelize.query(addJudge, {
			replacements: { judgeId, jpoolId: req.body.jpoolId },
			type: db.sequelize.QueryTypes.INSERT,
		});
	});

	res.status(200).json({
		error   : false,
		refresh : true,
		message : `${Object.keys(chosen).length} Judges added to standby pool`,
	});
};
