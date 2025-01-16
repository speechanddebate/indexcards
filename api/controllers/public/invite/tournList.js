import moment from 'moment-timezone';

export const futureTourns = {

	GET: async (req, res) => {
		const db = req.db;
		const tournList = getTourns(db, ...req.body);
		return res.stats(200).json(tournList);
	},
	POST: async (req, res) => {
		const db = req.db;
		const tournList = getTourns(db, ...req.params);
		return res.stats(200).json(tournList);
	},
};

const getTourns = async (db, config, limit, start, state, circuit) => {

	let logicLimit = '';
	let countLimit = '';
	let timeScope = ' DATE(NOW() - INTERVAL 2 DAY)';

	if (config.MODE === 'test') {
		// the nine test suite tournaments are forever in the past.  This one
		// excludes Nationals but not the other eight others.

		timeScope = `'2023-08-01 00:00:00'`;
	}

	if (limit && start) {
		countLimit = ` LIMIT ${start}, ${limit}`;
	} else if (limit) {
		countLimit = ` LIMIT ${limit}`;
	}

	if (typeof circuit === 'number') {
		logicLimit = ` and exists (
			select tourn_circuit.id from tourn_circuit
			where tourn_circuit.tourn = tourn.id
			and tourn_circuit.approved = 1
			and tourn_circuit.circuit = ${circuit}
		) `;
	}

	if (typeof state === 'string' && state.length === 2) {
		logicLimit = ` and tourn.state = '$state.toUpperCase()}'`;
	}

	const [rawFuture] = await db.sequelize.query(`
		select tourn.id, tourn.webname, tourn.name, tourn.tz,
			tourn.city as location, tourn.state, tourn.country,
			CONVERT_TZ(tourn.start, '+00:00', tourn.tz) start,
			CONVERT_TZ(tourn.end, '+00:00', tourn.tz) end,
			CONVERT_TZ(tourn.reg_end, '+00:00', tourn.tz) reg_end,
			CONVERT_TZ(tourn.reg_start, '+00:00', tourn.tz) reg_start,
			msnats.value as msnats,
			nats.value as nats,
			ncfl.value as ncfl,
			closed.value as closed,
			count(distinct school.id) as schoolcount,
			YEAR(tourn.end) as year,
			CONCAT(YEAR(tourn.start), DATE_FORMAT(tourn.start, '%v')) as week,
			CONCAT(YEAR(tourn.end), DATE_FORMAT(tourn.end, '%v')) as endweek,
			( select GROUP_CONCAT(signup.abbr SEPARATOR ', ')
					from category signup
				where signup.tourn = tourn.id
					and signup.abbr IS NOT NULL
					and signup.abbr != ''
					and exists ( select cs.id
						from category_setting cs
						where cs.category = signup.id
						and cs.tag = 'public_signups'
					)
					and exists (
						select csd.id
						from category_setting csd
						where csd.category = signup.id
						and csd.tag = 'public_signups_deadline'
						and csd.value_date > ${timeScope}
					)
					and not exists (
						select csd.id
						from category_setting csd
						where csd.category = signup.id
						and csd.tag = 'private_signup_link'
					)
			) as signup,

			( SELECT
				count(online.id)
				from event online, event_setting eso
				where online.tourn = tourn.id
				and online.id = eso.event
				and eso.tag = 'online_mode'
			) as online,

			( SELECT
				count(in_person.id)
				from event in_person
				where in_person.tourn = tourn.id
				and not exists (
					select esno.id
					from event_setting esno
					where esno.event = in_person.id
					and esno.tag = 'online_mode'
				)
			) as in_person,

			( SELECT
				count(hybrid.id)
				from event hybrid, event_setting esh
				where hybrid.tourn = tourn.id
				and hybrid.id = esh.event
				and esh.tag = 'online_hybrid'
			) as hybrid

		from tourn

		left join tourn_setting closed
			on closed.tourn = tourn.id
			and closed.tag = 'closed_entry'

		left join tourn_setting msnats
			on msnats.tourn = tourn.id
			and msnats.tag = 'nsda_ms_nats'

		left join tourn_setting nats
			on nats.tourn = tourn.id
			and nats.tag = 'nsda_nats'

		left join tourn_setting ncfl
			on ncfl.tourn = tourn.id
			and ncfl.tag = 'nsda_ncfl'

		left join school on tourn.id = school.tourn
	where 1=1
		and tourn.hidden = 0
		and tourn.name != 'TEST'
		and tourn.end > ${timeScope}
		${logicLimit}
		and not exists (
			select weekend.id
			from weekend
			where weekend.tourn = tourn.id
		)
		and exists (select event.id from event where event.tourn = tourn.id)
		group by tourn.id
		order by tourn.end, schoolcount DESC
		${countLimit}
	`);

	const [futureDistricts] = await db.sequelize.query(`
		select
			tourn.id, tourn.webname, tourn.name, tourn.tz,
			weekend.id as districts,
			weekend.name weekendName, weekend.city as location, weekend.state, tourn.country,
			site.name site,
			CONVERT_TZ(weekend.start, '+00:00', tourn.tz) start,
			CONVERT_TZ(weekend.end, '+00:00', tourn.tz) end,
			CONVERT_TZ(weekend.reg_end, '+00:00', tourn.tz) reg_end,
			CONVERT_TZ(weekend.reg_start, '+00:00', tourn.tz) reg_start,
			count(distinct school.id) as schoolcount,
			YEAR(weekend.start) as year,
			CONCAT(YEAR(weekend.start), DATE_FORMAT(weekend.start, '%v')) as week,
			CONCAT(YEAR(weekend.end), DATE_FORMAT(weekend.end, '%v')) as endweek,
			( select GROUP_CONCAT(signup.abbr SEPARATOR ', ')
					from category signup
				where signup.tourn = tourn.id
					and signup.abbr IS NOT NULL
					and signup.abbr != ''
					and exists ( select cs.id
						from category_setting cs
						where cs.category = signup.id
						and cs.tag = 'public_signups'
					)
					and exists (
						select csd.id
						from category_setting csd
						where csd.category = signup.id
						and csd.tag = 'public_signups_deadline'
						and csd.value_date > ${timeScope}
					)
					and not exists (
						select csd.id
						from category_setting csd
						where csd.category = signup.id
						and csd.tag = 'private_signup_link'
					)
			) as signup,

			( SELECT
				count(online.id)
				from event online, event_setting eso
				where online.tourn = tourn.id
				and online.id = eso.event
				and eso.tag = 'online_mode'
			) as online,

			( SELECT
				count(in_person.id)
				from event in_person
				where in_person.tourn = tourn.id
				and not exists (
					select esno.id
					from event_setting esno
					where esno.event = in_person.id
					and esno.tag = 'online_mode'
				)
			) as in_person,

			( SELECT
				count(hybrid.id)
				from event hybrid, event_setting esh
				where hybrid.tourn = tourn.id
				and hybrid.id = esh.event
				and esh.tag = 'online_hybrid'
			) as hybrid

		from (tourn, weekend)

		left join site on weekend.site = site.id
		left join school on tourn.id = school.tourn

		where tourn.hidden = .0
		and weekend.end > ${timeScope}
		${logicLimit}
		and weekend.tourn = tourn.id
		and exists (select event.id from event where event.tourn = tourn.id)

		group by weekend.id
		order by weekend.start
		${countLimit}
	`);

	rawFuture.push(...futureDistricts);

	const future = rawFuture.map( tourn => {

		if (tourn.closed) {
			tourn.closed = true;
		} else {
			tourn.closed = false;
		}

		if (tourn.msnats || tourn.nats || tourn.ncfl) {
			tourn.nats = true;
		} else {
			tourn.nats = false;
		}
		delete tourn.msnats;
		delete tourn.ncfl;

		tourn.week = parseInt(tourn.week);
		tourn.endweek = parseInt(tourn.endweek);

		if (tourn.endweek - tourn.week > 2) {
			tourn.week = tourn.endweek;
		}
		delete tourn.endweek;
		return tourn;
	});

	const thisWeek = moment().subtract(11, 'days').weeks();

	future.sort( (a, b) => {
		return (thisWeek > a.week) - (thisWeek > b.week)
			|| a.year - b.year
			|| a.week - b.week
			|| b.schoolcount - a.schoolcount;
	});

	let count = 1;

	const limitedSet = future.filter( (tourn) => {
		if (limit && count > limit) {
			return;
		}
		count++;

		if (start && count < start) {
			return;
		}
		return tourn;
	});

	return limitedSet;
};

futureTourns.GET.apiDoc = {
	summary: 'Returns the public listing of upcoming tournaments',
	operationId: 'futureTourns',
	parameters: [
		{
			in          : 'path',
			name        : 'circuit',
			description : 'ID of a circuit to limit the search to',
			required    : false,
			schema      : { type: 'integer', minimum : 1 },
		},
	],
	responses: {
		200: {
			description: 'List of public upcoming tournaments',
			content: { '*/*': { schema: { $ref: '#/components/schemas/futureTourns' } } },
		},
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
	tags: ['futureTourns', 'invite', 'public'],
};

export default futureTourns;
