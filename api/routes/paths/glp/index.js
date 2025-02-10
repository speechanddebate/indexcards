// The home of all site admin (God Like Powers!) functions.
import {
	getInstances,
	getInstanceStatus,
	getTabroomInstance,
	rebootInstance,
	changeInstanceCount,
	getTabroomUsage,
} from '../../../controllers/glp/servers.js';

import {
	throwTestError,
	testSlackNotification,
} from '../../../controllers/glp/testmails.js';

export default [
	{ path : '/glp/servers/usage'                , module : getTabroomUsage }       ,
	{ path : '/glp/servers/show'                 , module : getInstances }          ,
	{ path : '/glp/servers/show/{linodeId}'      , module : getTabroomInstance }    ,
	{ path : '/glp/servers/status'               , module : getInstanceStatus }     ,
	{ path : '/glp/servers/reboot/{linodeId}'    , module : rebootInstance }        ,
	{ path : '/glp/servers/changeCount'          , module : changeInstanceCount }   ,
	{ path : '/glp/servers/changeCount/{target}' , module : changeInstanceCount }   ,
	{ path : '/glp/mailtest/error'               , module : throwTestError }        ,
	{ path : '/glp/mailtest/slack'               , module : testSlackNotification } ,
];
