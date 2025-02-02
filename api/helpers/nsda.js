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

				await db.personQuiz.create({
					person      : targetPerson.id,
					approved_by : 3,
					quiz        : quizByNSDA[result.courseId].id,
					completed   : 1,
					updated_at  : new Date(),
				});

				results.new++;
			}
		}
	}

	return {
		message : `I have updated ${results.new} new quizzes and ${results.updates} existing ones`,
		...results,
	};

};

export const syncLearnByCourse = async (quiz) => {

	const courseData = await getNSDA(`/learn/courses/${quiz.nsda_course}`);

	const usersById = {};
	const usersByEmail = {};

	for (const courseResult of courseData) {
		usersById[courseResult.user_id] = courseResult;
		usersByEmail[courseResult.email] = courseResult;
	}

	// First filter everyone out who's already been tagged, and then
	// update everyone with an existing PQ that is not completed.

	const existingPQs = await db.sequelize.query(`
		select person.id, person.email, person.nsda,
			pq.id pq, pq.completed, pq.updated_at
		from person, person_quiz pq, quiz
		where 1=1
			and person.id = pq.person
			and pq.quiz = :quizId
	`, {
		replacements : {
			quizId: quiz.id,
		},
		type : db.sequelize.QueryTypes.SELECT,
	});

	const allPromises = [];
	const nsdaMismatches = [];

	for (const person of existingPQs) {

		if (person.email
			&& usersByEmail[person.email]
			&& person.nsda !== usersByEmail[person.email].user_id
		) {
			usersByEmail[person.email].tabroom = person;
			nsdaMismatches.push(usersByEmail[person.email]);
		}

		if (person.completed && person.approved_by) {

			delete usersById[person.nsda];
			delete usersByEmail[person.email];

		} else {

			if (usersById[person.nsda] || usersByEmail[person.email]) {

				const promise = db.sequelize.query(`
					update person_quiz pq set completed = 1, approved_by = 3, updated_at = :updatedAt where id = :pqId
				`, {
					replacements: { pqId: person.pq, updatedAt: person.updated_at },
					type: db.sequelize.QueryTypes.UPDATE,
				});

				allPromises.push(promise);

				delete usersById[person.nsda];
				delete usersByEmail[person.email];
			}
		}
	}

	const userIds = Object.keys(usersById);

	if (userIds.length < 1) {
		userIds.push(0);
	}

	const notExisting = await db.sequelize.query(`
		select person.id, person.nsda, person.email
			from person
		where 1=1
		and person.nsda IN (:userIds)
	`, {
		replacements : { userIds },
		type         : db.sequelize.QueryTypes.SELECT,
	});

	await db.sequelize.query(`
		delete pq.*
			from person, person_quiz pq
		where 1=1
			and person.nsda IN (:userIds)
			and person.id = pq.person
			and pq.quiz = :quizId
	`, {
		replacements : {
			userIds,
			quizId   : quiz.id,
		},
		type         : db.sequelize.QueryTypes.DELETE,
	});

	const pqAdds = [];

	for (const person of notExisting) {
		pqAdds.push({
			person      : person.id,
			quiz        : quiz.id,
			completed   : 1,
			approved_by : 3,
			updated_at  : new Date(usersById[person.nsda].completed),
		});

		delete usersByEmail[person.email];
	}

	const bigPromise = db.personQuiz.bulkCreate(pqAdds);
	allPromises.push(bigPromise);

	const emailAdds = [];

	const userEmails = Object.keys(usersByEmail);
	if (userEmails.length < 1) {
		userEmails.push('nope');
	}

	const stillNotExisting = await db.sequelize.query(`
		select person.id, person.nsda, person.email
			from person
		where 1=1
		and person.email IN (:userEmails)
	`, {
		replacements : { userEmails },
		type         : db.sequelize.QueryTypes.SELECT,
	});

	await db.sequelize.query(`
		delete pq.*
			from person, person_quiz pq
		where 1=1
			and person.nsda IN (:userEmails)
			and person.id = pq.person
			and pq.quiz = :quizId
	`, {
		replacements   : {
			userEmails,
			quizId     : quiz.id,
		},
		type : db.sequelize.QueryTypes.DELETE,
	});

	for (const person of stillNotExisting) {

		const courseUser = usersByEmail[person.email];

		if (courseUser) {

			if (person.nsda && courseUser.user_id !== person.nsda) {

				courseUser.tabroom = person;
				nsdaMismatches.push(courseUser);

			} else if (courseUser && !person.nsda) {

				const promiseOne = db.sequelize.query(`
					update person set nsda = :nsdaId where id = :personId
				`, {
					replacements: { personId: person.id, nsdaId: courseUser.user_id },
					type: db.sequelize.QueryTypes.UPDATE,
				});

				allPromises.push(promiseOne);
			}

			emailAdds.push({
				person      : person.id,
				quiz        : quiz.id,
				completed   : 1,
				approved_by : 3,
				updated_at  : new Date(courseUser.completed),
			});

			delete usersByEmail[person.email];
		}
	}

	const otherPromise = db.personQuiz.bulkCreate(emailAdds);
	allPromises.push(otherPromise);

	await Promise.resolve(allPromises);
	const quizLog = await db.tabroomSetting.findOne({ where: { tag: `quiz_log_${quiz.id}` } });

	if (quizLog) {

		quizLog.value_text = JSON.stringify(nsdaMismatches, null, 4);
		await quizLog.save();

	} else {

		await db.tabroomSetting.create({
			tag        : `quiz_log_${quiz.id}`,
			value      : 'text',
			person     : 3,
			value_text : JSON.stringify(nsdaMismatches, null, 4),
		});
	}

	return `${quiz.label} synchronized for ${courseData.length} records with ${nsdaMismatches.length} mismatches`;

};

export default getNSDA;
