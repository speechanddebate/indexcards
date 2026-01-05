import { notify } from '../../helpers/blast.js';
import { debugLogger, errorLogger } from '../../helpers/logger.js';
import { sendPairingBlast, formatPairingBlast } from '../../helpers/pairing.js';
import { getPairingFollowers } from '../../helpers/followers.js';
import { UnexpectedError } from '../../helpers/problem.js';
import { blastRoundPairing } from '../tab/round/blast.js';

export async function blastMessage(req, res) {
	if (!req.body.text) {
		if (req.body.body) {
			req.body.text = req.body.body;
		} else if (!req.body.html) {
			debugLogger.info('No message to blast sent');
			debugLogger.info(req.body);
			return res.status(200).json({ error: true, message: 'No message to blast sent' });
		}
	}

	const notifyResponse = await notify({ ...req.body });

	if (notifyResponse.error) {
		errorLogger.error(notifyResponse.message);
		return UnexpectedError(req, res, notifyResponse);
	}

	return res.status(200).json({
		error   : false,
		message : notifyResponse.message,
	});
};

export async function blastPairing(req, res) {
	const queryData = {};
	queryData.replacements = { sectionId : req.params.sectionId };
	queryData.where = 'where section.id = :sectionId';
	queryData.fields = '';

	const blastData = await formatPairingBlast(queryData, req);

	if (!blastData) {
		return UnexpectedError(req, res, `No blast Data returned`);
	}
	const tourns = await req.db.sequelize.query(`
        select
            tourn.id, tourn.name, tourn.webname
        from (tourn, event, round, panel section)
        where section.id = :sectionId
            and section.round = round.id
            and round.event = event.id
            and event.tourn = tourn.id
    `, {
		replacements: { sectionId: req.params.sectionId },
		type: req.db.sequelize.QueryTypes.SELECT,
	});

	const tourn = tourns.shift();
	const seconds = Math.floor(Date.now() / 1000);
	const numberwang = seconds.toString().slice(-6);

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

	const reply = await sendPairingBlast(followers, blastData, req, res);
	res.status(200).json(reply);

};
export async function blastExtRoundPairing(req, res) {
	blastRoundPairing.POST(req, res);
};
