import _sequelize from "sequelize";
const DataTypes = _sequelize.DataTypes;
import _ad from  "./ad.js";
import _autoqueue from  "./autoqueue.js";
import _ballot from  "./ballot.js";
import _campusLog from  "./campus_log.js";
import _caselist from  "./caselist.js";
import _category from  "./category.js";
import _categorySetting from  "./category_setting.js";
import _changeLog from  "./change_log.js";
import _chapter from  "./chapter.js";
import _chapterCircuit from  "./chapter_circuit.js";
import _chapterJudge from  "./chapter_judge.js";
import _chapterSetting from  "./chapter_setting.js";
import _circuit from  "./circuit.js";
import _circuitMembership from  "./circuit_membership.js";
import _circuitSetting from  "./circuit_setting.js";
import _coach from  "./coach.js";
import _concession from  "./concession.js";
import _concessionOption from  "./concession_option.js";
import _concessionPurchase from  "./concession_purchase.js";
import _concessionPurchaseOption from  "./concession_purchase_option.js";
import _concessionType from  "./concession_type.js";
import _conflict from  "./conflict.js";
import _contact from  "./contact.js";
import _diocese from  "./diocese.js";
import _district from  "./district.js";
import _email from  "./email.js";
import _entry from  "./entry.js";
import _entrySetting from  "./entry_setting.js";
import _entryStudent from  "./entry_student.js";
import _event from  "./event.js";
import _eventSetting from  "./event_setting.js";
import _file from  "./file.js";
import _fine from  "./fine.js";
import _follower from  "./follower.js";
import _hotel from  "./hotel.js";
import _invoice from  "./invoice.js";
import _jpool from  "./jpool.js";
import _jpoolJudge from  "./jpool_judge.js";
import _jpoolRound from  "./jpool_round.js";
import _jpoolSetting from  "./jpool_setting.js";
import _judge from  "./judge.js";
import _judgeHire from  "./judge_hire.js";
import _judgeSetting from  "./judge_setting.js";
import _message from  "./message.js";
import _nsdaCategory from  "./nsda_category.js";
import _panel from  "./panel.js";
import _panelSetting from  "./panel_setting.js";
import _pattern from  "./pattern.js";
import _permission from  "./permission.js";
import _person from  "./person.js";
import _personQuiz from  "./person_quiz.js";
import _personSetting from  "./person_setting.js";
import _practice from  "./practice.js";
import _practiceStudent from  "./practice_student.js";
import _protocol from  "./protocol.js";
import _protocolSetting from  "./protocol_setting.js";
import _qualifier from  "./qualifier.js";
import _quiz from  "./quiz.js";
import _rating from  "./rating.js";
import _ratingSubset from  "./rating_subset.js";
import _ratingTier from  "./rating_tier.js";
import _region from  "./region.js";
import _regionFine from  "./region_fine.js";
import _regionSetting from  "./region_setting.js";
import _result from  "./result.js";
import _resultKey from  "./result_key.js";
import _resultSet from  "./result_set.js";
import _resultValue from  "./result_value.js";
import _room from  "./room.js";
import _roomStrike from  "./room_strike.js";
import _round from  "./round.js";
import _roundSetting from  "./round_setting.js";
import _rpool from  "./rpool.js";
import _rpoolRoom from  "./rpool_room.js";
import _rpoolRound from  "./rpool_round.js";
import _rpoolSetting from  "./rpool_setting.js";
import _school from  "./school.js";
import _schoolSetting from  "./school_setting.js";
import _score from  "./score.js";
import _server from  "./server.js";
import _session from  "./session.js";
import _setting from  "./setting.js";
import _settingLabel from  "./setting_label.js";
import _shift from  "./shift.js";
import _site from  "./site.js";
import _strike from  "./strike.js";
import _student from  "./student.js";
import _studentBallot from  "./student_ballot.js";
import _studentSetting from  "./student_setting.js";
import _studentVote from  "./student_vote.js";
import _sweepAward from  "./sweep_award.js";
import _sweepAwardEvent from  "./sweep_award_event.js";
import _sweepEvent from  "./sweep_event.js";
import _sweepInclude from  "./sweep_include.js";
import _sweepRule from  "./sweep_rule.js";
import _sweepSet from  "./sweep_set.js";
import _tabroomSetting from  "./tabroom_setting.js";
import _tiebreak from  "./tiebreak.js";
import _timeslot from  "./timeslot.js";
import _topic from  "./topic.js";
import _tourn from  "./tourn.js";
import _tournCircuit from  "./tourn_circuit.js";
import _tournFee from  "./tourn_fee.js";
import _tournIgnore from  "./tourn_ignore.js";
import _tournSetting from  "./tourn_setting.js";
import _tournSite from  "./tourn_site.js";
import _webpage from  "./webpage.js";
import _weekend from  "./weekend.js";

export default function initModels(sequelize) {
		const ad = _ad.init(sequelize, DataTypes);
		const autoqueue = _autoqueue.init(sequelize, DataTypes);
		const ballot = _ballot.init(sequelize, DataTypes);
		const campusLog = _campusLog.init(sequelize, DataTypes);
		const caselist = _caselist.init(sequelize, DataTypes);
		const category = _category.init(sequelize, DataTypes);
		const categorySetting = _categorySetting.init(sequelize, DataTypes);
		const changeLog = _changeLog.init(sequelize, DataTypes);
		const chapter = _chapter.init(sequelize, DataTypes);
		const chapterCircuit = _chapterCircuit.init(sequelize, DataTypes);
		const chapterJudge = _chapterJudge.init(sequelize, DataTypes);
		const chapterSetting = _chapterSetting.init(sequelize, DataTypes);
		const circuit = _circuit.init(sequelize, DataTypes);
		const circuitMembership = _circuitMembership.init(sequelize, DataTypes);
		const circuitSetting = _circuitSetting.init(sequelize, DataTypes);
		const coach = _coach.init(sequelize, DataTypes);
		const concession = _concession.init(sequelize, DataTypes);
		const concessionOption = _concessionOption.init(sequelize, DataTypes);
		const concessionPurchase = _concessionPurchase.init(sequelize, DataTypes);
		const concessionPurchaseOption = _concessionPurchaseOption.init(sequelize, DataTypes);
		const concessionType = _concessionType.init(sequelize, DataTypes);
		const conflict = _conflict.init(sequelize, DataTypes);
		const contact = _contact.init(sequelize, DataTypes);
		const diocese = _diocese.init(sequelize, DataTypes);
		const district = _district.init(sequelize, DataTypes);
		const email = _email.init(sequelize, DataTypes);
		const entry = _entry.init(sequelize, DataTypes);
		const entrySetting = _entrySetting.init(sequelize, DataTypes);
		const entryStudent = _entryStudent.init(sequelize, DataTypes);
		const event = _event.init(sequelize, DataTypes);
		const eventSetting = _eventSetting.init(sequelize, DataTypes);
		const file = _file.init(sequelize, DataTypes);
		const fine = _fine.init(sequelize, DataTypes);
		const follower = _follower.init(sequelize, DataTypes);
		const hotel = _hotel.init(sequelize, DataTypes);
		const invoice = _invoice.init(sequelize, DataTypes);
		const jpool = _jpool.init(sequelize, DataTypes);
		const jpoolJudge = _jpoolJudge.init(sequelize, DataTypes);
		const jpoolRound = _jpoolRound.init(sequelize, DataTypes);
		const jpoolSetting = _jpoolSetting.init(sequelize, DataTypes);
		const judge = _judge.init(sequelize, DataTypes);
		const judgeHire = _judgeHire.init(sequelize, DataTypes);
		const judgeSetting = _judgeSetting.init(sequelize, DataTypes);
		const message = _message.init(sequelize, DataTypes);
		const nsdaCategory = _nsdaCategory.init(sequelize, DataTypes);
		const panel = _panel.init(sequelize, DataTypes);
		const panelSetting = _panelSetting.init(sequelize, DataTypes);
		const pattern = _pattern.init(sequelize, DataTypes);
		const permission = _permission.init(sequelize, DataTypes);
		const person = _person.init(sequelize, DataTypes);
		const personQuiz = _personQuiz.init(sequelize, DataTypes);
		const personSetting = _personSetting.init(sequelize, DataTypes);
		const practice = _practice.init(sequelize, DataTypes);
		const practiceStudent = _practiceStudent.init(sequelize, DataTypes);
		const protocol = _protocol.init(sequelize, DataTypes);
		const protocolSetting = _protocolSetting.init(sequelize, DataTypes);
		const qualifier = _qualifier.init(sequelize, DataTypes);
		const quiz = _quiz.init(sequelize, DataTypes);
		const rating = _rating.init(sequelize, DataTypes);
		const ratingSubset = _ratingSubset.init(sequelize, DataTypes);
		const ratingTier = _ratingTier.init(sequelize, DataTypes);
		const region = _region.init(sequelize, DataTypes);
		const regionFine = _regionFine.init(sequelize, DataTypes);
		const regionSetting = _regionSetting.init(sequelize, DataTypes);
		const result = _result.init(sequelize, DataTypes);
		const resultKey = _resultKey.init(sequelize, DataTypes);
		const resultSet = _resultSet.init(sequelize, DataTypes);
		const resultValue = _resultValue.init(sequelize, DataTypes);
		const room = _room.init(sequelize, DataTypes);
		const roomStrike = _roomStrike.init(sequelize, DataTypes);
		const round = _round.init(sequelize, DataTypes);
		const roundSetting = _roundSetting.init(sequelize, DataTypes);
		const rpool = _rpool.init(sequelize, DataTypes);
		const rpoolRoom = _rpoolRoom.init(sequelize, DataTypes);
		const rpoolRound = _rpoolRound.init(sequelize, DataTypes);
		const rpoolSetting = _rpoolSetting.init(sequelize, DataTypes);
		const school = _school.init(sequelize, DataTypes);
		const schoolSetting = _schoolSetting.init(sequelize, DataTypes);
		const score = _score.init(sequelize, DataTypes);
		const server = _server.init(sequelize, DataTypes);
		const session = _session.init(sequelize, DataTypes);
		const setting = _setting.init(sequelize, DataTypes);
		const settingLabel = _settingLabel.init(sequelize, DataTypes);
		const shift = _shift.init(sequelize, DataTypes);
		const site = _site.init(sequelize, DataTypes);
		const strike = _strike.init(sequelize, DataTypes);
		const student = _student.init(sequelize, DataTypes);
		const studentBallot = _studentBallot.init(sequelize, DataTypes);
		const studentSetting = _studentSetting.init(sequelize, DataTypes);
		const studentVote = _studentVote.init(sequelize, DataTypes);
		const sweepAward = _sweepAward.init(sequelize, DataTypes);
		const sweepAwardEvent = _sweepAwardEvent.init(sequelize, DataTypes);
		const sweepEvent = _sweepEvent.init(sequelize, DataTypes);
		const sweepInclude = _sweepInclude.init(sequelize, DataTypes);
		const sweepRule = _sweepRule.init(sequelize, DataTypes);
		const sweepSet = _sweepSet.init(sequelize, DataTypes);
		const tabroomSetting = _tabroomSetting.init(sequelize, DataTypes);
		const tiebreak = _tiebreak.init(sequelize, DataTypes);
		const timeslot = _timeslot.init(sequelize, DataTypes);
		const topic = _topic.init(sequelize, DataTypes);
		const tourn = _tourn.init(sequelize, DataTypes);
		const tournCircuit = _tournCircuit.init(sequelize, DataTypes);
		const tournFee = _tournFee.init(sequelize, DataTypes);
		const tournIgnore = _tournIgnore.init(sequelize, DataTypes);
		const tournSetting = _tournSetting.init(sequelize, DataTypes);
		const tournSite = _tournSite.init(sequelize, DataTypes);
		const webpage = _webpage.init(sequelize, DataTypes);
		const weekend = _weekend.init(sequelize, DataTypes);

		score.belongsTo(ballot, { as: "ballot_ballot", foreignKey: "ballot"});
		ballot.hasMany(score, { as: "scores", foreignKey: "ballot"});
		categorySetting.belongsTo(category, { as: "category_category", foreignKey: "category"});
		category.hasMany(categorySetting, { as: "category_settings", foreignKey: "category"});
		event.belongsTo(category, { as: "category_category", foreignKey: "category"});
		category.hasMany(event, { as: "events", foreignKey: "category"});
		jpool.belongsTo(category, { as: "category_category", foreignKey: "category"});
		category.hasMany(jpool, { as: "jpools", foreignKey: "category"});
		judge.belongsTo(category, { as: "category_category", foreignKey: "category"});
		category.hasMany(judge, { as: "judges", foreignKey: "category"});
		permission.belongsTo(category, { as: "category_category", foreignKey: "category"});
		category.hasMany(permission, { as: "permissions", foreignKey: "category"});
		ratingTier.belongsTo(category, { as: "category_category", foreignKey: "category"});
		category.hasMany(ratingTier, { as: "rating_tiers", foreignKey: "category"});
		shift.belongsTo(category, { as: "category_category", foreignKey: "category"});
		category.hasMany(shift, { as: "shifts", foreignKey: "category"});
		chapterCircuit.belongsTo(chapter, { as: "chapter_chapter", foreignKey: "chapter"});
		chapter.hasMany(chapterCircuit, { as: "chapter_circuits", foreignKey: "chapter"});
		chapterJudge.belongsTo(chapter, { as: "chapter_chapter", foreignKey: "chapter"});
		chapter.hasMany(chapterJudge, { as: "chapter_judges", foreignKey: "chapter"});
		chapterSetting.belongsTo(chapter, { as: "chapter_chapter", foreignKey: "chapter"});
		chapter.hasMany(chapterSetting, { as: "chapter_settings", foreignKey: "chapter"});
		conflict.belongsTo(chapter, { as: "chapter_chapter", foreignKey: "chapter"});
		chapter.hasMany(conflict, { as: "conflicts", foreignKey: "chapter"});
		permission.belongsTo(chapter, { as: "chapter_chapter", foreignKey: "chapter"});
		chapter.hasMany(permission, { as: "permissions", foreignKey: "chapter"});
		practice.belongsTo(chapter, { as: "chapter_chapter", foreignKey: "chapter"});
		chapter.hasMany(practice, { as: "practices", foreignKey: "chapter"});
		student.belongsTo(chapter, { as: "chapter_chapter", foreignKey: "chapter"});
		chapter.hasMany(student, { as: "students", foreignKey: "chapter"});
		chapterCircuit.belongsTo(circuit, { as: "circuit_circuit", foreignKey: "circuit"});
		circuit.hasMany(chapterCircuit, { as: "chapter_circuits", foreignKey: "circuit"});
		circuitSetting.belongsTo(circuit, { as: "circuit_circuit", foreignKey: "circuit"});
		circuit.hasMany(circuitSetting, { as: "circuit_settings", foreignKey: "circuit"});
		permission.belongsTo(circuit, { as: "circuit_circuit", foreignKey: "circuit"});
		circuit.hasMany(permission, { as: "permissions", foreignKey: "circuit"});
		tournCircuit.belongsTo(circuit, { as: "circuit_circuit", foreignKey: "circuit"});
		circuit.hasMany(tournCircuit, { as: "tourn_circuits", foreignKey: "circuit"});
		concessionPurchase.belongsTo(concession, { as: "concession_concession", foreignKey: "concession"});
		concession.hasMany(concessionPurchase, { as: "concession_purchases", foreignKey: "concession"});
		concessionPurchaseOption.belongsTo(concessionOption, { as: "concession_option_concession_option", foreignKey: "concession_option"});
		concessionOption.hasMany(concessionPurchaseOption, { as: "concession_purchase_options", foreignKey: "concession_option"});
		concessionPurchaseOption.belongsTo(concessionPurchase, { as: "concession_purchase_concession_purchase", foreignKey: "concession_purchase"});
		concessionPurchase.hasMany(concessionPurchaseOption, { as: "concession_purchase_options", foreignKey: "concession_purchase"});
		permission.belongsTo(district, { as: "district_district", foreignKey: "district"});
		district.hasMany(permission, { as: "permissions", foreignKey: "district"});
		campusLog.belongsTo(entry, { as: "entry_entry", foreignKey: "entry"});
		entry.hasMany(campusLog, { as: "campus_logs", foreignKey: "entry"});
		coach.belongsTo(entry, { as: "entry_entry", foreignKey: "entry"});
		entry.hasOne(coach, { as: "coach", foreignKey: "entry"});
		entrySetting.belongsTo(entry, { as: "entry_entry", foreignKey: "entry"});
		entry.hasMany(entrySetting, { as: "entry_settings", foreignKey: "entry"});
		entryStudent.belongsTo(entry, { as: "entry_entry", foreignKey: "entry"});
		entry.hasMany(entryStudent, { as: "entry_students", foreignKey: "entry"});
		follower.belongsTo(entry, { as: "entry_entry", foreignKey: "entry"});
		entry.hasMany(follower, { as: "followers", foreignKey: "entry"});
		qualifier.belongsTo(entry, { as: "entry_entry", foreignKey: "entry"});
		entry.hasMany(qualifier, { as: "qualifiers", foreignKey: "entry"});
		rating.belongsTo(entry, { as: "entry_entry", foreignKey: "entry"});
		entry.hasMany(rating, { as: "ratings", foreignKey: "entry"});
		result.belongsTo(entry, { as: "entry_entry", foreignKey: "entry"});
		entry.hasMany(result, { as: "results", foreignKey: "entry"});
		strike.belongsTo(entry, { as: "entry_entry", foreignKey: "entry"});
		entry.hasMany(strike, { as: "strikes", foreignKey: "entry"});
		studentVote.belongsTo(entry, { as: "entry_entry", foreignKey: "entry"});
		entry.hasMany(studentVote, { as: "student_votes", foreignKey: "entry"});
		entry.belongsTo(event, { as: "event_event", foreignKey: "event"});
		event.hasMany(entry, { as: "entries", foreignKey: "event"});
		eventSetting.belongsTo(event, { as: "event_event", foreignKey: "event"});
		event.hasMany(eventSetting, { as: "event_settings", foreignKey: "event"});
		resultSet.belongsTo(event, { as: "event_event", foreignKey: "event"});
		event.hasMany(resultSet, { as: "result_sets", foreignKey: "event"});
		round.belongsTo(event, { as: "event_event", foreignKey: "event"});
		event.hasMany(round, { as: "rounds", foreignKey: "event"});
		sweepEvent.belongsTo(event, { as: "event_event", foreignKey: "event"});
		event.hasMany(sweepEvent, { as: "sweep_events", foreignKey: "event"});
		jpoolJudge.belongsTo(jpool, { as: "jpool_jpool", foreignKey: "jpool"});
		jpool.hasMany(jpoolJudge, { as: "jpool_judges", foreignKey: "jpool"});
		jpoolRound.belongsTo(jpool, { as: "jpool_jpool", foreignKey: "jpool"});
		jpool.hasMany(jpoolRound, { as: "jpool_rounds", foreignKey: "jpool"});
		jpoolSetting.belongsTo(jpool, { as: "jpool_jpool", foreignKey: "jpool"});
		jpool.hasMany(jpoolSetting, { as: "jpool_settings", foreignKey: "jpool"});
		ballot.belongsTo(judge, { as: "judge_judge", foreignKey: "judge"});
		judge.hasMany(ballot, { as: "ballots", foreignKey: "judge"});
		campusLog.belongsTo(judge, { as: "judge_judge", foreignKey: "judge"});
		judge.hasMany(campusLog, { as: "campus_logs", foreignKey: "judge"});
		follower.belongsTo(judge, { as: "judge_judge", foreignKey: "judge"});
		judge.hasMany(follower, { as: "followers", foreignKey: "judge"});
		jpoolJudge.belongsTo(judge, { as: "judge_judge", foreignKey: "judge"});
		judge.hasMany(jpoolJudge, { as: "jpool_judges", foreignKey: "judge"});
		judgeSetting.belongsTo(judge, { as: "judge_judge", foreignKey: "judge"});
		judge.hasMany(judgeSetting, { as: "judge_settings", foreignKey: "judge"});
		rating.belongsTo(judge, { as: "judge_judge", foreignKey: "judge"});
		judge.hasMany(rating, { as: "ratings", foreignKey: "judge"});
		strike.belongsTo(judge, { as: "judge_judge", foreignKey: "judge"});
		judge.hasMany(strike, { as: "strikes", foreignKey: "judge"});
		ballot.belongsTo(panel, { as: "panel_panel", foreignKey: "panel"});
		panel.hasMany(ballot, { as: "ballots", foreignKey: "panel"});
		campusLog.belongsTo(panel, { as: "panel_panel", foreignKey: "panel"});
		panel.hasMany(campusLog, { as: "campus_logs", foreignKey: "panel"});
		panelSetting.belongsTo(panel, { as: "panel_panel", foreignKey: "panel"});
		panel.hasMany(panelSetting, { as: "panel_settings", foreignKey: "panel"});
		studentVote.belongsTo(panel, { as: "panel_panel", foreignKey: "panel"});
		panel.hasMany(studentVote, { as: "student_votes", foreignKey: "panel"});
		campusLog.belongsTo(person, { as: "person_person", foreignKey: "person"});
		person.hasMany(campusLog, { as: "campus_logs", foreignKey: "person"});
		caselist.belongsTo(person, { as: "person_person", foreignKey: "person"});
		person.hasMany(caselist, { as: "caselists", foreignKey: "person"});
		caselist.belongsTo(person, { as: "partner_person", foreignKey: "partner"});
		person.hasMany(caselist, { as: "partner_caselists", foreignKey: "partner"});
		coach.belongsTo(person, { as: "person_person", foreignKey: "person"});
		person.hasMany(coach, { as: "coaches", foreignKey: "person"});
		coach.belongsTo(person, { as: "created_by_person", foreignKey: "created_by"});
		person.hasMany(coach, { as: "created_by_coaches", foreignKey: "created_by"});
		conflict.belongsTo(person, { as: "person_person", foreignKey: "person"});
		person.hasMany(conflict, { as: "conflicts", foreignKey: "person"});
		conflict.belongsTo(person, { as: "conflicted_person", foreignKey: "conflicted"});
		person.hasMany(conflict, { as: "conflicted_conflicts", foreignKey: "conflicted"});
		contact.belongsTo(person, { as: "person_person", foreignKey: "person"});
		person.hasMany(contact, { as: "contacts", foreignKey: "person"});
		contact.belongsTo(person, { as: "created_by_person", foreignKey: "created_by"});
		person.hasMany(contact, { as: "created_by_contacts", foreignKey: "created_by"});
		message.belongsTo(person, { as: "person_person", foreignKey: "person"});
		person.hasMany(message, { as: "messages", foreignKey: "person"});
		permission.belongsTo(person, { as: "person_person", foreignKey: "person"});
		person.hasMany(permission, { as: "permissions", foreignKey: "person"});
		personQuiz.belongsTo(person, { as: "person_person", foreignKey: "person"});
		person.hasMany(personQuiz, { as: "person_quizzes", foreignKey: "person"});
		personSetting.belongsTo(person, { as: "person_person", foreignKey: "person"});
		person.hasMany(personSetting, { as: "person_settings", foreignKey: "person"});
		session.belongsTo(person, { as: "person_person", foreignKey: "person"});
		person.hasMany(session, { as: "sessions", foreignKey: "person"});
		tournIgnore.belongsTo(person, { as: "person_person", foreignKey: "person"});
		person.hasMany(tournIgnore, { as: "tourn_ignores", foreignKey: "person"});
		practiceStudent.belongsTo(practice, { as: "practice_practice", foreignKey: "practice"});
		practice.hasMany(practiceStudent, { as: "practice_students", foreignKey: "practice"});
		protocolSetting.belongsTo(protocol, { as: "protocol_protocol", foreignKey: "protocol"});
		protocol.hasMany(protocolSetting, { as: "protocol_settings", foreignKey: "protocol"});
		tiebreak.belongsTo(protocol, { as: "protocol_protocol", foreignKey: "protocol"});
		protocol.hasMany(tiebreak, { as: "tiebreaks", foreignKey: "protocol"});
		personQuiz.belongsTo(quiz, { as: "quiz_quiz", foreignKey: "quiz"});
		quiz.hasMany(personQuiz, { as: "person_quizzes", foreignKey: "quiz"});
		permission.belongsTo(region, { as: "region_region", foreignKey: "region"});
		region.hasMany(permission, { as: "permissions", foreignKey: "region"});
		regionSetting.belongsTo(region, { as: "region_region", foreignKey: "region"});
		region.hasMany(regionSetting, { as: "region_settings", foreignKey: "region"});
		resultValue.belongsTo(result, { as: "result_result", foreignKey: "result"});
		result.hasMany(resultValue, { as: "result_values", foreignKey: "result"});
		resultKey.belongsTo(resultSet, { as: "result_set_result_set", foreignKey: "result_set"});
		resultSet.hasMany(resultKey, { as: "result_keys", foreignKey: "result_set"});
		roomStrike.belongsTo(room, { as: "room_room", foreignKey: "room"});
		room.hasMany(roomStrike, { as: "room_strikes", foreignKey: "room"});
		rpoolRoom.belongsTo(room, { as: "room_room", foreignKey: "room"});
		room.hasMany(rpoolRoom, { as: "rpool_rooms", foreignKey: "room"});
		jpoolRound.belongsTo(round, { as: "round_round", foreignKey: "round"});
		round.hasMany(jpoolRound, { as: "jpool_rounds", foreignKey: "round"});
		panel.belongsTo(round, { as: "round_round", foreignKey: "round"});
		round.hasMany(panel, { as: "panels", foreignKey: "round"});
		roundSetting.belongsTo(round, { as: "round_round", foreignKey: "round"});
		round.hasMany(roundSetting, { as: "round_settings", foreignKey: "round"});
		rpoolRound.belongsTo(round, { as: "round_round", foreignKey: "round"});
		round.hasMany(rpoolRound, { as: "rpool_rounds", foreignKey: "round"});
		rpoolRoom.belongsTo(rpool, { as: "rpool_rpool", foreignKey: "rpool"});
		rpool.hasMany(rpoolRoom, { as: "rpool_rooms", foreignKey: "rpool"});
		rpoolRound.belongsTo(rpool, { as: "rpool_rpool", foreignKey: "rpool"});
		rpool.hasMany(rpoolRound, { as: "rpool_rounds", foreignKey: "rpool"});
		rpoolSetting.belongsTo(rpool, { as: "rpool_rpool", foreignKey: "rpool"});
		rpool.hasMany(rpoolSetting, { as: "rpool_settings", foreignKey: "rpool"});
		campusLog.belongsTo(school, { as: "school_school", foreignKey: "school"});
		school.hasMany(campusLog, { as: "campus_logs", foreignKey: "school"});
		concessionPurchase.belongsTo(school, { as: "school_school", foreignKey: "school"});
		school.hasMany(concessionPurchase, { as: "concession_purchases", foreignKey: "school"});
		contact.belongsTo(school, { as: "school_school", foreignKey: "school"});
		school.hasMany(contact, { as: "contacts", foreignKey: "school"});
		follower.belongsTo(school, { as: "school_school", foreignKey: "school"});
		school.hasMany(follower, { as: "followers", foreignKey: "school"});
		invoice.belongsTo(school, { as: "school_school", foreignKey: "school"});
		school.hasMany(invoice, { as: "invoices", foreignKey: "school"});
		judgeHire.belongsTo(school, { as: "school_school", foreignKey: "school"});
		school.hasMany(judgeHire, { as: "judge_hires", foreignKey: "school"});
		result.belongsTo(school, { as: "school_school", foreignKey: "school"});
		school.hasMany(result, { as: "results", foreignKey: "school"});
		schoolSetting.belongsTo(school, { as: "school_school", foreignKey: "school"});
		school.hasMany(schoolSetting, { as: "school_settings", foreignKey: "school"});
		settingLabel.belongsTo(setting, { as: "setting_setting", foreignKey: "setting"});
		setting.hasMany(settingLabel, { as: "setting_labels", foreignKey: "setting"});
		room.belongsTo(site, { as: "site_site", foreignKey: "site"});
		site.hasMany(room, { as: "rooms", foreignKey: "site"});
		tournSite.belongsTo(site, { as: "site_site", foreignKey: "site"});
		site.hasMany(tournSite, { as: "tourn_sites", foreignKey: "site"});
		coach.belongsTo(student, { as: "student_student", foreignKey: "student"});
		student.hasOne(coach, { as: "coach", foreignKey: "student"});
		entryStudent.belongsTo(student, { as: "student_student", foreignKey: "student"});
		student.hasMany(entryStudent, { as: "entry_students", foreignKey: "student"});
		practiceStudent.belongsTo(student, { as: "student_student", foreignKey: "student"});
		student.hasMany(practiceStudent, { as: "practice_students", foreignKey: "student"});
		result.belongsTo(student, { as: "student_student", foreignKey: "student"});
		student.hasMany(result, { as: "results", foreignKey: "student"});
		studentSetting.belongsTo(student, { as: "student_student", foreignKey: "student"});
		student.hasMany(studentSetting, { as: "student_settings", foreignKey: "student"});
		sweepEvent.belongsTo(sweepSet, { as: "sweep_set_sweep_set", foreignKey: "sweep_set"});
		sweepSet.hasMany(sweepEvent, { as: "sweep_events", foreignKey: "sweep_set"});
		sweepInclude.belongsTo(sweepSet, { as: "parent_sweep_set", foreignKey: "parent"});
		sweepSet.hasMany(sweepInclude, { as: "sweep_includes", foreignKey: "parent"});
		sweepInclude.belongsTo(sweepSet, { as: "child_sweep_set", foreignKey: "child"});
		sweepSet.hasMany(sweepInclude, { as: "child_sweep_includes", foreignKey: "child"});
		sweepRule.belongsTo(sweepSet, { as: "sweep_set_sweep_set", foreignKey: "sweep_set"});
		sweepSet.hasMany(sweepRule, { as: "sweep_rules", foreignKey: "sweep_set"});
		campusLog.belongsTo(tourn, { as: "tourn_tourn", foreignKey: "tourn"});
		tourn.hasMany(campusLog, { as: "campus_logs", foreignKey: "tourn"});
		category.belongsTo(tourn, { as: "tourn_tourn", foreignKey: "tourn"});
		tourn.hasMany(category, { as: "categories", foreignKey: "tourn"});
		concession.belongsTo(tourn, { as: "tourn_tourn", foreignKey: "tourn"});
		tourn.hasMany(concession, { as: "concessions", foreignKey: "tourn"});
		email.belongsTo(tourn, { as: "tourn_tourn", foreignKey: "tourn"});
		tourn.hasMany(email, { as: "emails", foreignKey: "tourn"});
		file.belongsTo(tourn, { as: "tourn_tourn", foreignKey: "tourn"});
		tourn.hasMany(file, { as: "files", foreignKey: "tourn"});
		fine.belongsTo(tourn, { as: "tourn_tourn", foreignKey: "tourn"});
		tourn.hasMany(fine, { as: "fines", foreignKey: "tourn"});
		message.belongsTo(tourn, { as: "tourn_tourn", foreignKey: "tourn"});
		tourn.hasMany(message, { as: "messages", foreignKey: "tourn"});
		pattern.belongsTo(tourn, { as: "tourn_tourn", foreignKey: "tourn"});
		tourn.hasMany(pattern, { as: "patterns", foreignKey: "tourn"});
		permission.belongsTo(tourn, { as: "tourn_tourn", foreignKey: "tourn"});
		tourn.hasMany(permission, { as: "permissions", foreignKey: "tourn"});
		protocol.belongsTo(tourn, { as: "tourn_tourn", foreignKey: "tourn"});
		tourn.hasMany(protocol, { as: "protocols", foreignKey: "tourn"});
		quiz.belongsTo(tourn, { as: "tourn_tourn", foreignKey: "tourn"});
		tourn.hasMany(quiz, { as: "quizzes", foreignKey: "tourn"});
		resultSet.belongsTo(tourn, { as: "tourn_tourn", foreignKey: "tourn"});
		tourn.hasMany(resultSet, { as: "result_sets", foreignKey: "tourn"});
		rpool.belongsTo(tourn, { as: "tourn_tourn", foreignKey: "tourn"});
		tourn.hasMany(rpool, { as: "rpools", foreignKey: "tourn"});
		school.belongsTo(tourn, { as: "tourn_tourn", foreignKey: "tourn"});
		tourn.hasMany(school, { as: "schools", foreignKey: "tourn"});
		strike.belongsTo(tourn, { as: "tourn_tourn", foreignKey: "tourn"});
		tourn.hasMany(strike, { as: "strikes", foreignKey: "tourn"});
		sweepSet.belongsTo(tourn, { as: "tourn_tourn", foreignKey: "tourn"});
		tourn.hasMany(sweepSet, { as: "sweep_sets", foreignKey: "tourn"});
		timeslot.belongsTo(tourn, { as: "tourn_tourn", foreignKey: "tourn"});
		tourn.hasMany(timeslot, { as: "timeslots", foreignKey: "tourn"});
		tournCircuit.belongsTo(tourn, { as: "tourn_tourn", foreignKey: "tourn"});
		tourn.hasMany(tournCircuit, { as: "tourn_circuits", foreignKey: "tourn"});
		tournFee.belongsTo(tourn, { as: "tourn_tourn", foreignKey: "tourn"});
		tourn.hasMany(tournFee, { as: "tourn_fees", foreignKey: "tourn"});
		tournIgnore.belongsTo(tourn, { as: "tourn_tourn", foreignKey: "tourn"});
		tourn.hasMany(tournIgnore, { as: "tourn_ignores", foreignKey: "tourn"});
		tournSetting.belongsTo(tourn, { as: "tourn_tourn", foreignKey: "tourn"});
		tourn.hasMany(tournSetting, { as: "tourn_settings", foreignKey: "tourn"});
		tournSite.belongsTo(tourn, { as: "tourn_tourn", foreignKey: "tourn"});
		tourn.hasMany(tournSite, { as: "tourn_sites", foreignKey: "tourn"});
		webpage.belongsTo(tourn, { as: "tourn_tourn", foreignKey: "tourn"});
		tourn.hasMany(webpage, { as: "webpages", foreignKey: "tourn"});
		weekend.belongsTo(tourn, { as: "tourn_tourn", foreignKey: "tourn"});
		tourn.hasMany(weekend, { as: "weekends", foreignKey: "tourn"});

		return {
				ad,
				autoqueue,
				ballot,
				campusLog,
				caselist,
				category,
				categorySetting,
				changeLog,
				chapter,
				chapterCircuit,
				chapterJudge,
				chapterSetting,
				circuit,
				circuitMembership,
				circuitSetting,
				coach,
				concession,
				concessionOption,
				concessionPurchase,
				concessionPurchaseOption,
				concessionType,
				conflict,
				contact,
				diocese,
				district,
				email,
				entry,
				entrySetting,
				entryStudent,
				event,
				eventSetting,
				file,
				fine,
				follower,
				hotel,
				invoice,
				jpool,
				jpoolJudge,
				jpoolRound,
				jpoolSetting,
				judge,
				judgeHire,
				judgeSetting,
				message,
				nsdaCategory,
				panel,
				panelSetting,
				pattern,
				permission,
				person,
				personQuiz,
				personSetting,
				practice,
				practiceStudent,
				protocol,
				protocolSetting,
				qualifier,
				quiz,
				rating,
				ratingSubset,
				ratingTier,
				region,
				regionFine,
				regionSetting,
				result,
				resultKey,
				resultSet,
				resultValue,
				room,
				roomStrike,
				round,
				roundSetting,
				rpool,
				rpoolRoom,
				rpoolRound,
				rpoolSetting,
				school,
				schoolSetting,
				score,
				server,
				session,
				setting,
				settingLabel,
				shift,
				site,
				strike,
				student,
				studentBallot,
				studentSetting,
				studentVote,
				sweepAward,
				sweepAwardEvent,
				sweepEvent,
				sweepInclude,
				sweepRule,
				sweepSet,
				tabroomSetting,
				tiebreak,
				timeslot,
				topic,
				tourn,
				tournCircuit,
				tournFee,
				tournIgnore,
				tournSetting,
				tournSite,
				webpage,
				weekend,
		};
}
