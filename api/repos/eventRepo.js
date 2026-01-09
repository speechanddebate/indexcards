import db from '../data/db.js';
import { baseRepo } from './baseRepo.js';

/**
 *  One of palmers creations to get event invite data for a tournament
 * @param {*} tournId the tournament id to get event invites for
 * @returns You're just gonna have to look at the query
 */
export async function getEventInvites(tournId) {
	return await db.sequelize.query(`
            select
                event.id, event.abbr, event.name, event.fee, event.type,
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
                count(entry.id) as entryCount,
                nsda_event_category.value nsdaCode,
                nsda_category.name nsdaName
    
            from (event, category)
    
                left join entry on entry.event = event.id and entry.active = 1
    
                left join tourn_setting currency
                    on currency.tourn = event.tourn
                    and currency.tag = 'currency'
    
                left join event_setting nsda_event_category
                    on nsda_event_category.tag = 'nsda_event_category'
                    and nsda_event_category.event = event.id
    
                left join nsda_category
                    on nsda_category.code = nsda_event_category.value
    
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
/**
 *
 * @param {*} tournId
 * @returns A list of events associated with a tournament
 */
export async function getEvents(tournId) {
	//ripped straight from the old /tourn/:tournId/events route. may need adjustments to make generic
	// the big adjustment being removing the tourn.hidden = 0 check as the caller should handle that
	const events = await db.sequelize.query(`
        select
            event.id, event.abbr, event.name, event.fee, event.type,
            cap.value cap,
            school_cap.value school_cap,
            topic.source topic_source, topic.event_type topic_event_type, topic.tag topic_tag,
            topic.topic_text topic_text,
            field_report.value field_report,
            description.value_text description

        from (event)

            left join event_setting cap
                on cap.event = event.id
                and cap.tag = 'cap'

            left join event_setting school_cap
                on school_cap.event = event.id
                and school_cap.tag = 'school_cap'

            left join event_setting field_report
                on field_report.event = event.id
                and field_report.tag = 'field_report'

            left join event_setting description
                on description.event = event.id
                and description.tag = 'description'

            left join event_setting topic_id
                on topic_id.event = event.id
                and topic_id.tag = 'topic'

            left join topic on topic.id = topic_id.value

        where 1=1
            and event.type != 'attendee'
            and event.tourn = :tournId
    `, {
		replacements : { tournId },
		type         : db.sequelize.QueryTypes.SELECT,
	});
	return events;
};
function mapEvent(eventInstance) {
	if (!eventInstance) return null;
	return {

	};
}

export default {
	...baseRepo(db.event, mapEvent),
	getEvents,
	getEventInvites,
};