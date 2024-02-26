// Router controllers
import { updateCategory } from '../../../controllers/tab/category/index.js';
import { changeAccess } from '../../../controllers/tab/category/access.js';

export default [
	{ path : '/tab/{tournId}/category/{categoryId}'                   , module : updateCategory } ,
	{ path : '/tab/{tournId}/category/{categoryId}/access/{personId}' , module : changeAccess }   ,
];
