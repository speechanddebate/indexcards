// Router controllers
import { updateCategory, randomizeNames } from '../../../controllers/tab/category/index.js';
import { changeAccess } from '../../../controllers/tab/category/access.js';

export default [
	{ path : '/tab/{tournId}/category/{categoryId}'                   , module : updateCategory } ,
	{ path : '/tab/{tournId}/category/{categoryId}/access/{personId}' , module : changeAccess }   ,
	{ path : '/tab/{tournId}/category/{categoryId}/randomize'         , module : randomizeNames } ,
];
