import { getFollowers } from '../../../helpers/followers.js';
import { emailBlast } from '../../../helpers/mail.js';
import { BadRequest, NotFound } from '../../../helpers/problem.js';
import { makeShareRooms } from  '../../tab/round/share.js';

export async function sendShareFile(req, res) {
	const roomNames = req.body?.panels?.map((room) => room.toLowerCase());

	const sections = await req.db.sequelize.query(`
        select
            panel.id sectionId, panel.letter sectionLetter,
            round.id roundId, round.name roundName, round.label roundLabel,
            tourn.id tournId, tourn.name tournName,
            room.name room, share.value phrase
            from (round, event, tourn, panel, panel_setting share)
                left join room on room.id = panel.room
        where LOWER(share.value) IN (:roomNames)
            and share.tag = 'share'
            and share.panel = panel.id
            and panel.round = round.id
            and round.event = event.id
            and event.tourn = tourn.id
            and tourn.start < NOW()
            and tourn.end > NOW()
    `, {
		replacements: { roomNames },
		type: req.db.Sequelize.QueryTypes.SELECT,
	});

	if (!sections || sections.length < 1) {
		return NotFound(req, res, `No section found for codenames ${req.body.panels}`);
	}

	let counter = 0;
	const emailPromises = [];

	for (const section of sections) {

		const email = await getFollowers({
			sectionId        : section.sectionId,
			noFollowers      : true,
			sectionFollowers : true,
			returnEmails     : true,
		});

		if (!email || email.length < 1) {
			return false;
		}

		let messageText = `Share speech documents for this round (10mb limit, docs only) by replying to`;
		messageText += ` this email with a file attachment, or going to https://share.tabroom.com/${section.phrase} \n`;

		let messageHTML = `<p>Share speech documents for this round (10mb limit, docs only) by replying to`;
		messageHTML += ` this email with a file attachment, or going to `;
		messageHTML += `<a href="https://share.tabroom.com/${section.phrase}">https://share.tabroom.com/${section.phrase}</a></p>`;

		const messageData = {
			to      : `noreply@share.tabroom.com`,
			from    : `Tabroom Share <share@share.tabroom.com>`,
			replyTo : `${section.phrase}@share.tabroom.com`,
			subject : `${section.tournName} ${section.roundLabel || `Round ${section.roundName}`} (${section.phrase}) - Speech Documents`,
			text    : messageText,
			html    : messageHTML,
			share   : true,
			email,
			attachments : req.body.files || [],
		};

		if (messageData.email.length > 0) {
			const dispatch = emailBlast(messageData);
			counter += email.length;
			emailPromises.push(dispatch.result);
		}
	}

	if (emailPromises.length < 1) {
		return BadRequest(req, res, 'No emails found, nothing to send');
	}

	await Promise.all(emailPromises);
	return res.status(201).json({ message: `Successfully sent speech doc emails to ${counter} recipients` });
};

export async function makeExtShareRooms(req, res) {
// Glue code to hook into one source of truth for this function.
// This hook will eventually go away because this is just an
// authentication bridge from legacy Tabroom into the API. This
	// approach is dumb and hacky but there isn't exactly a correct
	// best practice way to integrate an express/node API with a
	// friggin Perl/Mason application so I'm just winging it.

	req.params = { roundId: req.body.roundId };
	makeShareRooms.POST(req, res);
};

