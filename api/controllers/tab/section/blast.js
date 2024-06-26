/* eslint-disable no-useless-escape */
import { getFollowers, getPairingFollowers } from '../../../helpers/followers.js';
import { errorLogger } from '../../../helpers/logger.js';
import { notify } from '../../../helpers/blast.js';
import { sendPairingBlast, formatPairingBlast } from '../../../helpers/pairing.js';

export const blastSectionMessage = {
	POST: async (req, res) => {
		if (!req.body.message) {
			return res.status(200).json({
				error   : true,
				message : 'No message to blast sent',
			});
		}

		await req.db.summon(req.db.section, req.params.sectionId);
		const tourn = await req.db.summon(req.db.tourn, req.params.tournId);

		const personIds = await getFollowers(
			{ sectionId : req.params.sectionId },
			req.body
		);

		const seconds = Math.floor(Date.now() / 1000);
		const numberwang = seconds.toString().substring(-5);

		const from = `${tourn.name} <${tourn.webname}_${numberwang}@www.tabroom.com>`;
		const fromAddress = `<${tourn.webname}_${numberwang}@www.tabroom.com>`;

		const notifyResponse = await notify({
			ids         : personIds,
			text        : req.body.message,
			from,
			fromAddress,
		});

		if (notifyResponse.error) {
			errorLogger.error(notifyResponse.message);
			return res.status(200).json(notifyResponse);
		}

		await req.db.changeLog.create({
			tag         : 'blast',
			description : `${req.body.message} sent to ${notifyResponse.push?.count || 0} web and ${notifyResponse.email?.count || 0} email recipients `,
			person      : req.session.person,
			count       : notifyResponse.push?.count || 0,
			panel       : req.params.sectionId,
		});

		return res.status(200).json({
			error   : false,
			message : notifyResponse.message,
		});
	},
};

// Blast a single section with a pairing
export const blastSectionPairing = {
	POST: async (req, res) => {

		const queryData = {};
		queryData.replacements = { sectionId : req.params.sectionId };
		queryData.where = 'where section.id = :sectionId';
		queryData.fields = '';

		const blastData = await formatPairingBlast(queryData, req);
		const tourn = await req.db.summon(req.db.tourn, req.params.tournId);

		const seconds = Math.floor(Date.now() / 1000);
		const numberwang = seconds.toString().substring(-5);

		blastData.from = `${tourn.name} <${tourn.webname}_${numberwang}@www.tabroom.com>`;
		blastData.fromAddress = `<${tourn.webname}_${numberwang}@www.tabroom.com>`;

		const followers = await getPairingFollowers(
			queryData.replacements,
			{ ...req.body },
		);

		if (req.body.append) {
			blastData.append = req.body.append;
		}

		blastData.tourn = tourn.id;
		const response = await sendPairingBlast(followers, blastData, req, res);

		await req.db.changeLog.create({
			tag         : 'blast',
			description : `Pairing individually sent to section : ${response.message} `,
			person      : req.session.person,
			tourn       : req.params.tournId,
			panel       : req.params.sectionId,
		});

		return res.status(200).json({
			error   : false,
			message : response.message,
		});
	},
};

export default blastSectionMessage;
