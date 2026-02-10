// repos/mappers/scoreMapper.js
import { toDomain as genericToDomain, toPersistence as genericToPersistence, toBool, fromBool } from './mapperUtils.js';
import { toDomain as scoreToDomain } from './scoreMapper.js';
import { toDomain as judgeToDomain } from './judgeMapper.js';
import { toDomain as sectionToDomain } from './sectionMapper.js';

export const FIELD_MAP = {
	id: 'id',
	side: 'side',
	speakerOrder: 'speaker_order',
	seat: 'seat',
	chair: { db: 'chair', fromDb: toBool, toDb: fromBool },
	bye: { db: 'bye', fromDb: toBool, toDb: fromBool },
	forfeit: { db: 'forfeit', fromDb: toBool, toDb: fromBool },
	tv: { db: 'tv', fromDb: toBool, toDb: fromBool },
	audit: { db: 'audit', fromDb: toBool, toDb: fromBool },
	approvedId: 'approved',
	judgeStarted: 'judge_started',
	startedById: 'started_by',
	enteredById: 'entered_by',
	auditedById: 'audited_by',
	judgeId: 'judge',
	sectionId: 'panel',
	entryId: 'entry',
	updatedAt: { db: 'timestamp', toDb: () => undefined },
	createdAt: { db: 'created_at', toDb: () => undefined },
};

export const toDomain = dbRow => {
	if(!dbRow) return null;
	const domain = genericToDomain(dbRow, FIELD_MAP);

	if(dbRow.scores){
		domain.scores = dbRow.scores.map(scoreToDomain);
	}
	if(dbRow.judge_judge){
		domain.judge = judgeToDomain(dbRow.judge_judge);
	}
	if(dbRow.panel_panel){
		domain.section = sectionToDomain(dbRow.panel_panel);
	}
	return domain;
};
export const toPersistence = domainObj => genericToPersistence(domainObj, FIELD_MAP);

export default {
	toDomain,
	toPersistence,
	FIELD_MAP,
};