import db from '../api/helpers/litedb.js';
import config from '../config/config.js';

const pruneDatabase = async () => {

	const keeperTourns = [
		26661, // NSDA Nationals
		31059, // NCFL Grand Nationals
		30661, // Mock Trial Nationals
		27074, // Cal Berkeley
		29774, // Texas Open
		29595, // CHSSA State (composite ranks)
		30371, // Dartmouth Round Robin (includes bye)
		29714, // New England District (single elimination)
		29807, // Rushmore District (double elimination)
		24674, // Share Test tournament with some billing nonsense
	];

	const keeperEvents = [
		244135,244137,244138,244140,244141,244146,244150,244156,248095,248096,248097,
		248101,248106,274437,273242,273250,273251,273255,273257,273258,274615,274616,
		274619,274623,274624,274626,274628,275386,275387,275389,275933,275934,275943,
		291000,291003,291004,282898,286196,289814,289815,289816,289819,289821,
	];

	await db.sequelize.query(`
		delete from tourn where id NOT IN (:keeperTourns)
	`, {
		replacements: {
			keeperTourns,
		},
		type: db.sequelize.QueryTypes.DELETE,
	});

	await db.sequelize.query(`
		delete from event where id NOT IN (:keeperEvents)
	`, {
		replacements: {
			keeperEvents,
		},
		type: db.sequelize.QueryTypes.DELETE,
	});

	await db.sequelize.query(`
		DELETE FROM school
		WHERE 1=1
		and NOT EXISTS (
			select entry.id from entry where entry.school = school.id LIMIT 1
		)
		and NOT EXISTS (
			select judge.id from judge where judge.school = school.id LIMIT 1
		)
	`, {
		replacements: {
			keeperEvents,
		},
		type: db.sequelize.QueryTypes.DELETE,
	});

	await db.sequelize.query(`
		DELETE
			FROM chapter WHERE 1=1
			AND NOT EXISTS (select school.id from school where school.chapter = chapter.id LIMIT 1)
	`, {
		type: db.sequelize.QueryTypes.DELETE,
	});

	await db.sequelize.query(`
		DELETE FROM student
		where 1=1
		AND not exists ( select es.id from entry_student es where es.student = student.id LIMIT 1);
	`, {
		type: db.sequelize.QueryTypes.DELETE,
	});

	await db.sequelize.query(`
		delete
			from chapter_judge
		WHERE 1=1
		and not exists (select judge.id from judge where judge.chapter_judge = chapter_judge.id LIMIT 1);
	`, {
		type: db.sequelize.QueryTypes.DELETE,
	});

	await db.sequelize.query(`
		DELETE
			FROM person
		WHERE 1=1
			AND NOT EXISTS (select student.id from student where student.person = person.id)
			AND NOT EXISTS (select judge.id from judge where judge.person = person.id)
			AND NOT EXISTS (select permission.id from permission,tourn where permission.person = person.id and permission.tourn = tourn.id)
	`, {
		type: db.sequelize.QueryTypes.DELETE,
	});

	await db.sequelize.query(`
		delete from result_key;
	`, {
		type: db.sequelize.QueryTypes.DELETE,
	});

	await db.sequelize.query(`
		delete from result_value;
	`, {
		type: db.sequelize.QueryTypes.DELETE,
	});

	await db.sequelize.query(`
		delete from campus_log;
	`, {
		type: db.sequelize.QueryTypes.DELETE,
	});
	await db.sequelize.query(`
		delete from change_log;
	`, {
		type: db.sequelize.QueryTypes.DELETE,
	});

	await db.sequelize.query(`
		delete from site where not exists (select ts.id from tourn_site ts where ts.site = site.id);
	`, {
		type: db.sequelize.QueryTypes.DELETE,
	});

	await db.sequelize.query(`
		delete from session
	`, {
		type: db.sequelize.QueryTypes.DELETE,
	});

	await db.sequelize.query(`
		delete from room where not exists (select site.id from site where site.id = room.site);
	`, {
		type: db.sequelize.QueryTypes.DELETE,
	});

	await db.sequelize.query(`
		delete from housing_slots;
	`, {
		type: db.sequelize.QueryTypes.DELETE,
	});

	await db.sequelize.query(`
		delete from housing;
	`, {
		type: db.sequelize.QueryTypes.DELETE,
	});

	await db.sequelize.query(`
		delete rating.*
			from (rating, entry)
		where 1=1
			and rating.entry = entry.id
			and rating.type = 'entry'
			and entry.event NOT IN ('248106', '275389')
	`, {
		type: db.sequelize.QueryTypes.DELETE,
	});

	await db.sequelize.query(`
		delete rating_tier.*
			from (rating_tier, category)
		where 1=1
			and type='coach'
			and rating_tier.category = category.id
			and category.tourn != '31059'
	`, {
		type: db.sequelize.QueryTypes.DELETE,
	});

	await db.sequelize.query(`
		delete rating_tier.*
			from (rating_tier)
		where 1=1
		and type='entry'
		and not exists
			(select rating.id
				from rating
				where rating.rating_tier = rating_tier.id
		);
	`, {
		type: db.sequelize.QueryTypes.DELETE,
	});

	await db.sequelize.query(`
		delete from entry_setting where tag IN (
			'po',
			'source_entry',
			'off_waitlist',
			'dropped_by',
			'dropped_at',
			'placement',
			'coach_script',
			'script_history'
		)
	`, {
		type: db.sequelize.QueryTypes.DELETE,
	});

	await db.sequelize.query(`
		delete from round_setting where tag IN (
			'disaster_checked',
			'publish_entry_list',
			'blasted',
			'nsda_pairing_log',
			'first_ballot',
			'last_ballot'
		)
	`, {
		type: db.sequelize.QueryTypes.DELETE,
	});

	await db.sequelize.query(`
		delete from panel_setting where tag IN (
			'confirmed_started',
			'flip_at',
			'flip',
			'online_hybrid',
			'flip_winner',
			'flip_status'
		)
	`, {
		type: db.sequelize.QueryTypes.DELETE,
	});

	await db.sequelize.query(`
		delete from student_setting where tag IN (
			'nsda_membership',
			'nsda_paid',
			'nsda_points',
			'nats_appearances',
			'nsda_joined',
			'districts_eligible'
		)
	`, {
		type: db.sequelize.QueryTypes.DELETE,
	});

	await db.sequelize.query(`
		delete from school_setting where tag IN (
			'contact_email',
			'contact_name',
			'contact_number',
			'second_contact_email',
			'second_contact_name',
			'second_contact_number',
			'disclaimed',
			'disclaimed_at',
			'entered_on',
			'hotel',
			'refund_method',
			'registered_on',
			'registered_by',
			'category_contacts',
			'country',
			'state'
			'contact',
			'hotel',
			'eligibility_forms',
			'release_forms'
		)
	`, {
		type: db.sequelize.QueryTypes.DELETE,
	});

	await db.sequelize.query(`
		delete from person_setting where tag IN (
			'paradigm',
			'paradigm_timestamp',
			'pass_changekey',
			'pass_change_expires',
			'pass_change_ip',
			'pass_timestamp',
			'nsda_degree',
			'nsda_membership',
			'nsda_paid',
			'nsda_points',
			'email_unconfirmed',
			'email_confirmation_key',
			'fontsize',
			'cors_delkey',
			'keyboard_shortcut',
			'no_ads_plz',
			'last_access',
			'last_attempt',
			'last_attempt_agent',
			'last_attempt_ip',
			'last_login_ip',
			'inbox_accessed',
			'default_chapter'
		)
	`, {
		type: db.sequelize.QueryTypes.DELETE,
	});

	await db.sequelize.query(`
		delete from quiz where ID != 27
	`, {
		type: db.sequelize.QueryTypes.DELETE,
	});

	await db.sequelize.query(`
		delete from email
	`, {
		type: db.sequelize.QueryTypes.DELETE,
	});

	await db.sequelize.query(`
		delete from score where tag IN (
			'rfd',
			'comments',
			'approved',
			'categories',
			'speaker',
			'speech',
			'subpoints',
			'title',
			'time'
		)
	`, {
		type: db.sequelize.QueryTypes.DELETE,
	});
};

await pruneDatabase();

console.log(`Pruned database created in ${config.DB_DATABASE}`);

process.exit();
