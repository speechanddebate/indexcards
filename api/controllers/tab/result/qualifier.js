export const circuitQualifiers = {
	POST: async (req, res) => {
		const db = req.db;

		let events = [];

		if (req.body.name === 'qualifying_target') {
			const event = await db.event.findByPk(req.body.property_value);
			events.push(event);
		} else {
			events = await db.event.findAll(
				{ where: { tourn: req.params.tournId } }
			);
		}

		let msg = '';

		for (const event of events) {
			if (req.body.eventId && req.body.eventId !== event.id) {
				return;
			}
			const eventSave = await saveEventResult(req.db, event.id);
			console.log(`Event Save is ${JSON.stringify(eventSave, null, 2)}` );
			if (typeof eventSave === 'string') {
				msg += eventSave;
			}
		}

		if (msg) {
			res.status(200).json({
				error   : true,
				message : `Tournament qualifying data posted for ${events.length} events.  ${msg}`,
			});
		} else {
			res.status(200).json({
				error   : false,
				message : `Tournament qualifying data posted for ${events.length} events.`,
				refresh : true,
			});
		}
	},
};

export const saveEventResult = async (db, eventId) => {

	// Get event and qualifier event tags

	const eventQuery = `
		select
			tourn.id tournId,
			event.id, event.abbr, event.type,
				tc.circuit, circuit.abbr circuitAbbr,
				ruleset.value rulesetId,
				qual_event.value eventCode,
				count(distinct entry.id) entryCount,
				count(distinct entry.school) schoolCount,
				cr.value_text circuitRules

		from (event, tourn, tourn_circuit tc, circuit_setting cr)

			left join circuit on circuit.id = tc.circuit

			left join event_setting ruleset
				on ruleset.event = event.id
				and ruleset.tag = CONCAT('qualifier_', tc.circuit)

			left join event_setting qual_event
				on qual_event.event = event.id
				and qual_event.tag = CONCAT('qualifier_event_', tc.circuit)

			left join entry
				on entry.event = event.id
				and exists (
					select ballot.id
						from ballot, panel
					where ballot.entry = entry.id
						and ballot.bye != 1
						and ballot.forfeit != 1
						and ballot.panel = panel.id
						and panel.bye != 1
				)
		where event.id = :eventId
			and event.tourn = tourn.id
			and tourn.id = tc.tourn
			and tc.circuit = cr.circuit
			and cr.tag = 'qualifiers'
			and cr.value = 'json'
		group by event.id, tc.circuit
	`;

	const eventsWithQualifiers = await db.sequelize.query(eventQuery, {
		replacements: { eventId },
		type: db.sequelize.QueryTypes.SELECT,
	});

	let message = '';

	eventsWithQualifiers.forEach( async (event) => {

		const allRules = JSON.parse(event.circuitRules);
		const eventRules = allRules[event.rulesetId];

		if (!eventRules || !eventRules.rulesets) {
			return;
		}

		// Choose the correct rule subset based on the size of the entry
		// field or school count

		const margins = {
			entries: 0,
			schools: 0,
		};

		let qualRuleSet = {};

		for (const rulesetTag of  Object.keys(eventRules.rulesets)) {

			const ruleset = eventRules.rulesets[rulesetTag];

			// I'm not over the entry threshold
			if (event.entryCount < ruleset.entries) {
				continue;
			}

			// I'm not over the school threshold
			if (event.schoolCount < ruleset.schools) {
				continue;
			}

			// I'm over a different, higher threshold already
			if (qualRuleSet && Object.keys(qualRuleSet).length > 0) {
				if ( ruleset.schools > 0 && (event.schoolCount - ruleset.schools) > margins.schools) {
					continue;
				}

				if ( ruleset.entries > 0 && (event.entryCount - ruleset.entries) > margins.entries) {
					continue;
				}
			}

			qualRuleSet = ruleset;

			if (ruleset.schools > 0) {
				margins.schools = parseInt(event.schoolCount) - parseInt(ruleset.schools);
			}

			if (ruleset.entries > 0) {
				margins.entries = event.entryCount - ruleset.entries;
			}
		}

		if (!qualRuleSet || Object.keys(qualRuleSet).length < 1) {
			message = `Event ${event.abbr} had ${event.entryCount} entries compete `;
			message += ` from ${event.schoolCount} schools, `;
			message += ` which did not meet the threshold for qualifications.`;
			return;
		}

		// Create results set, wiping out any existing ones, for this event & circuit.
		await db.resultSet.destroy({
			where: {
				event   : eventId,
				circuit : event.circuit,
			},
		});

		const newResultSet = await db.resultSet.create({
			circuit   : event.circuit,
			event     : eventId,
			tourn     : event.tournId,
			tag       : 'entry',
			label     : `${event.circuitAbbr} Qualification`,
			code      : event.eventCode,
			generated : new Date(),
		});

		console.log(`I am here 5!`);

		// Get final results set for the rankings

		const finalResultQuery = `
			select
				result.entry, result.rank
			from result, result_set
			where result_set.event = :eventId
				and result_set.label = 'Final Places'
				and result_set.id = result.result_set
				and exists (
					select cc.id
						from chapter_circuit cc, school, entry
					where entry.id = result.entry
						and entry.school = school.id
						and school.chapter = cc.chapter
						and cc.circuit = :circuitId
				)
			group by result.entry
			order by result.rank
		`;

		const finalResults = await db.sequelize.query(finalResultQuery, {
			replacements: { eventId, circuitId: event.circuit },
			type: db.sequelize.QueryTypes.SELECT,
		});

		console.log(`I am here 6! Final results length is ${finalResults.length}`);

		if (finalResults.length < 1) {
			return;
		}

		const entryByRank = {};
		for (const result of finalResults) {
			if (!entryByRank[result.rank]) {
				entryByRank[result.rank] = [];
			}
			entryByRank[result.rank].push(result.entry);
		}

		// Get last round participated data
		//
		console.log(`I am here 7!`);

		const lastRoundQuery = `
			select entry.id entry, max(round.name) roundname
				from entry, ballot, panel, round
			where entry.event = :eventId
				and entry.id = ballot.entry
				and ballot.panel = panel.id
				and panel.round = round.id
				and round.event = :eventId
				and exists (
					select cc.id
						from chapter_circuit cc, school
					where school.id = entry.school
						and school.chapter = cc.chapter
						and cc.circuit = :circuitId
				)
			group by entry.id
		`;

		const lastRound = await db.sequelize.query(lastRoundQuery, {
			replacements: { eventId, circuitId: event.circuit },
			type: db.sequelize.QueryTypes.SELECT,
		});

		if (lastRound.length < 1) {
			return;
		}

		console.log(`I am here 8!`);

		const entriesByLastRound = {};

		for (const entryRound of lastRound) {

			if (!entriesByLastRound[entryRound.roundname]) {
				entriesByLastRound[entryRound.roundname] = [];
			}

			entriesByLastRound[entryRound.roundname].push(entryRound.entry);
		}

		const allElims = await db.sequelize.query(`
			select round.name, round.label
				from round
			where round.event = :eventId
				and round.type IN ('elim', 'final')
			ORDER BY round.name DESC
		`, {
			replacements: { eventId },
			type: db.sequelize.QueryTypes.SELECT,
		});

		const entryPoints = {};
		const entryPlace = {};

		for (const key of Object.keys(qualRuleSet.rules)) {
			const rule = qualRuleSet.rules[key];

			// Award points for the final result placements and save
			if (rule.placement > 0 && entryByRank[rule.placement]) {
				for (const entry of entryByRank[rule.placement]) {
					entryPoints[entry] = rule.points;
					entryPlace[entry] = `Placed ${rule.placement}`;
					entryPlace[entry] = entryPlace[entry].substring(0, 15);
				}
			}

			// Award points for the last elimination placed unless a rank
			// placement supercedes it

			if (rule.reverse_elim > 0) {

				const targetRound = allElims[(rule.reverse_elim - 1)];

				if (targetRound && entriesByLastRound[targetRound?.name]) {

					for (const entry of entriesByLastRound[targetRound.name]) {
						if (entry && !entryPoints[entry]) {
							entryPoints[entry] = rule.points;
							entryPlace[entry] = `In ${targetRound.label ? targetRound.label : `round ${targetRound.name}`} `;
							entryPlace[entry] = entryPlace[entry].substring(0, 15);
						}
					}
				}
			}
		}

		console.log(`I am here 9!`);

		if (eventRules.individuals) {

			const entryStudentsQuery = `
				select
					entry.id entry, student.id student
				from entry, entry_student es, student, score, ballot
				where entry.event = :eventId
					and entry.id = es.entry
					and es.student = student.id
					and student.id = score.student
					and score.tag = 'point'
					and score.ballot = ballot.id
					and ballot.entry = entry.id
				group by student.id
			`;

			const entryStudent = await db.sequelize.query(entryStudentsQuery, {
				replacements: { eventId },
				type: db.sequelize.QueryTypes.SELECT,
			});

			const thresholdUnmet = {};

			if (eventRules.min_percent) {
				const prelimsQuery = `
					select count (distinct round.id) as prelimCount
						from round
					where round.event = :eventId
						and round.type NOT IN ('elim', 'final', 'runoff')`;

				const numPrelims = await db.sequelize.query(prelimsQuery, {
					replacements: { eventId },
					type: db.sequelize.QueryTypes.SELECT,
				});

				const roundCount = parseInt(numPrelims[0].prelimCount);
				eventRules.min_percent = parseInt(eventRules.min_percent);
				const threshold = Math.floor(roundCount * parseFloat((eventRules.min_percent / 100)));

				const spokeCountQuery = `
					select
						student.id student, count(distinct panel.id) speechCount
					from student, entry_student es, entry, score, ballot, panel, round
					where entry.event = :eventId
						and entry.id = ballot.entry
						and entry.id = es.entry
						and es.student = student.id
						and student.id = score.student
						and score.tag = 'point'
						and score.ballot = ballot.id
						and ballot.panel = panel.id
						and panel.round = round.id
						and round.type NOT IN ('elim', 'final', 'runoff')
					group by student.id
				`;

				const spokeCounts = await db.sequelize.query(spokeCountQuery, {
					replacements: { eventId },
					type: db.sequelize.QueryTypes.SELECT,
				});

				for (const spoke of spokeCounts) {
					if (spoke.speechCount < threshold) {
						thresholdUnmet[spoke.student] = true;
					}
				}
			}

			const entryStudents = {};

			for (const es of entryStudent) {

				if (!thresholdUnmet[es.student]) {
					if (!entryStudents[es.entry]) {
						entryStudents[es.entry] = [];
					}

					entryStudents[es.entry].push(es.student);
				}
			}

			// Save the award points for entries
			Object.keys(entryPoints).forEach( async (entry) => {
				entryStudents[entry].forEach( async (student) => {
					await db.result.create({
						result_set : newResultSet.id,
						rank       : entryPoints[entry],
						place      : entryPlace[entry],
						student,
						entry,
					});
				});
			});

		} else {

			// Save the award points for entries
			Object.keys(entryPoints).forEach( async (entry) => {
				await db.result.create({
					result_set : newResultSet.id,
					rank       : entryPoints[entry],
					place      : entryPlace[entry],
					entry,
				});
			});
		}
	});

	return message;
};

export default circuitQualifiers;
