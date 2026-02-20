import getNSDA from '../../helpers/nsda.js';
import { multiObjectify } from '../../helpers/objectify.js';
import hmacSHA512 from 'crypto-js/hmac-sha512.js';
import Base64 from 'crypto-js/enc-base64.js';
import config from '../../../config/config.js';
import { BadRequest, Forbidden, NotFound } from '../../helpers/problem.js';
import db from '../../data/db.js';

export async function getPersonHistory(req, res) {
	let person = {};

	try {

		const persons = await db.sequelize.query(`
            SELECT DISTINCT P.id FROM person P
            LEFT JOIN student S ON S.person = P.id
            WHERE
                P.nsda = :nsdaId
                OR S.nsda = :nsdaId
        `, {
			replacements : { nsdaId: req.query.nsda_id },
			type         : db.Sequelize.QueryTypes.SELECT,
		});

		person = persons[0];

	} catch (err) {
		console.log(`Error condition on person query`);
		console.log(err);
	}

	if (!person?.id) {
		return NotFound(req, res, 'Person not found');
	}

	const replacements = {
		nsdaId   : req.query.nsda_id,
		personId : person.id,
	};

	const students = await db.sequelize.query(`
        SELECT
            T.name AS 'tournament',
            T.state as 'state',
            T.start AS 'start',
            T.end AS 'end',
            C.name AS 'chapter',
            EV.name AS 'event'
        FROM tourn T
            INNER JOIN school S ON S.tourn = T.id
            INNER JOIN entry E ON E.school = S.id
            INNER JOIN event EV ON EV.id = E.event
            INNER JOIN entry_student ES ON ES.entry = E.id
            INNER JOIN student ST ON ST.id = ES.student
            INNER JOIN chapter C ON C.id = ST.chapter
        WHERE (ST.nsda = :nsdaId OR ST.person = :personId)
            AND T.hidden = 0
        GROUP BY E.id
    `, {
		replacements,
		type : db.Sequelize.QueryTypes.SELECT,
	});

	const judges = await db.sequelize.query(`
        SELECT
            T.name AS 'tournament',
            T.state as 'state',
            T.start AS 'start',
            T.end AS 'end',
            S.name AS 'chapter',
            CAT.name AS 'category',
            COUNT(DISTINCT panel.id) as 'rounds_judged'
        FROM (tourn T, person P, judge J, category CAT)
            LEFT JOIN school S on J.school = S.id
            LEFT JOIN chapter C on C.id = S.chapter
            LEFT JOIN ballot on ballot.judge = J.id
            LEFT JOIN panel on panel.id = ballot.panel
        WHERE P.nsda = :nsdaId
            and P.id = J.person
            and J.category = CAT.id
            and CAT.tourn = T.id
            AND T.hidden = 0
        GROUP BY J.id
    `, {
		replacements,
		type : db.Sequelize.QueryTypes.SELECT,
	});

	const quizzes = await db.sequelize.query(`
        SELECT
            Q.label as 'quiz',
            PQ.pending AS 'pending',
            PQ.completed AS 'completed',
            PQ.timestamp AS 'timestamp'
        FROM person_quiz PQ
        INNER JOIN quiz Q ON Q.id = PQ.quiz
        WHERE PQ.person = :personId
    `, {
		replacements,
		type : db.Sequelize.QueryTypes.SELECT,
	});

	const history = {
		personId : person.id,
		student  : students,
		judge    : judges,
		quizzes,
	};

	return res.status(200).json(history);
};

export async function syncNatsAppearances(req, res) {
	const chapterNats = await getNSDA('/reports/nats-appearances');

	const existingChapters = multiObjectify(await req.db.sequelize.query(`
        select chapter.id chapter, chapter.nsda id, cs.id csid, cs.value
        from chapter
            left join chapter_setting cs
                on cs.chapter = chapter.id
                and cs.tag = 'nats_appearances'
        where chapter.nsda > 0
        order by chapter.id, chapter.nsda
    `, {
		type : req.db.sequelize.QueryTypes.SELECT,
	}));

	const updateChapter = `update chapter_setting set value = :value where id = :csid`;
	const createChapter = `insert into chapter_setting (tag, chapter, value) VALUES ('nats_appearances', :chapter, :value)`;

	const counters = {
		chapters : 0,
		students : 0,
	};

	// Use the for/of structure so it returns before the report can be
	// issued for success/failure.

	for await (const chapter of chapterNats.data) {
		if (existingChapters[chapter.school_id]) {
			for await (const existing of existingChapters[chapter.school_id]) {
				if (existing.csid) {
					if (parseInt(existing.value) !== parseInt(chapter.Appearances)) {
						await req.db.sequelize.query(
							updateChapter, {
								replacements : {
									value    : chapter.Appearances,
									csid     : existing.csid,
								},
								type : req.db.sequelize.QueryTypes.UPDATE,
							}
						);
						counters.chapters++;
					}
				} else {
					await req.db.sequelize.query(
						createChapter, {
							replacements : {
								value    : chapter.Appearances,
								chapter  : existing.chapter,
							},
							type : req.db.sequelize.QueryTypes.INSERT,
						}
					);
					counters.chapters++;
				}
			}
		}
	}

	const studentNats = await getNSDA('/reports/member-nats-appearances');
	const existingStudents = multiObjectify(await req.db.sequelize.query(`
        select
            student.id student, student.nsda, ss.id ssid, ss.value
        from student
            left join student_setting ss
                on ss.student = student.id
                and ss.tag = 'nats_appearances'
        where student.nsda > 0
            and student.retired != 1
        order by student.nsda
    `, {
		type : req.db.sequelize.QueryTypes.SELECT,
	}));

	// And then the individual students

	const updateStudent = `update student_setting set value = :value where id = :ssid`;
	const createStudent = `insert into student_setting (tag, student, value) VALUES ('nats_appearances', :student, :value)`;

	for await (const student of studentNats.data) {

		if (existingStudents[student.person_id]) {
			for await (const existing of existingStudents[student.person_id]) {
				if (existing.ssid) {
					if (parseInt(existing.value) !== parseInt(student.appearances)) {

						await req.db.sequelize.query(
							updateStudent, {
								replacements : {
									value    : student.appearances,
									ssid     : existing.ssid,
								},
								type : req.db.sequelize.QueryTypes.UPDATE,
							}
						);
						counters.students++;
					}
				} else {
					await req.db.sequelize.query(
						createStudent, {
							replacements : {
								value    : student.appearances,
								student  : existing.student,
							},
							type : req.db.sequelize.QueryTypes.INSERT,
						}
					);
					counters.students++;
				}
			}
		}
	}

	res.status(200).json({
		error   : false,
		message : `${counters.chapters} chapters and ${counters.students} students nats appearances updated`,
	});
};
export async function natsIndividualHonors(req, res) {
	const studentResults = await db.sequelize.query(`
        select
            student.id studentId, student.first, student.last, student.nsda studentNSDA,
            school.id schoolId, school.name schoolName, chapter.nsda chapterNSDA,
            result.rank, result.place,
            round.name roundName, round.label roundLabel,
            event.abbr eventAbbr, event.name eventName,
			event.nsda_category eventNsdaCategory,
            tourn.name tournName, tourn.start tournDate

        from (entry, result, result_set, entry_student es, student, event, tourn, tourn_setting ts, ballot, panel, round)

            left join school on entry.school = school.id
            left join chapter on school.chapter = chapter.id

        where ts.tag = 'nsda_nats'
            and ts.tourn = tourn.id
            and tourn.id = event.tourn
            and event.id = entry.event
            and entry.id = es.entry
            and es.student = student.id
            and entry.id = result.entry
            and result.result_set = result_set.id
            and result_set.label = 'Final Places'
            and entry.id = ballot.entry
            and ballot.panel = panel.id
            and panel.round = round.id
            and round.type = 'final'

            and NOT EXISTS (
                select dq.value
                from entry_setting dq
                where dq.entry = entry.id
                and dq.tag = 'dq'
            )
        group by student.id, event.id
        order by tourn.start DESC, event.abbr, result.place
    `, {
		type: db.sequelize.QueryTypes.SELECT,
	});

	res.status(200).json(studentResults);
};

export async function getPayment(req, res) {
	const tourn = await db.summon(db.tourn, req.params.tournId);

	if (!tourn.settings && !tourn.settings.store_cards) {
		return NotFound(req, res, 'No shopping cart applies to that tournament');
	}

	res.status(200).json(tourn);
};
export async function postPayment(req, res) {
	const postRequest = req.body;

	if (!postRequest.invoice_id) {
		return BadRequest(req, res, 'Invalid request sent: no invoice ID');
	}

	const hashDigest = Base64.stringify(hmacSHA512(postRequest.invoice_id, config.NSDA.KEY));

	if (hashDigest !== postRequest.hash_key) {
		return Forbidden(req, res, `Permission key invalid`);
	}

	if (!postRequest.tournId) {
		return BadRequest(req, res, 'Invalid request sent: no tournament ID');
	}

	const tourn = await db.summon(db.tourn, postRequest.tournId);
	const [invoiceId, cartKey] = postRequest.invoice_id.split('-');

	if (!tourn.settings.store_carts) {
		return NotFound(req, res, 'No shopping cart found for that tournament');
	}

	if (!tourn.settings.store_carts[cartKey]) {
		return NotFound(req, res, `Invoice ${invoiceId} cart ${cartKey} not found`);
	}

	const tournCart = tourn.settings.store_carts[cartKey];
	res.status(201).json(tourn);

	const now = new Date();

	tournCart.tabroom   = postRequest.items[config.NSDA.PRODUCT_CODES.tabroom];
	tournCart.nc        = postRequest.items[config.NSDA.PRODUCT_CODES.campus];
	tournCart.nco       = postRequest.items[config.NSDA.PRODUCT_CODES.campus_observers];
	tournCart.paid      = 1;
	tournCart.paid_at   = now;

	tourn.settings.store_carts[cartKey] = tournCart;

	const totals = {
		nc      : 0,
		tabroom : 0,
		nco     : 0,
	};

	Object.entries(tourn.settings.store_carts).forEach( (values) => {
		const cart = values[1];
		totals.tabroom += cart.tabroom;
		totals.nco += cart.nco;
		totals.nc += cart.nc;
	});

	await db.setting(tourn, 'tabroom_purchased', totals.tabroom);
	await db.setting(tourn, 'nc_purchased', totals.nc);
	await db.setting(tourn, 'nco_purchased', totals.nco);
	await db.setting(tourn, 'store_carts', { json: tourn.settings.store_carts[cartKey] });

	res.status(201).json({ error: false, message: `Invoice ${postRequest.invoice_id} marked as paid` });
};
