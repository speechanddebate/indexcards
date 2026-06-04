import { Router } from 'express';
import con from '../../../../controllers/rest/QuizController.js';
import z from 'zod';
import { Quiz } from '../../../openapi/schemas/index.ts';

const router = Router();

router.route('/')
  .get(con.getQuizzes).openapi = {
  	summary: 'Get all quizzes',
	path: '/rest/quizzes',
  	operationId: 'RestQuizzes',
  	description: 'Retrieve a list of all site wide quizzes.',
	tags: ['Quizzes','Orval'],
	requestParams: {
		query: z.object({
			limit: z.number().optional().describe('Number of quizzes to return'),
			offset: z.number().optional().describe('Number of quizzes to skip'),
		}),
	},
	responses: {
		200: {
			description: 'List of quizzes',
			content: {
				'application/json': {
					schema: z.array(Quiz),
				},
			},
		},
	},
  };

  export default router;
