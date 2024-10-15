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
						where 1=1
							and pq.id = :personQuizId
					`, {
						replacements: { personQuizId: quizByNSDA[result.courseId].pqId },
						type: db.sequelize.QueryTypes.UPDATE,
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

export const syncLearnByCourse = async (quiz) => {

	const url = `${config.NSDA.ENDPOINT}${config.NSDA.LEARN_PATH}`;
	const words = CryptoJS.enc.Utf8.parse(`${config.NSDA.USER_ID}:${config.NSDA.KEY}`);
	const authToken = CryptoJS.enc.Base64.stringify(words);

	const response = await axios.get(
		url,
		{
			headers            : {
				Authorization  : `Basic ${authToken}`,
				'Content-Type' : 'application/json',
				Accept         : 'application/json',
			},
		}
	);

	const userIds = [];
	const userDates = {};

	for (const courseResult of response.data) {
		userIds.push(courseResult.user_id);
		userDates[courseResult.user_id] = courseResult.completed;
	}

	// First the linked people who do have a PQ in Tabroom already.

	const existing = await db.sequelize.query(`
		select person.id, person.nsda, pq.id pq, pq.completed, pq.updated_at
			from person, pq, quiz
		where 1=1
			and person.nsda IN (:userIds)
			and person.id = pq.person
			and pq.quiz = :quizId
	`, {
		replacements : { userIds, quizId: quiz.id },
		type         : db.sequelize.QueryTypes.SELECT,
	});

	for (const person of existing) {

		// don't need an await here because it'll finish when it finishes.
		if (userDates[person.nsda] !== person.updated_at) {
			db.sequelize.query(`
				update pq set completed = 1, updated_at = :updatedAt where id = :pqId
			`, {
				replacements: { pqId: person.pq, updatedAt: person.updated_at },
				type: db.sequelize.QueryTypes.UPDATE,
			});
		}

		delete userDates[person.nsda];
	}

	const notExisting = await db.sequelize.query(`
		select person.id, person.nsda
			from person
		where 1=1
		and person.nsda IN (:userIds)
			and not exists (
				select pq.id
					from pq
				where pq.person = person.id
					and pq.quiz = :quizId
			)
	`, {
		replacements : { userIds: Object.keys(userDates), quizId: quiz.id } ,
		type         : db.sequelize.QueryTypes.SELECT,
	});

	const pqAdds = [];

	for (const person of notExisting) {
		pqAdds.push({
			person      : person.id,
			quiz        : quiz.id,
			completed   : 1,
			approved_by : 3,
			updated_at  : userDates[person.nsda],
		});
	}

	await db.personQuiz.bulkCreate(pqAdds);

};

export default getNSDA;
