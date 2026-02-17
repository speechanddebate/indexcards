import { NotImplemented, NotFound, BadRequest } from '../../helpers/problem.js';
import categoryRepo from '../../repos/categoryRepo.js';
export async function getCategory(req, res) {
	const { categoryId } = req.params;
	if (!categoryId) return BadRequest(req,res,'Category ID is required');
	const category = await categoryRepo.getCategory(categoryId,{settings: true});
	if (category?.tournId != req.params.tournId)
		return NotFound(req,res,'Category not found');
	res.json(category);
}
getCategory.openapi = {
	summary: 'Get category',
	tags: ['Category'],
	responses: {
		200: {
			description: 'Category details',
			content: {
				'application/json': {
					schema: {
						$ref: '#/components/schemas/Category',
					},
				},
			},
		},
		404: {$ref: '#/components/responses/NotFound'},
	},
};
export async function getCategories(req, res) {
	const { tournId } = req.params;
	if (!tournId) return BadRequest(req,res,'Tournament ID is required');
	const categories = await categoryRepo.getCategories({ tournId });

	res.json(categories);
}
getCategories.openapi = {
	summary: 'Get categories',
	tags: ['Category'],
	responses: {
		200: {
			description: 'List of categories',
			content: {
				'application/json': {
					schema: {
						type: 'array',
						items: { $ref: '#/components/schemas/Category' },
					},
				},
			},
		},
	},
};
export function createCategory(req, res) {
	throw new NotImplemented(req,res,'function not implemented');
}
createCategory.openapi = {
	summary: 'Create category',
	tags: ['Category'],
};

export async function deleteCategory(req, res) {
	if (!req.params.tournId) return BadRequest(req,res,'Tournament ID is required');
	if (!req.params.categoryId) return BadRequest(req,res,'Category ID is required');

	const category = await categoryRepo.getCategory(req.params.categoryId);
	if (!category) return NotFound(req,res,'Category not found');
	if(category.tournId != req.params.tournId) return BadRequest(req,res,'Category does not belong to this tournament');
	await categoryRepo.deleteCategory(req.params.categoryId);

	res.status(204).send();
}
deleteCategory.openapi = {
	summary: 'Delete category',
	tags: ['Category'],
};

export function updateCategory(req, res) {
	throw new NotImplemented(req,res,'function not implemented');
}
updateCategory.openapi = {
	summary: 'Update category',
	tags: ['Category'],
};

export default {
	getCategory,
	getCategories,
	createCategory,
	deleteCategory,
	updateCategory,
};