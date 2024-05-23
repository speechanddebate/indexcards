// These paths are particular to tournament administration, and so require a
// logged in user with access to the tournament in question.

// Router controllers
import { inboxList, unreadCount, markMessageRead, markMessageDeleted } from '../../../controllers/user/inbox.js';

export default [
	{ path : '/user/inbox/list'        , module : inboxList }          ,
	{ path : '/user/inbox/unread'      , module : unreadCount }        ,
	{ path : '/user/inbox/markRead'    , module : markMessageRead }    ,
	{ path : '/user/inbox/markDeleted' , module : markMessageDeleted } ,
];
