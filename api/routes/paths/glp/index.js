// The home of all site admin (God Like Powers!) functions.
import {
	getInstances,
	getInstanceStatus,
	getTabroomInstance,
	changeInstanceCount,
} from '../../../controllers/glp/servers.js';

export default [
	{ path : '/glp/servers/show'                 , module : getInstances }        ,
	{ path : '/glp/servers/show/{linodeId}'      , module : getTabroomInstance }  ,
	{ path : '/glp/servers/status'               , module : getInstanceStatus }   ,
	{ path : '/glp/servers/changeCount'          , module : changeInstanceCount } ,
	{ path : '/glp/servers/changeCount/{target}' , module : changeInstanceCount } ,
];
