import db from '../data/db.js';
import { FIELD_MAP,toDomain, toPersistence } from './mappers/sectionMapper.js';
import { resolveAttributesFromFields } from './utils/repoUtils.js';
import { ballotInclude } from './ballotRepo.js';
import { roundInclude } from './roundRepo.js';
import { withSettingsInclude } from './utils/settings.js';

function buildSectionQuery(opts = {}){
	const query  = {
		where: {},
		attributes: resolveAttributesFromFields(opts.fields,FIELD_MAP),
		include: [],
	};

	if(opts.include?.Ballots){
		query.include.push({
			...ballotInclude(opts.include.Ballots),
			as: 'ballots',
			required: false,
		});
	}
	if(opts.include?.Round) {
		query.include.push({
			...roundInclude(opts.include.Round),
			as: 'round_round',
			required: opts.include.Round.required ?? false,
		});
	}
	query.include.push(
		...withSettingsInclude({
			model: db.panelSetting,
			as: 'panel_settings',
			settings: opts.settings,
		})
	);

	return query;
}

export function sectionInclude(opts = {}){
	return {
		model: db.panel,
		as: 'panels',
		...buildSectionQuery(opts),
	};
}

async function getSection(id, opts = {}){
	if (!id) throw new Error('getSection: id is required');
	const query = buildSectionQuery(opts);
	query.where.id = id;
	const section = await db.panel.findOne(query);
	return toDomain(section);
}

async function getSections(scope = {}, opts = {}) {
	const query = buildSectionQuery(opts);
	if (scope?.roundId) {
		query.where = { ...query.where, round: scope.roundId };
	}
	const sections = await db.panel.findAll(query);
	return sections.map(toDomain);
}

async function createSection(data){
	const section = await db.panel.create(toPersistence(data));
	return section.id;
}

async function updateSection(id, data){
	if (!id) throw new Error('updateSection: id is required');
	const [rows] = await db.panel.update(toPersistence(data), { where: { id } });
	return rows > 0;
}

async function deleteSection(id){
	if (!id) throw new Error('deleteSection: id is required');
	const rows = await db.panel.destroy({ where: { id } });
	return rows > 0;

}

export default {
	getSection,
	getSections,
	updateSection,
	createSection,
	deleteSection,
};
