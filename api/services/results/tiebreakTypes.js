// Translation of the tb_types.mas from legacy.  When given the ID of a round,
// this service delivers all of the various tiebreaker type that round's
// tiebreakers require to figure, telling us what to ask for on ballots etc.

// TODO: this one is going to need some pretty extensive testing because it's a
// big ol' logic bomb in the middle of tabroom for a bunch of functions.

import db from '../../data/db.js';
import { getRound } from '../../repos/roundRepo.js';
import { getProtocol } from '../../repos/protocolRepo.js';

export const tiebreakTypes = async ({roundId, protocolId = false}) => {

	const round = await getRound(
		roundId, {
			include: {
				Event:  {},
				Protocol:  {},
			},
		}
	);

	if ( ['highlow', 'highhigh', 'snaked_prelim'].includes(round.type)) {
		round.type = 'prelim';
	}

	const eventDetails = await db.sequelize.query(`
		select
			event.id, event.type, event.nsda_category,
			(
				select es.value
				from event_setting es
				where es.event = event.id
				and es.tag = 'wsdc_ballot'
			) wsdc,
			(
				select rs.value
				from round_setting rs
				where rs.round = round.id
				and rs.tag = 'leadership_protocol'
			) as roundLeadership,
			es.tag protocolType, es.value protocolId

		from (event, round)
			left join event_setting es
				on es.event = event.id
				and es.tag IN (
					'leadership_protocol',
					'final_bowl_protocol',
					'po_protocol',
					'speaker_protocol',
					'leadership_protocol'
				)
		where 1=1
			and round.id = :roundId
			and round.event = event.id
	`, {
		replacements: {roundId},
		type: db.Sequelize.QueryTypes.SELECT,
	});

	let protocols = [];

	if (protocolId) {

		const specifiedProtocol = await getProtocol(protocolId);
		protocols = [specifiedProtocol];

	} else {

		protocols = [round.Protocol];
		let roundLeadDone = false;

		for (const event of eventDetails) {

			if (!round.Event) {
				round.Event = {
					id       : event.id,
					type     : event.wsdc ? 'wsdc' : event.type,
					category : event.nsda_category,
				};
			};

			if (round.roundLeadership &! roundLeadDone) {
				const roundProtocol = await getProtocol(event.roundLeadership);
				protocols.push(roundProtocol);
			}

			if (
				event.protocolId
				&& (event.protocolType !== 'speaker_protocol' || round.type === 'prelim')
			) {
				const specialProtocol = await getProtocol(event.protocolId);
				protocols.push(specialProtocol);
			}
		};
	}

	const counted = {};

	for (const protocol of protocols) {

		for (const tiebreak of protocol.Tiebreaks) {

			if (
				tiebreak.count !== 'all'
				&& tiebreak.count !== 'previous'
				&& tiebreak.count !== round.type
				&! (tiebreak.count === 'specific' && tiebreak.count_round === round.name)
			) {
				continue;
			};

			if (['ranks',
				'reciprocals',
				'opp_ranks',
				'chair_ranks',
				'non_chair_ranks',
				'downs',
				'preponderance',
				'judgepref',
			].includes(tiebreak.name)
			) {
				counted.rank = true;
			}

			if (['entry_vote_one', 'entry_vote_all'].includes(tiebreak.name)) {
				counted.entryWinloss = true;
			}

			if (['student_rank', 'student_recip'].includes(tiebreak.name)) {
				counted.entryRank = true;
			}

			if (['best_po'].includes(tiebreak.name)) {
				counted.bestPO = true;
			}

			if (['opp_wins', 'opp_ballots', 'winloss', 'ballots', 'losses', 'headtohead'].includes(tiebreak.name)) {
				counted.winloss = true;
			}

			if (['points',
				'opp_points',
				'po_points',
				'three_way_point',
				'judgevar',
				'judgevar2',
				'refute',
			].includes(tiebreak.name)) {
				counted.point = true;

				if (round.Event.type === 'wsdc') {
					counted.refute = true;
				}
			}
		}
	}
	return counted;
};
