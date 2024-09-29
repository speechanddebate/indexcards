import CryptoJS from 'crypto-js';
import axios from 'axios';
import db from './db.js';
import config from '../../config/config.js';

export const getNSDAMemberId = async (email) => {
	const path = `/search?q=${email}&type=members`;
	const memberships = await getNSDA(path);

	if (memberships && memberships[0]?.id) {
		return {
			id    : memberships[0].id,
			first : memberships[0].last,
			last  : memberships[0].first,
		};
	}
};

export const getNSDA  = async (path) => {

	const uri = `${config.NSDA.ENDPOINT}${config.NSDA.PATH}${path}`;
	const words = CryptoJS.enc.Utf8.parse(`${config.NSDA.USER_ID}:${config.NSDA.KEY}`);
	const authToken = CryptoJS.enc.Base64.stringify(words);

	try {
		const response = await axios.get(
			uri,
			{
				headers : {
					Authorization  : `Basic ${authToken}`,
					'Content-Type' : 'application/json',
					Accept         : 'application/json',
				},
			},
		);
		return response.data;

	} catch (err) {
		return {
			error: true,
			message : `Error caught on fetch: ${err}`,
		};
	}
};

export const syncLearnResults = async (person) => {

	let targetPerson = {};

	if (typeof person === 'number') {
		targetPerson = await db.person.findByPk(person);
	} else if (typeof person === 'object') {
		targetPerson = person;
	}

	if ( !targetPerson ) {
		return 'Learn courses may only be synced to valid Tabroom accounts';
	}

	if ( !targetPerson.nsda ) {
		const membership = await getNSDAMemberId(targetPerson.email);
		if (membership && membership.id) {
			targetPerson.nsda = membership.id;
			await targetPerson.save();
		}
	}

	if ( !targetPerson.nsda ) {
		return 'No NSDA ID is tied to that Tabroom account, and no NSDA account was found with that email';
	}

	const path = `/members/${targetPerson.nsda}/learn`;
	const learnResults = await getNSDA(path);

	if (!learnResults.length > 0) {
		return `User ${targetPerson.nsda} does not have any completed NSDA Learn courses.`;
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

	for (const result of learnResults) {
		if (result.status === 'completed') {
			if (quizByNSDA[result.courseId]?.pqId) {
				if (!quizByNSDA[result.courseId].approved_by) {

					await db.sequelize.query(`
						update person_quiz pq
							set pq.pending = 0,
							pq.completed   = 1,
							pq.approved_by = 3
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
						VALUES (0, 0, 3, 1, NOW(), :personId, :quizId)
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

	return {
		message : `I have updated ${results.new} new quizzes and ${results.updates} existing ones}`,
		...results,
	};

};

export default getNSDA;
