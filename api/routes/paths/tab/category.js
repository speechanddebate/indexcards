// Router controllers
import { changeAccess } from '../../../controllers/tab/category/access.js';
import { updateCategoryLearn } from '../../../controllers/tab/category/learn.js';
import { updateCategory, randomizeNames } from '../../../controllers/tab/category/index.js';

export default [
	{ path : '/tab/{tournId}/category/{categoryId}'                   , module : updateCategory } ,
	{ path : '/tab/{tournId}/category/{categoryId}/access/{personId}' , module : changeAccess }   ,
	{ path : '/tab/{tournId}/category/{categoryId}/randomize'         , module : randomizeNames } ,
	{ path : '/tab/{tournId}/category/{categoryId}/updateLearn'       , module : updateCategoryLearn } ,

];
