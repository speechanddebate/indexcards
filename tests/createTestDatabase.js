// Run me by the command `NODE_ENV=test node createTestDatabase.js` when fresh
// data has been loaded onto the test environment database

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
			'ada',
			'birthdate',
			'diet',
			'jot_id',
			'naudl_id',
			'naudl_updated',
			'override_appearances',
			'race',
			'school_sid',
			'student_email'
		)
	`, {
		type: db.sequelize.QueryTypes.DELETE,
	});

	await db.sequelize.query(`
		delete from follower where id NOT IN (
			1420670,
			1453992,
			1431214
		)
	`, {
		type: db.sequelize.QueryTypes.DELETE,
	});

	await db.sequelize.query(`
		delete from room where not exists (select panel.id from panel where panel.room = room.id);
	`, {
		type: db.sequelize.QueryTypes.DELETE,
	});

	await db.sequelize.query(`
		delete from rpool where not exists (select jpr.id from rpool_round jpr where jpr.rpool = rpool.id);
	`, {
		type: db.sequelize.QueryTypes.DELETE,
	});

	await db.sequelize.query(`
		delete from jpool where not exists (select jpr.id from jpool_round jpr where jpr.jpool = jpool.id);
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
			'contact',
			'judging_unmet',
			'notes',
			'notes_log',
			'no_judge_warnings',
			'purchase_order',
			'purchase_order_at',
			'purchase_order_by',
			'refund_address',
			'refund_payable',
			'rejected',
			'rejected_at',
			'rejected_by',
			'signup_active',
			'signup_deadline',
			'signup_inform_parents',
			'signup_notice',
			'signup_show_fees',
			'single_entry_letters',
			'state',
			'tbook_coaches',
			'tbook_coach_ids',
			'unpaid_onsite',
			'upload_file',
			'upload_file_timestamp'
		)
	`, {
		type: db.sequelize.QueryTypes.DELETE,
	});

	await db.sequelize.query(`
		delete from judge_setting where tag IN (
			'ballot_trained',
			'cfl_tab_first',
			'cfl_tab_second',
			'cfl_tab_third',
			'conflicts',
			'diverse',
			'email',
			'final_bio',
			'first_year',
			'gender',
			'hire_approved',
			'hire_offer',
			'incomplete',
			'neutral',
			'nomination',
			'notes',
			'notes_processed',
			'nsda',
			'online_hybrid',
			'phone',
			'prelim_jpool',
			'prelim_jpool_name',
			'public_signup',
			'public_signup_at',
			'public_signup_by',
			'public_signup_id',
			'public_signup_pending',
			'qual_history',
			'registered_by',
			'reg_answers',
			'scorer',
			'self_registered',
			'special_job',
			'sub_only',
			'tab_room'
		)
	`, {
		type: db.sequelize.QueryTypes.DELETE,
	});

	await db.sequelize.query(`
		delete from person_setting where tag IN (
			'accesses',
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
			'ban_reason',
			'campus_test_private',
			'campus_test_public',
			'congress_topic',
			'default_chapter',
			'diamonds',
			'email_confirmation_key',
			'email_unconfirmed',
			'fontsize',
			'hof',
			'keyboard_shortcut',
			'last_login_ip',
			'no_ads_plz',
			'nsda_admin',
			'nsda_membership',
			'nsda_paid',
			'nsda_points',
			'pass_changekey',
			'pass_change_expires',
			'pass_change_ip',
			'please_stop_screaming',
			'push_notify',
			'scream_in_pain',
			'judge_training_88',
			'judge_tr_meta_88',
			'learn_sync',
			'nsda_beta'
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
		delete from invoice
	`, {
		type: db.sequelize.QueryTypes.DELETE,
	});

	await db.sequelize.query(`
		delete from fine
	`, {
		type: db.sequelize.QueryTypes.DELETE,
	});

	await db.sequelize.query(`
		delete from message
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

	await db.sequelize.query(`
		delete from entry_setting where tag IN (
			'accepted_at',
			'accepted_by',
			'alternate',
			'author',
			'autoqual',
			'ballot_notes',
			'bibliography',
			'coach_points',
			'incomplete_reasons',
			'lastchance',
			'nsda_house_bloc',
			'nsda_vacate',
			'observers',
			'pairing_seed',
			'positions',
			'publisher',
			'publish_date',
			'publish_isbn',
			'publish_print_date',
			'publish_url',
			'rejected_at',
			'rejected_by',
			'reregistered',
			'script_file',
			'script_timestamp',
			'signup_by',
			'status',
			'student_ballot',
			'supp_log',
			'tba',
			'title',
			'topic'
		)
	`, {
		type : db.sequelize.QueryTypes.DELETE,
	});

	await db.sequelize.query(`
		delete from chapter_setting where tag IN (
			'ceeb',
			'coaches',
			'coach_ballot_review',
			'ipeds',
			'jot_id',
			'nats_appearances',
			'naudl',
			'naudl_id',
			'nces',
			'nsda_charter',
			'nsda_degrees',
			'nsda_paid',
			'nsda_status',
			'nsda_strength',
			'self_prefs'
		)
	`, {
		type : db.sequelize.QueryTypes.DELETE,
	});

	const pruners = [];

	const personPruner = db.sequelize.query(`
		update IGNORE person
			set nsda    = LEFT(UUID(), 8),
				first   = LEFT(MD5(RAND()), 8),
				middle  = LEFT(MD5(RAND()), 8),
				last    = LEFT(MD5(RAND()), 8),
				email   = LEFT(MD5(RAND()), 8),
				phone   = FLOOR(RAND() * 5121) + 10000,
				gender  = NULL,
				pronoun = "Test/Pronoun",
				street  = NULL,
				city    = NULL,
				state   = 'MA',
				country = 'US'
	`, {
		type: db.sequelize.QueryTypes.UPDATE,
	});

	pruners.push(personPruner);

	const studentPruner = db.sequelize.query(`
		update IGNORE student
			set nsda           = LEFT(UUID(), 8),
				first          = LEFT(MD5(RAND()), 8),
				middle         = LEFT(MD5(RAND()), 8),
				last           = LEFT(MD5(RAND()), 8),
				phonetic       = LEFT(MD5(RAND()), 8),
				grad_year      = '2030',
				nsda           = NULL,
				gender         = NULL,
				person_request = NULL
	`, {
		type: db.sequelize.QueryTypes.UPDATE,
	});

	pruners.push(studentPruner);

	const judgePruner = db.sequelize.query(`
		update IGNORE judge
			set
				first          = LEFT(MD5(RAND()), 8),
				middle         = LEFT(MD5(RAND()), 8),
				last           = LEFT(MD5(RAND()), 8),
				ada            = NULL,
				person_request = NULL
	`, {
		type: db.sequelize.QueryTypes.UPDATE,
	});

	pruners.push(judgePruner);

	const chapterJudgePruner = db.sequelize.query(`
		update IGNORE chapter_judge
			set
				first          = LEFT(MD5(RAND()), 8),
				middle         = LEFT(MD5(RAND()), 8),
				last           = LEFT(MD5(RAND()), 8),
				ada            = NULL,
				phone          = NULL,
				email          = NULL,
				diet           = NULL,
				person_request = NULL
	`, {
		type: db.sequelize.QueryTypes.UPDATE,
	});

	pruners.push(chapterJudgePruner);

	const schoolPruner = db.sequelize.query(`
		update IGNORE school
			set
				name  = LEFT(MD5(RAND()), 8),
				code  = LEFT(MD5(RAND()), 8),
				state = LEFT(MD5(RAND()), 8)
	`, {
		type: db.sequelize.QueryTypes.UPDATE,
	});

	pruners.push(schoolPruner);

	const entryPruner = await db.sequelize.query(`
		update IGNORE entry
			set
				code = LEFT(MD5(RAND()), 8),
				name = LEFT(MD5(RAND()), 8),
				ada  = NULL
	`, {
		type: db.sequelize.QueryTypes.UPDATE,
	});

	pruners.push(entryPruner);

	const adPruner = await db.sequelize.query(`
		delete from ad where id > 2
	`, { type: db.sequelize.QueryTypes.DELETE });

	pruners.push(adPruner);

	const coachPruner = await db.sequelize.query(`
		update IGNORE chapter
			set
				coaches = LEFT(MD5(RAND()), 8)
	`, {
		type: db.sequelize.QueryTypes.UPDATE,
	});

	pruners.push(coachPruner);

	await Promise.all(pruners);

};

await pruneDatabase();

console.log(`Pruned database created in ${config.DB_DATABASE}`);

process.exit();
