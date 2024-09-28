import Base64 from 'crypto-js/enc-base64.js';
import Utf8 from 'crypto-js/enc-utf8';
import axios from 'axios';
import config from '../../../../config/config.js';

export const updateLearnCourses = {

	GET: async (req, res) => {

		if (!req.session) {
			return res.status(401).json('You are not logged in');
		}

		const db = req.db;
		let targetPerson;

		if (req.params.personId && req.session.site_admin) {
			targetPerson = await db.summon(db.person, req.params.personId);
		} else if (req.session.person) {
			targetPerson = await db.summon(db.person, req.session.person);
		} else if (req.params.personId) {
			return res.status(401).json('Only a site admin may check other the courses of other users');
		} else {
			return res.status(401).json('Tabroom user account has no NSDA membership');
		}

		if ( !targetPerson || !targetPerson.nsda ) {
			return res.status(401).json('Learn courses may only be synced to valid Tabroom accounts linked to an NSDA ID');
		}

		const hashDigest = Base64.stringify(Utf8.parse(`${config.NSDA.USER_ID}:${config.NSDA.KEY}`));

		const learnResults = await axios.get(
			`${config.NSDA.ENDPOINT}${config.NSDA.PATH}/members/${targetPerson.nsda}/learn`,
			{
				headers : {
					Authorization  : `Basic ${hashDigest}`,
					'Content-Type' : 'application/json',
					Accept         : 'application/json',
				},
			},
		);

		if (!learnResults.data?.length > 0) {
			return res.status(200).json(`User ${targetPerson.nsda} does not have any completed NSDA Learn courses.`);
		}

		const existingQuizzes = await db.sequelize.query(`
			select
				quiz.id, quiz.nsda_course,
				pq.id pqId,
				pq.pending, pq.approved_by, pq.completed, pq.updated_at
			from quiz
				left join person_quiz pq on pq.quiz = quiz.id and pq.person = :personId
			where 1=1
				and quiz.nsda_course > 0
		`, {
			replacements: { personId: targetPerson.id },
			type: db.sequelize.QueryTypes.SELECT,
		});

		const quizByNSDA  = {};

		for (const quiz of existingQuizzes) {
			quizByNSDA[quiz.nsda_course] = quiz;
		}

		const results = {
			updates : 0,
			new     : 0,
		};

		for (const result of learnResults.data) {

			if (result.status === 'completed') {
				if (quizByNSDA[result.courseId]?.pqId) {
					if (!quizByNSDA[result.courseId].approved_by) {

						await db.sequelize.query(`
							update person_quiz pq
								set pq.pending = 0,
								pq.completed   = 1,
								pq.approved_by = 2
							where pq.id = :personQuizId
						`, {
							replacements: { personQuizId: quizByNSDA[result.courseId].pqId },
							type: db.QueryTypes.UPDATE,
						});

						results.updates++;
					}

				} else if (quizByNSDA[result.courseId]) {

					await db.sequelize.query(`
						INSERT INTO person_quiz
							(hidden, pending, approved_by, completed, updated_at, person, quiz)
							VALUES (0, 0, 2, 1, NOW(), :personId, :quizId)
					`, {
						replacements : {
							personId : targetPerson.id,
							quizId   : quizByNSDA[result.courseId].id,
						},
						type: db.sequelize.QueryTypes.UPDATE,
					});

					results.new++;
				}
			}
		}

		return res.status(200).json(`I have updated ${results.new} new quizzes and ${results.updates} existing ones`);
	},
};

export default updateLearnCourses;
