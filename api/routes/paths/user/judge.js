// These paths are particular to tournament administration, and so require a
// logged in user with access to the tournament in question.

// Router controllers
import { checkBallotAccess, checkActive, getBallotSides, saveRubric } from '../../../controllers/user/judge/ballot.js';

export default [
	{ path : '/user/judge/{judgeId}/active'                                , module : checkActive }       ,
	{ path : '/user/judge/{judgeId}/ballot/rubric'                         , module : saveRubric }        ,
	{ path : '/user/judge/{judgeId}/section/{sectionId}/checkBallotAccess' , module : checkBallotAccess } ,
	{ path : '/user/judge/{judgeId}/section/{sectionId}/getBallotSides'    , module : getBallotSides }    ,
];
