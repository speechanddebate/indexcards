import { getAllSalesforceStudents, getOneSalesforceStudent, getSalesforceStudents, postSalesforceStudents } from '../../helpers/naudl.js';
import { errorLogger, autoemailLogger } from '../../helpers/logger.js';
import { notify } from '../../helpers/blast.js';
import db from '../../helpers/litedb.js';
import studentSetting from '../../data/models/student_setting.js';

db.studentSetting = studentSetting( db.sequelize, db.Sequelize.DataTypes);

export const syncNAUDLStudents = async () => {

	const unpostedStudentsQuery = `
		select
			student.id, student.first, student.middle, student.last,
			student.grad_year,
			race.value race,
			school_sid.value schoolSid,
			student.chapter chapterId,
			chapter.name chapterName,
			chapter.state chapterState,
			chapterNaudlId.value chapterNaudlId,
			studentNaudlId.value studentNaudlId
		from (student, chapter_setting naudl, chapter)

			left join student_setting race on race.student = student.id and race.tag = 'race'
			left join student_setting school_sid on school_sid.student = student.id and school_sid.tag = 'school_sid'
			left join student_setting studentNaudlId on studentNaudlId.student = student.id and studentNaudlId.tag = 'naudl_id'
			left join chapter_setting chapterNaudlId on chapterNaudlId.tag = 'naudl_id' and chapterNaudlId.chapter = chapter.id

		where naudl.tag = 'naudl'
			and naudl.chapter = student.chapter
			and naudl.chapter = chapter.id
			and student.retired = 0

		and not exists (
			select nu.id
			from student_setting nu
			where nu.student = student.id
			and nu.tag = 'naudl_id'
			and nu.timestamp > student.timestamp
		)
		order by chapter.id, student.id DESC
		limit 100
	`;

	const unpostedStudents = await db.sequelize.query(unpostedStudentsQuery, {
		type: db.sequelize.QueryTypes.SELECT,
	});

	const raceEncoding = {
		asian      : 'Asian',
		latino     : 'Latino',
		black      : 'Black_African_American',
		amerindian : 'American_Indian_Native_American',
		pacific    : 'Native_Hawaiian_Pacific_Islander',
		white      : 'White',
		dual       : 'Two_or_more_races',
		other      : 'Other',
	};

	const postings = {
		unpostedChapterIds : {},
		unpostedChapters   : [],
		updateChapters     : {},
		unpostedStudents   : [],
		newPostedStudents  : [],
		postedStudents     : {},
		alteredStudents    : [],
	};

	for await (const student of unpostedStudents) {

		if (student.chapterNaudlId) {

			const studentRecord = {
				tabroomid                : `TR${student.id}`,
				teamid                   : `TR${student.chapterId}`,
				First_Name               : student.first,
				Middle_Name              : student.middle ? student.middle : ' ',
				Last_Name                : student.last,
				Expected_graduation_year : student.grad_year,
			};

			if (student.race && raceEncoding[student.race]) {
				studentRecord[raceEncoding[student.race]] = true;
			}

			if (student.schoolSid) {
				studentRecord.studentschoolid = student.schoolSid;
			}

			if (student.studentNaudlId) {
				studentRecord.id = student.studentNaudlId;
				postings.alteredStudents.push(studentRecord);
			} else {
				postings.updateChapters[student.chapterId] = student.chapterNaudlId;
				postings.unpostedStudents.push(studentRecord);
			}

		} else {
			if (!postings.unpostedChapterIds[student.chapterId]) {
				postings.unpostedChapterIds[student.chapterId] = true;
				postings.unpostedChapters.push(`Chapter ID TR${student.chapterId} ${student.chapterName} in ${student.chapterState}`);
			}
		}
	}

	for await (const chapterId of Object.keys(postings.updateChapters)) {
		postings.newPostedStudents[chapterId] =
			await syncNAUDLChapterRoster(chapterId, postings.updateChapters[chapterId]);
	}

	postings.postTheseStudents = postings.unpostedStudents.flatMap( (student) => {
		if (postings.postedStudents[student.chapterId]?.[student.id]) {
			postings.alteredStudents.push(student);
			return [];
		}
		return student;
	});

	let response = await postSalesforceStudents({
		students_from_tabroom: postings.unpostedStudents,
	});

	// If a group post fails, try looking them up and posting them
	// individually because it probably means someone has messed with the
	// data.

	if (response.data?.success === 'false') {

		postings.secondChanceStudents = [];

		for await (const student of postings.unpostedStudents) {

			const naudlStudent = await getOneSalesforceStudent(student.tabroomid);

			if (naudlStudent?.Id) {

				try {
					await db.studentSetting.create({
						student : student.tabroomid.slice(2),
						tag     : 'naudl_id',
						value   : naudlStudent.Id,
					});
				} catch (err) {
					errorLogger.info(err);
				}

			} else {
				postings.secondChanceStudents.push(student);
			}
		}

		response = await postSalesforceStudents({
			students_from_tabroom: postings.secondChanceStudents,
		});
	}

	if (response.data?.success === 'true') {
		for await (const chapterId of Object.keys(postings.updateChapters)) {
			postings.newPostedStudents[chapterId] =
				await syncNAUDLChapterRoster(chapterId, postings.updateChapters[chapterId]);
		}
	}

	let messageBody = 'Response from posted data:\n';
	messageBody += JSON.stringify(response.data);
	messageBody += '\n\nChapters marked as NAUDL schools, but not in Salesforce: \n';

	for await (const chapter of postings.unpostedChapters) {
		messageBody += `${chapter} \n`;
	}

	// replace this with an ID based sender later.
	const naudlAdmins = await db.sequelize.query(`
		select person.id
		from person, person_setting ps
		where person.id = ps.person
			and ps.tag = :tag
	`, {
		replacements: { tag: 'naudl_admin' },
		type: db.sequelize.QueryTypes.SELECT,
	});

	const naudlIds = naudlAdmins.map( (admin) => admin.id );

	if (naudlAdmins) {
		const emailResponse = await notify({
			ids     : naudlIds,
			from    : 'naudldata@www.tabroom.com',
			subject : `Tabroom Students Record Post : ${response.data.success ? 'SUCCESS' : 'ERRORS'}`,
			text    : messageBody,
			noWeb   : true,
		});

		autoemailLogger.info(`NAUDL student and chapter report sent`);
		autoemailLogger.info(emailResponse);

	} else {
		errorLogger.info(`No NAUDL email addresses found, message not sent`);
	}

	return response.data;
};

const syncNAUDLChapterRoster = async (chapterId, naudlId) => {

	const salesforceStudents = await getSalesforceStudents(naudlId);
	const studentsById = {};

	for await (const student of salesforceStudents) {
		if (student.Tabroom_ID__c) {
			studentsById[student.Tabroom_ID__c?.slice(2)] = student.Id;
		}
	}

	const tabroomStudents = await db.sequelize.query(`
		select
			student.id, naudlId.value studentNaudlId
		from (student)
			left join student_setting naudlId
				on naudlId.student = student.id
				and naudlId.tag = 'naudl_id'
		where student.chapter = :chapterId
			and student.retired = 0
	`, {
		replacements: { chapterId },
		type : db.sequelize.QueryTypes.SELECT,
	});

	const createSettings = await tabroomStudents.flatMap( (student) => {

		if (studentsById[student.id]) {
			if (!student.studentNaudlId) {
				return {
					student    : student.id,
					tag        : 'naudl_id',
					value      : studentsById[student.id],
				};
			}

			if (student.studentNaudlId !== studentsById[student.id]) {
				db.studentSetting.update({
					value: studentsById[student.id],
				}, {
					where: {
						tag     : 'naudl_id',
						student : student.id,
					},
				});
			}
		}
		return [];
	});

	if (createSettings.length > 0) {
		await db.studentSetting.bulkCreate(createSettings);
	}

	return studentsById;
};

export const syncExistingNAUDLStudents = async () => {

	const naudlStudents = await getAllSalesforceStudents();

	const tabroomStudents = await db.sequelize.query(`
		select
			student.id,
				naudl.id settingId, naudl.value naudlId
		from (student, student_setting ns)
			left join student_setting naudl
				on naudl.student = student.id
				and naudl.tag = 'naudl_id'
		where student.id = ns.student
			and ns.tag = 'naudl_id'
	`, {
		type: db.sequelize.QueryTypes.SELECT,
	});

	const done = {};

	for await (const student of tabroomStudents) {
		done[student.id] = student.naudlId;
	}

	const settings = {
		create     : [],
		mismatches : [],
	};

	for await (const student of naudlStudents) {
		student.TRID = student.Tabroom_ID__c?.slice(2);
		if (!done[student.TRID]) {
			settings.create.push({
				tag     : 'naudl_id',
				student : student.TRID,
				value   : student.Id,
			});
		} else if (done[student.TRID] !== student.Id) {
			settings.mismatches.push({
				tag     : 'naudl_id',
				student : student.TRID,
				value   : student.Id,
				current : done[student.TRID],
			});
		}
	}

	await db.sequelize.query(`SET FOREIGN_KEY_CHECKS=0`);

	try {
		await db.studentSetting.bulkCreate(settings.create);
	} catch (err) {
		errorLogger.info(err);
	}

	await db.sequelize.query(`
		DELETE student_setting.* from student_setting
		WHERE NOT EXISTS (
			select student.id
			from student
			where student.id = student_setting.student
		)
	`);

	await db.sequelize.query(`SET FOREIGN_KEY_CHECKS=1`);
	return `Created ${settings.create.length} student records from Salesforce`;

};

await syncNAUDLStudents();
await syncExistingNAUDLStudents();

process.exit();
