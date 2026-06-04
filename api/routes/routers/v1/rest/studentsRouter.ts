import { Router } from 'express';
import * as con from '../../../../controllers/rest/studentsController.js';
import { ValidateRequest } from '../../../../middleware/validation.js';
import { requireLogin } from '../../../../middleware/authorization/authorization.js';
import z from 'zod';
import { UnlinkedStudentSearch } from '../../../openapi/schemas/index.ts';

const router = Router();

router.route('/unlinked/search')
  .get(requireLogin, ValidateRequest, con.unlinkedSearch).openapi = {
  	summary: 'Search for unlinked students',
  	operationId: 'RestStudentsUnlinkedSearch',
  	description: 'Search for students that are not linked to a Tabroom account.',
  	path: '/rest/students/unlinked/search',
  	tags: ['Students', 'Orval'],
  	requestParams: {
  		query: z.object({
			limit: z.coerce.number().default(100).meta({ description: 'Maximum number of results to return' }),
			offset: z.coerce.number().default(0).meta({ description: 'Number of results to skip for pagination' }),
  			first: z.string().optional().meta({ description: 'First name to search for' }),
  			last: z.string().optional().meta({ description: 'Last name to search for' }),
  		}),
  	},
  	responses: {
  		200: {
  			description: 'List of unlinked students matching search criteria',
  			content: {
  				'application/json': {
  					schema: z.array(UnlinkedStudentSearch),
  				},
  			},
  		},
  	},
  };

export default router;
