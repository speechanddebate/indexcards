import db from './litedb.js';
import { errorLogger } from './logger.js';

export const getFollowers = async (replacements, options = { recipients: 'all' }) => {

	let whereLimit = '';
	let fields = '';

	if (replacements.panelId) {
		whereLimit = ` where panel.id = :panelId `;
		delete replacements.roundId;
	} else if (replacements.sectionId) {
		whereLimit = ` where panel.id = :sectionId `;
		delete replacements.roundId;
	} else if (replacements.roundId) {
		whereLimit = ` where panel.round = :roundId `;
	} else if (replacements.timeslotId) {
		whereLimit = ` where panel.round = round.id and round.timeslot = :timeslotId `;
		fields = ',round';
		if (replacements.eventIds) {
			whereLimit += `  and round.event IN (:eventIds) `;
		}
	} else {
		return { error: true, message: `No round ID to blast sent.` };
	}

	if (replacements.flight) {
		whereLimit +=  ` and panel.flight = :flight `;
	}

	let queryLimits = '';

	if (replacements.speaker) {
		queryLimits += ` and ballot.speakerorder = :speakerOrder `;
	}

	if (replacements.status === 'unstarted' ) {
		queryLimits += `
			and (ballot.judge_started IS NULL)
			and (ballot.audit = 0 OR ballot.audit IS NULL)
		`;
	} else if (replacements.status === 'unentered' ) {
		queryLimits += `
			and NOT EXISTS (
				select score.id from score where score.ballot = ballot.id
			)
			and (ballot.audit = 0 OR ballot.audit IS NULL)
		`;
	} else if (replacements.status === 'unconfirmed' ) {
		queryLimits += `
			and (ballot.audit = 0 OR ballot.audit IS NULL)
		`;
	}

	if (options.limits?.event ) {
		queryLimits += `
			and round.event IN (:eventIds)
		`;
		replacements.eventIds = Object.keys(options.limits.event);
	}

	const persons = [];

	if (replacements.recipients !== 'judges') {
		const entryIds = await db.sequelize.query(`
			select person.id, person.email, person.no_email
				from (person, entry, entry_student es, student, ballot, panel ${fields})
			${whereLimit}
				and panel.id = ballot.panel
				and ballot.entry = entry.id
				and entry.active = 1
				and entry.id = es.entry
				and es.student = student.id
				and student.person = person.id
				${queryLimits}
		`, {
			replacements,
			type: db.sequelize.QueryTypes.SELECT,
		});

		persons.push(...entryIds);
	}

	if (replacements.recipients !== 'entries') {

		const judgeIds = await db.sequelize.query(`
			select person.id, person.email, person.no_email
				from (person, judge, ballot, panel ${fields})
			${whereLimit}
				and ballot.panel = panel.id
				and ballot.judge = judge.id
				and judge.person = person.id
				${queryLimits}
		`, {
			replacements,
			type: db.sequelize.QueryTypes.SELECT,
		});
		persons.push(...judgeIds);
	}

	if (!replacements.noFollowers && !replacements.no_followers) {

		if (replacements.recipients !== 'entries') {
			const judgeFollowers = await db.sequelize.query(`
				select person.id, person.email, person.no_email
					from (person, follower, ballot, panel ${fields})
				${whereLimit}
					and ballot.panel = panel.id
					and ballot.judge = follower.judge
					and follower.person = person.id
					${queryLimits}
			`, {
				replacements,
				type: db.sequelize.QueryTypes.SELECT,
			});

			persons.push(...judgeFollowers);
		}

		if (replacements.recipients !== 'judges') {
			const entryFollowers = await db.sequelize.query(`
				select person.id, person.email, person.no_email
					from (person, follower, entry, ballot, panel ${fields})
				${whereLimit}
					and ballot.panel = panel.id
					and ballot.entry = entry.id
					and entry.active = 1
					and entry.id = follower.entry
					and follower.person = person.id
					${queryLimits}
			`, {
				replacements,
				type: db.sequelize.QueryTypes.SELECT,
			});

			persons.push(...entryFollowers);
		}
	}

	if (replacements.sectionFollowers) {
		const sectionFollowerIds = await db.sequelize.query(`
			select
				ps.id, ps.value_text followers
			from panel_setting ps
			where ps.panel = :panelId
				and ps.tag = 'share_followers'
		`, {
			replacements,
			type: db.Sequelize.QueryTypes.SELECT,
		});

		let followerIds = '';

		if (sectionFollowerIds[0].followers) {
			try {
				followerIds = JSON.parse(sectionFollowerIds[0].followers).join(',');
			} catch (err) {
				errorLogger.info(err);
			}
		}

		const sectionFollowers = await db.sequelize.query(`
			select person.id, person.email, person.no_email
				from (person)
			where person.id IN (:followerIds)
				and person.no_email = 0
		`, {
			replacements : { followerIds },
			type         : db.sequelize.QueryTypes.SELECT,
		});

		persons.push(...sectionFollowers);
	}

	if (replacements.returnEmails) {
		const personIds = {};
		const unique = [];
		for (const person of persons) {
			if (!personIds[person.id]) {
				personIds[person.id] = true;
				unique.push(person.email);
			}
		}
		return unique;
	}

	const personIds = [];

	for (const person of persons) {
		personIds.push(person?.id);
	}

	return [...new Set(personIds)];
};

export const getPairingFollowers = async (replacements, options = { recipients: 'all' }) => {

	let whereLimit = '';
	let fields = '';

	if (replacements.panelId) {
		whereLimit = ` where panel.id = :panelId `;
		delete replacements.roundId;
	} else if (replacements.sectionId) {
		whereLimit = ` where panel.id = :sectionId `;
		delete replacements.roundId;
	} else if (replacements.roundId) {
		whereLimit = ` where panel.round = :roundId `;
	} else if (replacements.timeslotId) {
		whereLimit = ` where panel.round = round.id and round.timeslot = :timeslotId `;
		fields = ',round';
	} else {
		return { error: true, message: `No round or section to blast sent` };
	}

	if (options.flight) {
		whereLimit +=  ` and panel.flight = :panelFlight `;
		replacements.panelFlight = options.flight;
	}

	let queryLimits = '';

	if (options.speaker) {
		queryLimits += `
			and ballot.speakerorder = :speakerOrder
		`;
		replacements.speakerOrder = options.speakerOrder;
	}

	if (options.status === 'unstarted' ) {
		queryLimits += `
			and (ballot.judge_started IS NULL)
			and (ballot.audit = 0 OR ballot.audit IS NULL)
		`;
	} else if (options.status === 'unentered' ) {
		queryLimits += `
			and NOT EXISTS (
				select score.id from score where score.ballot = ballot.id
			)
			and (ballot.audit = 0 OR ballot.audit IS NULL)
		`;
	} else if (options.status === 'unconfirmed' ) {
		queryLimits += `
			and (ballot.audit = 0 OR ballot.audit IS NULL)
		`;
	}

	if (options.limits?.event ) {
		queryLimits += `
			and round.event IN (:eventIds)
		`;
		replacements.eventIds = Object.keys(options.limits.event);
	}

	const blastBy = {
		entries : {},
		judges  : {},
		schools : {},
		error   : false,
	};

	if (options.recipients !== 'judges') {

		const entryPeopleQuery = `
			select
				person.id, person.email, person.phone, person.provider, entry.id entry, entry.school school
			from (panel, person, ballot, entry, entry_student es, student ${fields})
			${whereLimit}
				and ballot.panel = panel.id
				and ballot.entry = entry.id
				and entry.active = 1
				and entry.id = es.entry
				and es.student = student.id
				and student.person = person.id
				and person.no_email = 0
			${queryLimits}
		`;

		const rawEntryPeople = await db.sequelize.query(entryPeopleQuery, {
			replacements,
			type: db.sequelize.QueryTypes.SELECT,
		});

		for (const person of rawEntryPeople) {

			if (!blastBy.entries[person.entry]) {
				blastBy.entries[person.entry] = [];
			}
			blastBy.entries[person.entry].push(`${person.id}`);
		}
	}

	if (options.recipients !== 'entries') {

		const judgePeopleQuery = `
			select
				person.id, person.email, person.phone, person.provider, judge.id judge, judge.school school
			from (person, ballot, judge, panel ${fields})
			${whereLimit}
				and ballot.panel = panel.id
				and ballot.judge = judge.id
				and judge.person = person.id
				and person.no_email = 0
			${queryLimits}
		`;

		const rawJudgePeople = await db.sequelize.query(judgePeopleQuery, {
			replacements,
			type: db.sequelize.QueryTypes.SELECT,
		});

		for (const person of rawJudgePeople) {

			if (!blastBy.judges[person.judge]) {
				blastBy.judges[person.judge] = [];
			}

			blastBy.judges[person.judge].push(`${person.id}`);
		}
	}

	if (!options.no_followers) {

		if (options.recipients !== 'judges') {

			const entryFollowersQuery = `
				select
					person.id, person.email, person.phone, person.provider, entry.id entry
				from (person, ballot, entry, follower, panel ${fields})
				${whereLimit}
					and ballot.panel = panel.id
					and ballot.entry = entry.id
					and entry.active = 1
					and entry.id = follower.entry
					and follower.person = person.id
					and person.no_email = 0
				${queryLimits}
			`;

			const rawEntryFollowers = await db.sequelize.query(entryFollowersQuery, {
				replacements,
				type: db.sequelize.QueryTypes.SELECT,
			});

			for (const person of rawEntryFollowers) {

				if (!blastBy.entries[person.entry]) {
					blastBy.entries[person.entry] = [];
				}

				blastBy.entries[person.entry].push(`${person.id}`);
			}

			const schoolFollowersQuery = `
				select
					person.id, person.email, follower.school school
				from (person, ballot, entry, follower, panel ${fields})
				${whereLimit}
					and ballot.panel = panel.id
					and ballot.entry = entry.id
					and entry.active = 1
					and entry.school = follower.school
					and follower.person = person.id
					and person.no_email = 0
				${queryLimits}
			`;

			const rawSchoolFollowers = await db.sequelize.query(schoolFollowersQuery, {
				replacements,
				type: db.sequelize.QueryTypes.SELECT,
			});

			for (const person of rawSchoolFollowers) {
				if (!blastBy.schools[person.school]) {
					blastBy.schools[person.school] = [];
				}
				blastBy.schools[person.school].push(`${person.id}`);
			}
		}

		if (options.recipients !== 'entries') {

			const judgeFollowersQuery = `
				select
					person.id, person.email, person.phone, person.provider, ballot.judge judge,
					push_notify.value web
				from (person, ballot, follower, panel ${fields})
					left join person_setting push_notify
						on push_notify.person = person.id
						and push_notify.tag = 'push_notify'
				${whereLimit}
					and ballot.panel = panel.id
					and ballot.judge = follower.judge
					and follower.person = person.id
					and person.no_email = 0
				${queryLimits}
			`;

			const rawJudgeFollowers = await db.sequelize.query(judgeFollowersQuery, {
				replacements,
				type: db.sequelize.QueryTypes.SELECT,
			});

			for (const person of rawJudgeFollowers) {

				if (!blastBy.judges[person.judge]) {
					blastBy.judges[person.judge] = [];
				}

				blastBy.judges[person.judge].push(`${person.id}`);
			}

			const schoolFollowersQuery = `
				select
					person.id, person.email, ballot.judge judge
				from (person, judge, ballot, follower, panel ${fields})
				${whereLimit}
					and ballot.panel = panel.id
					and ballot.judge = judge.id
					and judge.school = follower.school
					and judge.school > 0
					and follower.person = person.id
					and person.no_email = 0
				${queryLimits}
			`;

			const rawSchoolFollowers = await db.sequelize.query(schoolFollowersQuery, {
				replacements,
				type: db.sequelize.QueryTypes.SELECT,
			});

			for (const person of rawSchoolFollowers) {

				if (!blastBy.schools[person.school]) {
					blastBy.schools[person.school] = [];
				}

				blastBy.schools[person.school].push(`${person.id}`);
			}
		}
	}

	return blastBy;

};

// Get the acccounts linked to judges in the follower pools.  This function
// only works in judge-specific 'only' mode since releases etc must be tagged
// to an individual judge name and not to the pool as a whole.

export const getJPoolJudges = async (replacements, options = { recipients: 'all' }) => {

	const judges = {};

	const judgePeopleQuery = `
		select
			person.id, judge.id judgeId, judge.first, judge.last
		from (person, judge, jpool_judge jpj, jpool)
		where jpool.id = :jpoolId
			and jpool.id = jpj.jpool
			and jpj.judge = judge.id
			and judge.person = person.id
			and person.no_email = 0
	`;

	const rawJudgePeople = await db.sequelize.query(judgePeopleQuery, {
		replacements,
		type: db.sequelize.QueryTypes.SELECT,
	});

	for await (const person of rawJudgePeople) {
		if (!person.judgeId) {
			return;
		}

		if (!judges[person.judgeId]) {
			judges[person.judgeId] = {
				first      : person.first,
				last       : person.last,
				recipients : [person.id],
			};
		}
	}

	if (!options.no_followers) {
		const judgeFollowersQuery = `
			select
				person.id, judge.id judgeId, judge.first, judge.last
			from (person, judge, jpool_judge jpj, jpool, follower)
			where jpool.id = :jpoolId
				and jpool.id        = jpj.jpool
				and jpj.judge       = judge.id
				and judge.id        = follower.judge
				and follower.person = person.id
				and person.no_email = 0
		`;

		const rawJudgeFollowers = await db.sequelize.query(judgeFollowersQuery, {
			replacements,
			type: db.sequelize.QueryTypes.SELECT,
		});

		for await (const person of rawJudgeFollowers) {
			if (!person.judgeId) {
				return;
			}

			if (!judges[person.judgeId]) {
				judges[person.judgeId].first = person.first;
				judges[person.judgeId].last = person.last;
				judges[person.judgeId].recipients = [];
			}

			judges[person.judgeId].recipients.push(person.id);
		}
	}

	return judges;
};

export const getTimeslotJudges = async (replacements, options = { recipients: 'all' }) => {

	const blastBy = {
		entry  : {},
		judge  : {},
		school : {},
	};

	const judgePeopleQuery = `
		select
			person.id, person.email, person.phone, person.provider, judge.id judge, judge.school school
		from (person, judge, jpool_judge jpj, jpool, jpool_round jpr, round)
		where round.timeslot = :timeslotId
			and round.site = :siteId
			and round.id = jpr.round
			and jpr.jpool = jpool.id
			and jpool.id = jpj.jpool
			and jpj.judge = judge.id
			and judge.person = person.id
			and judge.active = 1
			and person.no_email = 0
	`;

	const rawJudgePeople = await db.sequelize.query(judgePeopleQuery, {
		replacements,
		type: db.sequelize.QueryTypes.SELECT,
	});

	for await (const person of rawJudgePeople) {
		if (!person.judge) {
			return;
		}

		if (!blastBy.judges[person.judge]) {
			blastBy.judges[person.judge] = {
				phone : [],
				email : [],
			};
		}

		if (person.provider && person.phone) {
			blastBy.judges[person.judge].phone.push(`${person.phone}@${person.provider}`);
		}

		blastBy.judges[person.judge].email.push(person.email);
	}

	if (!options.no_followers) {

		const judgeFollowersQuery = `
			select
				person.id, person.email, person.phone, person.provider, jpj.judge judge
			from (person, judge, jpool_judge jpj, jpool, jpool_round jpr, round, follower)
			where round.timeslot = :timeslotId
				and round.site = :siteId
				and round.id = jpr.round
				and jpr.jpool = jpool.id
				and jpool.id = jpj.jpool
				and jpj.judge = judge.id
				and judge.id = follower.judge
				and judge.active = 1
				and follower.person = person.id
				and person.no_email = 0
		`;

		const rawJudgeFollowers = await db.sequelize.query(judgeFollowersQuery, {
			replacements,
			type: db.sequelize.QueryTypes.SELECT,
		});

		for await (const person of rawJudgeFollowers) {
			if (!person.judge) {
				return;
			}
			if (!blastBy.judges[person.judge]) {
				blastBy.judges[person.judge] = {
					phone : [],
					email : [],
				};
			}

			if (person.phone && person.provider) {
				blastBy.judges[person.judge].phone.push(`${person.phone}@${person.provider}`);
			}

			blastBy.judges[person.judge].email.push(`${person.email}`);
		}
	}

	const blastAll = {
		phone      : [],
		email      : [],
		only       : { ...blastBy },
		recipients : options.recipients,
		error      : false,
	};

	return blastAll;

};

export default getFollowers;
