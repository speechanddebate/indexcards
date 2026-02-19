import db from '../data/db.js';
import { withSettingsInclude } from './utils/settings.js';
import { FIELD_MAP, toDomain } from './mappers/eventMapper.js';
import { resolveAttributesFromFields } from './utils/repoUtils.js';
import { roundInclude } from './roundRepo.js';

function buildEventQuery(opts = {}) {
	const query = {
		where: {},
		attributes: resolveAttributesFromFields(opts.fields, FIELD_MAP),
		include: [],
	};

	if(opts.include?.rounds){
		query.include.push({
			...roundInclude(opts.include.rounds),
			as: 'rounds',
		});
	}

	query.include.push(
		...withSettingsInclude({
			model: db.eventSetting,
			as: 'event_settings',
			settings: opts.settings,
		})
	);
	return query;
}

export function eventInclude(opts = {}) {
	return {
		model: db.event,
		as: 'events',
		...buildEventQuery(opts),
	};
}

/**
 *  One of palmers creations to get event invite data for a tournament
 * @param {*} tournId the tournament id to get event invites for
 * @returns You're just gonna have to look at the query
 */
export async function getEventInvites(tournId) {
	return await db.sequelize.query(`
            select
                event.id, event.abbr, event.name, event.fee, event.type,
                event.nsda_category nsdaCategory,
                nsda_category.name nsdaCategoryName,
                category.id categoryId, category.name categoryName, category.abbr categoryAbbr,
                judge_field_report.value judgeFieldReport,
                cap.value cap,
                school_cap.value schoolCap,
                topic.source topicSource, topic.event_type topicEventType, topic.tag topicTag,
                topic.topic_text topicText,
                field_report.value fieldReport,
                anonymous_public.value anonymousPublic,
                live_updates.value liveUpdates,
                description.value_text description,
                currency.value currency,
                count(entry.id) as entryCount

            from (event, category)

                left join entry on entry.event = event.id and entry.active = 1

                left join tourn_setting currency
                    on currency.tourn = event.tourn
                    and currency.tag = 'currency'

                left join nsda_category
                    on nsda_category.id = event.nsda_category

                left join event_setting cap
                    on cap.event = event.id
                    and cap.tag = 'cap'

                left join event_setting school_cap
                    on school_cap.event = event.id
                    and school_cap.tag = 'school_cap'

                left join category_setting judge_field_report
                    on judge_field_report.category = category.id
                    and judge_field_report.tag = 'field_report'

                left join event_setting field_report
                    on field_report.event = event.id
                    and field_report.tag = 'field_report'

                left join event_setting live_updates
                    on live_updates.event = event.id
                    and live_updates.tag = 'live_updates'

                left join event_setting anonymous_public
                    on anonymous_public.event = event.id
                    and anonymous_public.tag = 'anonymous_public'

                left join event_setting description
                    on description.event = event.id
                    and description.tag = 'description'

                left join event_setting topic_id
                    on topic_id.event = event.id
                    and topic_id.tag = 'topic'

                left join topic on topic.id = topic_id.value

            where 1=1
                and event.tourn = :tournId
                and event.type != 'attendee'
                and event.category = category.id
            group by event.id
        `, {
		replacements : { tournId },
		type         : db.sequelize.QueryTypes.SELECT,
	});
}

export function getEvent(eventId, opts = {}) {
	if (!eventId) throw new Error('getEvent: eventId is required');
	const query = buildEventQuery(opts);
	query.where = { id: eventId, ...query.where };
	return db.event.findOne(query).then(toDomain);
}

export async function getEvents(scope = {}, opts = {}){
	const query = buildEventQuery(opts);

	if(scope.tournId){
		query.where.tourn = scope.tournId;
	}
	const results = await db.event.findAll(query);
	return results.map(toDomain);
}

export default {
	getEvent,
	getEvents,
	getEventInvites,
};
