import Router from 'express';
import { searchTourns, searchCircuitTourns } from '../../../../../controllers/public/search.js';

const router = Router();

router.get('/search/:time/:searchString/circuit/:circuitId', searchCircuitTourns).openapi = {
	path: '/public/search/{time}/{searchString}/circuit/{circuitId}',
	summary: 'Search circuit tournaments',
	tags: ['legacy', 'Public Search'],
	parameters: [
		{ in: 'path', name: 'time', required: true, schema: { type: 'string' } },
		{ in: 'path', name: 'searchString', required: true, schema: { type: 'string' } },
		{ in: 'path', name: 'circuitId', required: true, schema: { type: 'integer' } },
	],
	responses: { 200: { description: 'Circuit tournaments' }, default: { $ref: '#/components/responses/ErrorResponse' } },
};
router.get('/search/:time/:searchString', searchTourns).openapi = {
	path: '/public/search/{time}/{searchString}',
	summary: 'Search tournaments',
	tags: ['legacy', 'Public Search'],
	parameters: [
		{ in: 'path', name: 'time', required: true, schema: { type: 'string' } },
		{ in: 'path', name: 'searchString', required: true, schema: { type: 'string' } },
	],
	responses: { 200: { description: 'Tournaments' }, default: { $ref: '#/components/responses/ErrorResponse' } },
};

export default router;