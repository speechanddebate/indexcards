import { db, massUpdate } from '../helpers/litedb.js';

const autoPublishResults = async () => {

	const publishMe = {
		primary   : [],
		feedback  : [],
		secondary : [],
	};

	// Publish to level 3 publication

	publishMe.primary = await db.sequelize.query(`
	    select round.id
			from round, event, tourn, event_setting autopublish, timeslot
		where 1=1
			and tourn.start < CURRENT_TIMESTAMP
			and tourn.id = event.tourn
			and event.id = autopublish.event
			and autopublish.tag = 'autopublish_results'
			and autopublish.value > 0
			and event.id = round.event
			and round.timeslot = timeslot.id
			and timeslot.start > (NOW() - INTERVAL 1 DAY)
			and timeslot.start < (NOW() + INTERVAL 1 DAY)
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
	`, { type : db.sequelize.QueryTypes.SELECT }
	);

	publishMe.feedback = await db.sequelize.query(`
		select round.id
            from round, event_setting autopublish, event, tourn, timeslot
        where 1=1
            and tourn.start < CURRENT_TIMESTAMP
            and tourn.id = event.tourn
            and event.id = autopublish.event
            and autopublish.tag = 'autopublish_results'
            and autopublish.value > 1
            and event.id = round.event
			and round.timeslot = timeslot.id
            and timeslot.start > (NOW() - INTERVAL 1 DAY)
            and timeslot.start < (NOW() + INTERVAL 1 DAY)
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
		type : db.sequelize.QueryTypes.SELECT,
	});

	publishMe.secondary = await db.sequelize.query(`
		select round.id
		from round, event_setting autopublish, event, tourn, timeslot
		where 1=1
			and tourn.start < CURRENT_TIMESTAMP
			and tourn.id          = event.tourn
			and event.id          = autopublish.event
			and autopublish.tag   = 'autopublish_results'
			and autopublish.value = '2'
			and event.id          = round.event
			and round.timeslot = timeslot.id
			and timeslot.start > (NOW() - INTERVAL 1 DAY)
			and timeslot.start < (NOW() + INTERVAL 1 DAY)
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
		type : db.sequelize.QueryTypes.SELECT,
	});

	if (publishMe.primary.length) {
		const query = `update round set round.post_primary = 3 where round.id IN (:keys)`;
		await massUpdate(query, publishMe.primary);
	}

	if (publishMe.secondary.length) {
		const query = `update round set round.post_secondary = 3 where round.id IN (:keys)`;
		await massUpdate(query, publishMe.secondary);
	}

	if (publishMe.feedback.length) {
		const query = `update round set round.post_feedback = 2 where round.id IN (:keys)`;
		await massUpdate(query, publishMe.feedback);
	}

	return `Autopublished ${JSON.stringify(publishMe.primary)} primary,
		${JSON.stringify(publishMe.secondary)} secondary,
		${JSON.stringify(publishMe.feedback)} feedback`;
};

const result = await autoPublishResults();
console.log(result);
process.exit();
