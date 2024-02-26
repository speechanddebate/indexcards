// These paths are ones that require a share_key
import sendShareFile from '../../../controllers/ext/share/sendShareFile.js';
import makeExtShareRooms from '../../../controllers/ext/share/makeRooms.js';

export default [
	{ path : '/ext/share/sendShareFile'  , module : sendShareFile }  ,
	{ path : '/ext/share/makeShareRooms' , module : makeExtShareRooms } ,
];
