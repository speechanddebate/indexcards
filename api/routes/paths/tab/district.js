// Router controllers
import { updateDistrict } from '../../../controllers/tab/district/index.js';
import { divideSchools } from '../../../controllers/tab/district/supps.js';

export default [
	{ path : '/tab/{tournId}/district/{districtId}'  , module : updateDistrict } ,
	{ path : '/tab/{tournId}/district/divideSchools/{numTeams}' , module : divideSchools }  ,
];
