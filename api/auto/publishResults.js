import db from '../helpers/litedb.js';

const autoPublishResults = async () => {

	await db.sequelize.query(`
		update round, event_setting autopublish, event, tourn
			set round.post_primary = 3
		where round.event = autopublish.event
			and autopublish.event = event.id
			and event.tourn = tourn.id
			and tourn.start < CURRENT_TIMESTAMP
			and tourn.end > (NOW() + INTERVAL 1 DAY)
			and autopublish.tag = 'autopublish_results'
			and autopublish.value > 0
			and round.start_time > (NOW() - INTERVAL 1 DAY)
			and (round.post_primary != 3 OR round.post_primary IS NULL)

        and (
            select COUNT(b1.id)
            from ballot b1, panel p1
            where p1.round = round.id
            and p1.id = b1.panel
            and p1.bye = 0
            and b1.bye = 0
            and b1.forfeit = 0
            and b1.audit = 0
        ) = 0

		and exists (
			select b2.id
				from ballot b2, panel
			where b2.panel = panel.id
				and panel.round = round.id
		)

		and exists (
			select b3.entry
				from ballot b3, panel, round r2
			where r2.event = round.event
				and r2.name = (round.name + 1)
				and r2.id = panel.round
				and panel.id = b3.panel
		)
	`, {
		type : db.sequelize.QueryTypes.UPDATE,
	});

	await db.sequelize.query(`
		update round, event_setting autopublish, event, tourn
			set round.post_feedback = 2
		where round.event = autopublish.event
			and autopublish.event = event.id
			and event.tourn = tourn.id
			and tourn.start < CURRENT_TIMESTAMP
			and tourn.end > (NOW() + INTERVAL 1 DAY)
			and autopublish.tag = 'autopublish_results'
			and autopublish.value > 1
			and round.start_time > (NOW() - INTERVAL 1 DAY)
			and (round.post_feedback != 2 OR round.post_feedback IS NULL)

        and (
            select COUNT(b1.id)
            from ballot b1, panel p1
            where p1.round = round.id
            and p1.id = b1.panel
            and p1.bye = 0
            and b1.bye = 0
            and b1.forfeit = 0
            and b1.audit = 0
        ) = 0

		and exists (
			select ballot.entry
				from ballot, panel, round r2
			where r2.event = round.event
				and r2.name = (round.name + 1)
				and r2.id = panel.round
				and panel.id = ballot.panel
		)
	`, {
		type : db.sequelize.QueryTypes.UPDATE,
	});

	await db.sequelize.query(`
		update round, event_setting autopublish, event, tourn
			set round.post_secondary = 3
		where round.event = autopublish.event
			and autopublish.event = event.id
			and event.tourn = tourn.id
			and tourn.start < CURRENT_TIMESTAMP
			and tourn.end > (NOW() + INTERVAL 1 DAY)
			and autopublish.tag = 'autopublish_results'
			and autopublish.value  = '2'
			and round.start_time > (NOW() - INTERVAL 1 DAY)
			and (round.post_secondary != 3 OR round.post_secondary IS NULL)

        and (
            select COUNT(b1.id)
            from ballot b1, panel p1
            where p1.round = round.id
            and p1.id = b1.panel
            and p1.bye = 0
            and b1.bye = 0
            and b1.forfeit = 0
            and b1.audit = 0
        ) = 0

		and exists (
			select ballot.entry
				from ballot, panel, round r2
			where r2.event = round.event
				and r2.name = (round.name + 1)
				and r2.id = panel.round
				and panel.id = ballot.panel
		)
	`, {
		type : db.sequelize.QueryTypes.UPDATE,
	});

	return 'All autopublish rounds done';
};

await autoPublishResults();
process.exit();
