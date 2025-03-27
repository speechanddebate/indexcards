import { convertTZ, shortZone, getWeek, isSameDay } from '../../../helpers/dateTime.js';

export const futureTourns = {
	GET: async (req, res) => {

		const db = req.db;
		let limit = '';
		let endLimit = '';

		let timeScope = ' DATE(NOW() - INTERVAL 2 DAY)';

		const timeLimit = new Date();
		timeLimit.setDate(timeLimit.getDate() - 3);
		let thisWeek = getWeek(timeLimit);

		if (
			process.env.NODE_ENV === 'test'
			|| req.config.MODE === 'test'
		) {
			// the nine test suite tournaments are forever in the past.  This one
			// excludes the Nationals test but not the other eight others.
			timeScope = `'2023-08-01 00:00:00'`;
			thisWeek = 1;
		}

		if (typeof req.params.circuit === 'number') {
			limit = ` and exists (
				select tourn_circuit.id from tourn_circuit
				where tourn_circuit.tourn = tourn.id
				and tourn_circuit.approved = 1
				and tourn_circuit.circuit = ${req.params.circuit}
			) `;
		}

		if (typeof req.query.state === 'string' && req.query.state.length === 2) {
			limit = ` and tourn.state = '${req.query.state.toUpperCase()}'`;
		}

		if (typeof req.query.limit === 'number') {
			endLimit = ` limit ${req.query.limit} `;
			console.log(`Limiting to the top ${req.query.limit} tournaments`);
		}

		const [future] = await db.sequelize.query(`
			select
				CONCAT(tourn.id, '-', '0') as id,
				tourn.id tournId, tourn.webname, tourn.name, tourn.tz, tourn.hidden,
				tourn.city as location, tourn.state, tourn.country,
				CONVERT_TZ(tourn.start, '+00:00', tourn.tz) start,
				CONVERT_TZ(tourn.end, '+00:00', tourn.tz) end,
				CONVERT_TZ(tourn.reg_end, '+00:00', tourn.tz) reg_end,
				CONVERT_TZ(tourn.reg_start, '+00:00', tourn.tz) reg_start,
				msnats.value as msnats,
				nats.value as nats,
				closed.value as closed,
				count(distinct school.id) as schoolcount,
				YEAR(tourn.start) as year,
				WEEK(CONVERT_TZ(tourn.start, '+00:00', tourn.tz), 3) as week,
				GROUP_CONCAT(DISTINCT(event.abbr) SEPARATOR ', ') as events,
				GROUP_CONCAT(DISTINCT(event.type) SEPARATOR ', ') as eventTypes,
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

			from (tourn, event)

			left join tourn_setting closed
				on closed.tourn = tourn.id
				and closed.tag = 'closed_entry'

			left join tourn_setting msnats
				on msnats.tourn = tourn.id
				and msnats.tag = 'nsda_ms_nats'

			left join tourn_setting nats
				on nats.tourn = tourn.id
				and nats.tag = 'nsda_nats'

			left join school on tourn.id = school.tourn
		where 1=1
			and tourn.hidden = 0
			and tourn.end > ${timeScope}
			and tourn.id = event.tourn

			${limit}
			and not exists (
				select weekend.id
				from weekend
				where weekend.tourn = tourn.id
			)

			and exists (
				select timeslot.id
				from timeslot
				where 1=1
				and timeslot.tourn = tourn.id
				and timeslot.end > ${timeScope}
			)

			group by tourn.id
			order by tourn.end, schoolcount DESC
			${ endLimit }
		`);

		const [futureDistricts] = await db.sequelize.query(`
			select
				CONCAT(tourn.id, '-', weekend.id) as id,
				tourn.id tournId, tourn.webname, tourn.name, tourn.tz,
				weekend.id as districts,
				weekend.id weekendId, weekend.name weekendName, weekend.city as location, weekend.state, tourn.country,
				site.name site,
				CONVERT_TZ(weekend.start, '+00:00', tourn.tz) start,
				CONVERT_TZ(weekend.end, '+00:00', tourn.tz) end,
				CONVERT_TZ(weekend.reg_end, '+00:00', tourn.tz) reg_end,
				CONVERT_TZ(weekend.reg_start, '+00:00', tourn.tz) reg_start,
				count(distinct school.id) as schoolcount,
				YEAR(weekend.start) as year,
				WEEK(CONVERT_TZ(weekend.start, '+00:00', tourn.tz), 3) as week,
				GROUP_CONCAT(DISTINCT(event.abbr) SEPARATOR ', ') as events,
				GROUP_CONCAT(DISTINCT(event.type) SEPARATOR ', ') as eventTypes,
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

			from (tourn, weekend, event, event_setting ew)

			left join site on weekend.site = site.id
			left join school on tourn.id = school.tourn

			where tourn.hidden = 0
			and weekend.end > ${timeScope}
			and weekend.tourn = tourn.id

			and exists (
				select timeslot.id
				from timeslot
				where 1=1
				and timeslot.tourn = tourn.id
				and timeslot.end > ${timeScope}
			)

			and event.tourn = tourn.id
			and event.id = ew.event
			and ew.tag = 'weekend'
			and ew.value = weekend.id

			group by weekend.id
			order by weekend.start
			${ endLimit }
		`);

		future.push(...futureDistricts);

		const shortOptions = {
			month : 'numeric',
			day   : 'numeric',
		};

		const formattedFuture = future.map( (tourn) => {

			if (tourn.week < thisWeek) {
				tourn.week = thisWeek;
			}

			const sortweek = `${tourn.year}-${tourn.week.toString().padStart(2, '0')}-${tourn.schoolcount.toString().padStart(9, '0')}`;
			const sortnumeric = parseInt(`${tourn.year}${tourn.week.toString().padStart(2, '0')}${9999999 - tourn.schoolcount}`);

			let dates = '';
			const tournStart = convertTZ(tourn.start, tourn.tz);
			const tournEnd = convertTZ(tourn.end, tourn.tz);
			const tzCode = shortZone(tourn.tz);

			if (isSameDay(tournStart, tournEnd)) {
				dates = tournStart.toLocaleDateString('en-US', shortOptions);
			} else {
				dates = tournStart.toLocaleDateString('en-US', shortOptions);
				dates += '-';
				dates += tournEnd.toLocaleDateString('en-US', shortOptions);
			}

			return {
				...tourn,
				sortweek,
				sortnumeric,
				dates,
				tzCode,
			};
		});

		formattedFuture.sort( (a, b) => {
			return a.sortnumeric - b.sortnumeric;
		});

		// I have to do this separately because I pull the Districts weekends
		// as separate things from individual tournaments.

		if (req.query.limit > 0) {
			if (future.length > req.query.limit) {
				future.length = req.query.limit;
			}
		} else if (future.length > 256) {
			future.length = 256;
		}

		return res.status(200).json(formattedFuture);
	},
};

futureTourns.GET.apiDoc = {
	summary     : 'Returns the public listing of upcoming tournaments',
	operationId : 'futureTourns',
	parameters  : [
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
