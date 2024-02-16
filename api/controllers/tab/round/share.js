// Integrate with share.tabroom.com rooms.
import { randomPhrase } from '@speechanddebate/nsda-js-utils';
import { getFollowers } from '../../../helpers/followers.js';
import { emailBlast } from '../../../helpers/mail.js';
import { db } from '../../../helpers/litedb.js';

export const makeShareRooms = {
	POST: async (req, res) => {
		const counter = await shareRooms(req.params.roundId);
		return res.status(201).json({ message: `Successfully sent speech doc emails to ${counter} recipients` });
	},
};

export default makeShareRooms;

// Direct functional export because this also is called by cron.

export const shareRooms = async (roundId) => {

	const sections = await db.sequelize.query(`
		select
			distinct panel.id id, panel.letter letter,
			tourn.name tournName, round.label roundLabel, round.name roundName
		from (panel, round, event, tourn)
		where panel.round = :roundId
			and panel.bye = 0
			and NOT EXISTS (
				select ps.id
				from panel_setting ps
				where ps.tag = 'share'
				and ps.panel = panel.id
			)
			and panel.round = round.id
			and round.event = event.id
			and event.tourn = tourn.id
	`, {
		replacements: { roundId },
		type: db.Sequelize.QueryTypes.SELECT,
	});

	const emailPromises = [];
	let counter = 0;

	sections.forEach(async (section) => {
		const phrase = randomPhrase();
		await db.sequelize.query(`
			insert into panel_setting (panel, tag, value)
			values (:sectionId, 'share', :phrase)
			on duplicate key update
			value = :phrase
		`, {
			replacements: { sectionId: section.id, phrase },
			type: db.Sequelize.QueryTypes.INSERT,
		});

		const email = await getFollowers({
			panelId        : section.id,
			noFollowers    : true,
			panelFollowers : true,
			returnEmails   : true,
		});

		let messageText = `Share speech documents for this round (10mb limit, docs only) by replying to`;
		messageText += ` this email with a file attachment, or going to https://share.tabroom.com/${phrase} \n`;

		let messageHTML = `<p>Share speech documents for this round (10mb limit, docs only) by replying to`;
		messageHTML += ` this email with a file attachment, or going to `;
		messageHTML += `<a href="https://share.tabroom.com/${phrase}">https://share.tabroom.com/${phrase}</a></p>`;

		const messageData = {
			to      : `${phrase}@share.tabroom.com`,
			subject : `${section.tournName} ${section.roundLabel || `Round ${section.roundName}`} (${phrase}) - Speech Documents`,
			text    : messageText,
			html    : messageHTML,
			share   : true,
			email,
		};

		if (messageData.email.length > 0) {
			const dispatch = emailBlast(messageData);
			counter += email.length;
			emailPromises.push(dispatch.result);
		}
	});

	await Promise.all(emailPromises);
	return counter;
};
