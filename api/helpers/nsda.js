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
	const nsdaIds = {};

	if (typeof person === 'number') {
		targetPerson = await db.person.findByPk(person);
	} else if (typeof person === 'object') {
		targetPerson = person;
	}

	if ( !targetPerson ) {
		return 'Learn courses may only be synced to valid Tabroom accounts';
	}

	if ( targetPerson.nsda ) {
		nsdaIds[targetPerson.nsda] = true;
	} else {
		const membership = await getNSDAMemberId(targetPerson.email);
		if (membership && membership.id) {
			targetPerson.nsda = membership.id;
			await targetPerson.save();
		}
	}

	const nsdaIdentities = await db.sequelize.query(`
		select nsda_id.value nsda_id,
			nsda_email.value nsda_email
		from person
			left join person_setting nsda_email on nsda_email.person = person.id and nsda_email.tag = 'nsda_email'
			left join person_setting nsda_id on nsda_id.person = person.id and nsda_id.tag = 'nsda_id'
		where 1=1
			and person.id = :personId
	`, {
		replacements: { personId: targetPerson.id },
		type: db.sequelize.QueryTypes.SELECT,
	});

	if (nsdaIdentities && nsdaIdentities[0].nsda_email) {
		const membership = await getNSDAMemberId(nsdaIdentities[0].nsda_email);
		if (membership && membership.id) {
			if ( membership.id !== targetPerson.nsda ) {
				nsdaIds[membership.id] = true;
			}
		}
	}

	if (nsdaIdentities && nsdaIdentities[0].nsda_id) {
		nsdaIds[nsdaIdentities[0].nsda_id] = true;
	}

	const learnResults = [];

	for (const nsdaId of Object.keys(nsdaIds)) {
		const path = `/members/${nsdaId}/learn`;
		const learn = await getNSDA(path);
		learnResults.push(...learn);
	}

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
	const usersByNsdaId = {};
	const usersByEmail = {};

	for (const courseResult of courseData) {
		usersByNsdaId[courseResult.person_id] = courseResult;
		usersByEmail[courseResult.email.toLowerCase()] = courseResult;
	}

	// First filter everyone out who's already been tagged, and then
	// update everyone with an existing PQ that is not completed.

	const existingPQs = await db.sequelize.query(`
		select person.id, person.email, person.nsda, person.first, person.last,
			pq.id pq, pq.completed, pq.updated_at, pq.approved_by,
			nsda_email.value nsda_email,
			nsda_id.value nsda_id
		from (person, person_quiz pq, quiz)
			left join person_setting nsda_email on nsda_email.person = person.id and nsda_email.tag = 'nsda_email'
			left join person_setting nsda_id on nsda_id.person = person.id and nsda_id.tag = 'nsda_id'
		where 1=1
			and person.id = pq.person
			and pq.quiz = :quizId
		group by pq.id
	`, {
		replacements : {
			quizId: quiz.id,
		},
		type : db.sequelize.QueryTypes.SELECT,
	});

	let allPromises = [];
	const altSettings = [];

	const now = new Date();
	const logs = [];

	for (const person of existingPQs) {

		let existing = usersByEmail[person.email.toLowerCase()];

		if (!existing && person.nsda_email) {
			existing = usersByEmail[person.nsda_email.toLowerCase()];
		}

		if (
			existing
			&& (person.email === existing.email || person.email === existing.nsda_email)
			&& parseInt(person.nsda) !== parseInt(existing.person_id)
			&& parseInt(person.nsda_id) !== parseInt(existing.person_id)
		) {

			if (person.nsda) {

				const tabroomPerson = await getNSDA(`/members/${person.nsda}`);
				const nsdaPerson = await getNSDA(`/members/${existing.person_id}`);

				logs.push(`${now}: NSDA ID Mismatch: Same email ${existing.email}. Tabroom NSDA: ${person.nsda} Second ${person.nsda_id} and NSDA ID: ${existing.person_id}`);

				if (!tabroomPerson) {

					if (nsdaPerson.last === person.last || nsdaPerson.first === person.first) {

						logs.push(`${now}: NSDA ID ${person.nsda} is invalid. Name match so switching to valid NSDA ID ${nsdaPerson.person_id}`);

						swapNSDA(
							person.id,
							nsdaPerson.person_id,
							`NSDA Learn unlinked invalid NSDA ID ${person.nsda}.  Switched to ${nsdaPerson.person_id}`
						);

					} else {

						logs.push(`${now}: NSDA ID ${person.nsda} is invalid. No name match, unlinking`);

						wipeNSDA(
							person.id,
							`NSDA Learn unlinked from invalid NSDA ID ${person.nsda}`,
						);
					}

				} else {

					if (tabroomPerson.last !== person.last && tabroomPerson.first !== person.first) {

						if (
							nsdaPerson.last === person.last
							&& nsdaPerson.first === person.first
						) {

							swapNSDA(
								person.id,
								nsdaPerson.person_id,
								`NSDA Learn unlinked from ${tabroomPerson.person_id} due to name and ID mismatch.  Switched to ${nsdaPerson.person_id}`,
							);

						} else {

							wipeNSDA(
								person.id,
								nsdaPerson.person_id,
								`NSDA Learn unlinked from ${tabroomPerson.person_id} due to name and ID mismatch`,
							);
						}

					} else {
						const altNSDA = {
							tag    : 'nsda_id',
							value  : nsdaPerson.person_id,
							person : person.id,
						};
						altSettings.push(altNSDA);
					}
				}

			} else if (!person.nsda) {

				await db.sequelize.query(`
					update person set nsda = :nsdaId where id = :personId
				`, {
					replacements: { personId: person.id, nsdaId: existing.person_id },
					type: db.sequelize.QueryTypes.UPDATE,
				});

				logs.push(`${now} Linked Tabroom ${person.email} to NSDA ID: ${existing.person_id}`);

				await db.changeLog.create({
					tag         : 'link',
					person      : person.id,
					description : `NSDA Learn linked user to ${existing.person_id} because of email match`,
				});
			}
		}

		let nsdaExisting = usersByNsdaId[person.nsda];

		if (!nsdaExisting && person.nsda_id) {
			nsdaExisting = usersByNsdaId[parseInt(person.nsda_id)];
		}

		if (
			nsdaExisting
			&& person.email !== nsdaExisting.email
			&& (
				parseInt(person.nsda) === parseInt(nsdaExisting.person_id)
				|| parseInt(person.nsda_id) === parseInt(nsdaExisting.person_id)
			)
			&& ( !person.nsda_email || person.nsda_email !== nsdaExisting.email)
		) {

			logs.push(`${now}: Email Mismatch: NSDA ID: ${person.nsda} belongs to Tabroom email ${person.email} and NSDA email ${nsdaExisting.email}`);

			const altEmail = {
				tag    : 'nsda_email',
				value  : nsdaExisting.email,
				person : person.id,
			};

			altSettings.push(altEmail);

			// See if the primary Tabroom email also has an ID number and stash that too
			const membership = await getNSDAMemberId(person.email);
			logs.push(`${now}: Found membership info ${JSON.stringify(membership)} with original email ${person.email}`);

			if (membership && membership.id) {
				const altId = {
					tag    : 'nsda_id',
					value  : membership.id,
					person : person.id,
				};
				altSettings.push(altId);
			}
		}

		if (
			nsdaExisting
			&& nsdaExisting.completed
			&& person.completed
			&& person.approved_by
		) {

			delete usersByNsdaId[person.nsda];
			delete usersByNsdaId[person.nsda_id];
			delete usersByEmail[person.email.toLowerCase()];

		} else {

			if (usersByNsdaId[person.nsda] || usersByEmail[person.email.toLowerCase()]) {

				const promise = db.sequelize.query(`
					update person_quiz pq set completed = 1, approved_by = 3, updated_at = :updatedAt where id = :pqId
				`, {
					replacements: { pqId: person.pq, updatedAt: person.updated_at },
					type: db.sequelize.QueryTypes.UPDATE,
				});

				allPromises.push(promise);

				if (usersByNsdaId[person.nsda]) {
					delete usersByNsdaId[person.nsda];
				}
				if (usersByEmail[person.email.toLowerCase()]) {
					delete usersByEmail[person.email.toLowerCase()];
				}
			}
		}
	}

	await db.personSetting.bulkCreate(
		altSettings,
		{
			ignoreDuplicates: true,
		}
	);

	await Promise.all(allPromises);
	allPromises = [];

	// And now we're left with some ID numbers and email addresses that were
	// not synced or launched from Tabroom.

	const userIds = Object.keys(usersByNsdaId);

	if (userIds.length > 0) {

		const notExisting = await db.sequelize.query(`
			select person.id, person.nsda, person.email, person.middle,
				nsda_id.value nsda_id,
				nsda_email.value nsda_email
				from person
				left join person_setting nsda_id on nsda_id.person = person.id and nsda_id.tag = 'nsda_id'
				left join person_setting nsda_email on nsda_email.person = person.email and nsda_email.tag = 'nsda_email'
			where 1=1
			and (
				person.nsda IN (:userIds)
				OR EXISTS (
					select ps.id
					from person_setting ps
					where ps.person = person.id
					and ps.tag='nsda_id'
					and ps.value IN (:userIds)
				)
			)
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
			type : db.sequelize.QueryTypes.DELETE,
		});

		const pqAdds = [];

		for (const person of notExisting) {

			let courseUser = usersByNsdaId[person.nsda];

			if (!courseUser && person.nsda_id) {
				courseUser = usersByNsdaId[person.nsda_id];
			}

			if (courseUser && courseUser.completed) {

				pqAdds.push({
					person      : person.id,
					quiz        : quiz.id,
					completed   : 1,
					approved_by : 3,
					updated_at  : new Date(courseUser.completed),
				});

				// I've already found this person by NSDA ID so I do not need to do by email
				delete usersByEmail[person.email.toLowerCase()];
				if (person.nsda_email) {
					delete usersByNsdaId[person.nsda_email.toLowerCase()];
				}
				delete usersByNsdaId[person.nsda];
				if (person.nsda_id) {
					delete usersByNsdaId[person.nsda_id];
				}
			}
		}

		const bigPromise = db.personQuiz.bulkCreate(pqAdds);
		allPromises.push(bigPromise);
	}

	await Promise.all(allPromises);
	allPromises = [];

	const userEmails = Object.keys(usersByEmail);

	if (userEmails.length > 0) {

		const emailAdds = [];
		let stillNotExisting = [];

		stillNotExisting = await db.sequelize.query(`
			select person.id, person.nsda, person.email, person.last, nsda_email.value nsda_email
				from person
				left join person_setting nsda_email on nsda_email.tag = 'nsda_email' and nsda_email.person = person.id
			where 1=1
			and
				(
					person.email IN (:userEmails)
					OR EXISTS (
						select ps.id
						from person_setting ps
						where ps.person = person.id
						and ps.tag='nsda_email'
						and ps.value IN (:userEmails)
					)
				)
		`, {
			replacements : { userEmails },
			type         : db.sequelize.QueryTypes.SELECT,
		});

		await db.sequelize.query(`
			delete pq.*
				from person, person_quiz pq
			where 1=1
				and (person.email IN (:userEmails)
					OR EXISTS (
						select ps.id
						from person_setting ps
						where ps.person = person.id
						and ps.tag='nsda_email'
						and ps.value IN (:userEmails)
					)
				)
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

			let courseUser = usersByEmail[person.email.toLowerCase()];

			if (!courseUser && person.nsda_email) {
				courseUser = usersByEmail[person.nsda_email.toLowerCase()];
			}

			if (courseUser && courseUser.completed) {

				if (
					person.nsda && parseInt(courseUser.person_id) !== person.nsda
					&& (!person.nsda_id || parseInt(person.nsda_id) !== courseUser.person_id)
				) {

					if (person.nsda_id !== courseUser.person_id) {
						logs.push(` ${now} NSDA ID Mismatch: Same email ${person.email}. Tabroom NSDA: ${person.nsda} and NSDA ID: ${courseUser.person_id}`);
					}

				} else if (courseUser && !person.nsda) {

					logs.push(` ${now} ${person.email} has no NSDA ID but email correponds to ${courseUser.person_id}.  Linking.`);

					const promiseOne = db.sequelize.query(`
						update person set nsda = :nsdaId where id = :personId
					`, {
						replacements: { personId: person.id, nsdaId: courseUser.person_id },
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

				delete usersByEmail[person.email.toLowerCase()];
				if (person.nsda_email) {
					delete usersByEmail[person.nsda_email.toLowerCase()];
				}
				if (person.nsda) {
					delete usersByNsdaId[person.nsda];
				}
				delete usersByNsdaId[courseUser.person_id];
			}
		}

		const otherPromise = db.personQuiz.bulkCreate(emailAdds);
		allPromises.push(otherPromise);

	}

	await Promise.resolve(allPromises);

	const unmatchedResults = [];

	for (const nsdaId of Object.keys(usersByNsdaId)) {
		unmatchedResults.push( usersByNsdaId[nsdaId] );
	}
	for (const email of Object.keys(usersByEmail)) {
		const result = usersByEmail[email];
		if (!usersByNsdaId[result.person_id]) {
			unmatchedResults.push(result);
		}
	}

	const quizMisses = await db.tabroomSetting.findOne({ where: { tag: `quiz_misses_${quiz.id}` } });

	if (quizMisses) {
		quizMisses.value_text = JSON.stringify(unmatchedResults, null, );
		await quizMisses.save();

	} else {

		await db.tabroomSetting.create({
			tag        : `quiz_misses_${quiz.id}`,
			value      : 'text',
			person     : 3,
			value_text : JSON.stringify(unmatchedResults, null, 4),
		});
	}

	const quizLog = await db.tabroomSetting.findOne({ where: { tag: `quiz_log_${quiz.id}` } });

	if (quizLog) {
		quizLog.value_text = JSON.stringify(logs, null, 4);
		await quizLog.save();

	} else {

		await db.tabroomSetting.create({
			tag        : `quiz_log_${quiz.id}`,
			value      : 'text',
			person     : 3,
			value_text : JSON.stringify(logs, null, 4),
		});
	}

	return `${quiz.label} synchronized for ${courseData.length} records with ${logs.length} changes`;

};

export const swapNSDA = async (personId, goodNSDA, logMsg) => {
	await db.sequelize.query(`
		update person set nsda = :goodNSDA where id = :personId
	`, {
		replacements: { personId, goodNSDA },
		type: db.sequelize.QueryTypes.UPDATE,
	});

	await db.changeLog.create({
		tag         : 'link',
		person      : personId,
		description : logMsg || `NSDA ID swapped to ${goodNSDA}`,
	});
};

export const wipeNSDA = async (personId, logMsg) => {
	await db.sequelize.query(`
		update person set nsda = NULL where id = :personId
	`, {
		replacements: { personId },
		type: db.sequelize.QueryTypes.UPDATE,
	});

	await db.changeLog.create({
		tag         : 'link',
		person      : personId,
		description : logMsg || `NSDA ID deleted `,
	});
};

export default getNSDA;
