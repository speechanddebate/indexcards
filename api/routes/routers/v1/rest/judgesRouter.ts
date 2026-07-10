import { Router } from 'express';
import { ValidateRequest } from '../../../../middleware/validation.js';
import { requireLogin } from '../../../../middleware/authorization/authorization.js';
import z from 'zod';
import judgesController from '../../../../controllers/rest/judgesController.js';
import { UnlinkedJudge } from '../../../openapi/schemas/index.js';

const router = Router();

router.route('/unlinked/search')
	.get(requireLogin, ValidateRequest,judgesController.unlinkedSearch).openapi = {
		summary: 'Search for unlinked judges',
		path: '/rest/judges/unlinked/search',
		operationId: 'RestJudgesUnlinkedSearch',
		description: 'Search for judges that are not linked to a Tabroom account.',
		tags: ['Orval', 'Judges'],
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
				description: 'A list of unlinked judges matching the search criteria',
				content: {
					'application/json': {
						schema: z.array(UnlinkedJudge),
					},
				},
			},
		},
	};

export default router;