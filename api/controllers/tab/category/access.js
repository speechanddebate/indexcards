// Category level access maniuplation

import { BadRequest, Forbidden, NotFound, UnexpectedError } from '../../../helpers/problem';

export const changeAccess = {

	// Add permissions that are not there already
	POST : async (req, res) => {
		return UnexpectedError(res,`Stub because this feature not yet implemented`);
	},

	// Alter existing permissions
	PUT: async (req, res) => {

		const db = req.db;
		const targetPerson = await req.db.summon(db.person, req.params.personId);
		const targetCategory = await req.db.summon(db.category, req.params.categoryId);

		if (!targetPerson || !targetCategory) {
			return BadRequest(res, 'No person found with that Tabroom ID');
		}

		if (req.session.perms.tourn[targetCategory.tourn] !== 'owner'
			&& req.session.perms.tourn[targetCategory.tourn] !== 'tabber'
		) {
			return Forbidden(res, `You do not have access to change permissions in ${targetCategory.abbr}`);
		}

		const currentPerm = await db.permission.findOne({
			where      : {
				person : targetPerson.id,
				category  : targetCategory.id,
			},
		});

		if (!currentPerm) {
			return Forbidden(res, `User ${targetPerson.email} does not have access ${targetCategory.abbr} and so it cannot be altered`);
		}

		if (currentPerm.tag === 'checker') {
			currentPerm.tag = 'tabber';
		} else {
			currentPerm.tag = 'checker';
		}

		await currentPerm.save();
		const description = `${targetPerson.email}'s access to ${targetCategory.abbr} is now ${currentPerm.tag}`;

		const replace = [
			{
				id: `category_${targetCategory.id}_${targetPerson.id}_role`,
				content: currentPerm.tag.toUpperCase(),
			},
		];
		await db.changeLog.create({
			person     : req.session.person,
			tourn      : req.params.tournId,
			category      : targetCategory.id,
			tag        : 'access',
			created_at : Date(),
			description,
		});

		res.status(200).json({
			error   : false,
			message : description,
			replace,
		});
	},

	// Show permissions for a user
	GET : async (req, res) => {
		res.status(200).json({ message: 'Hello', params: req.params, body: req.body });
	},

	// Delete a user's access to this tournament
	DELETE: async (req, res) => {

		const db = req.db;
		const targetCategory = await req.db.summon(db.category, req.params.categoryId);
		const targetPerson = await req.db.summon(db.person, req.params.personId);

		if (req.session.perms.tourn[targetCategory.tourn] !== 'owner'
			&& req.session.perms.tourn[targetCategory.tourn] !== 'tabber'
		) {
			return Forbidden(res, `You do not have access to change permissions in ${targetCategory.abbr}`);
		}

		await req.db.sequelize.query(`
			delete
				perm.*
			from permission perm
				where perm.person = :personId
				and perm.category = :categoryId
		`, {
			replacements: { ...req.params },
			type: req.db.sequelize.QueryTypes.DELETE,
		});

		const log = await db.changeLog.create({
			person      : req.session.person,
			tourn       : req.params.tournId,
			category       : targetCategory.id,
			tag         : 'access',
			created_at  : Date(),
			description : `${targetPerson.email} access removed from ${targetCategory.abbr}`,
		});

		res.status(200).json({
			error   : false,
			destroy : `category_${targetCategory.id}_${targetPerson.id}`,
			message : log.description,
		});
	},
};

// Functions that manage who gets auto backups for a whole tournament

export const backupAccess = {

	POST: async (req, res) => {

		const targetPerson = await req.db.summon(req.db.person, req.params.personId);
		const targetCategory = await req.db.summon(req.db.category, req.params.categoryId);

		if (!targetPerson) {
			return NotFound(res, 'No tabroom account was found with that email');
		}

		if (targetPerson.no_email) {
			return BadRequest(res, 'That Tabroom account is set to not allow emails to be sent to it');
		}

		const backupAccounts = await req.db.categorySetting.findOne({
			where : {
				category: req.params.categoryId,
				tag  : 'backup_followers',
			},
		});

		const followers = [];

		if (backupAccounts?.id) {
			if (backupAccounts.value === 'json') {
				followers.push(...(JSON.parse(backupAccounts.value_text)));
			} else {
				backupAccounts.value = 'json';
				followers.push(...backupAccounts.value.split(','));
			}
		}

		if (!followers.includes(targetPerson.id)) {
			followers.push(targetPerson.id);
		}

		const uniqueFollowers = [...new Set(followers)];

		if (backupAccounts?.id) {
			backupAccounts.value_text = uniqueFollowers;
			await backupAccounts.update();
		} else {
			await req.db.categorySetting.create({
				category      : req.params.categoryId,
				tag        : 'backup_followers',
				value      : 'json',
				value_text : uniqueFollowers,
			});
		}

		res.status(200).json(`Added ${targetPerson.email} as a backup follower for ${targetCategory.abbr}`);
	},

	DELETE : async (req, res) => {

		const backupAccounts = await req.db.categorySetting.findOne({
			where : {
				category: req.params.categoryId,
				tag  : 'backup_followers',
			},
		});

		if (!backupAccounts?.id) {
			res.status(200).json(`Category has no current backup followers`);
		}

		const followers = [];
		if (backupAccounts.value === 'json') {
			followers.push(...(JSON.parse(backupAccounts.value_text)));
		} else {
			backupAccounts.value = 'json';
			followers.push(...backupAccounts.value.split(','));
		}

		const index = followers.indexOf(req.params.personId);
		if (index > -1) {
			followers.splice(index, 1);
		}

		if (followers.length < 1) {
			await backupAccounts.destroy();
		} else {
			backupAccounts.value_text = followers;
			await backupAccounts.update();
		}

		res.status(200).json(`Backup follower removed`);
	},
};

export default changeAccess;

changeAccess.POST.apiDoc = {
	summary     : 'Change, delete and add category access permissions for users',
	operationId : 'listSchools',
	parameters: [
		{
			in          : 'parameters',
			name        : 'personId',
			description : 'Person ID',
			required    : true,
			schema      : {
				type    : 'integer',
				minimum : 1,
			},
		},
		{
			in          : 'parameters',
			name        : 'categoryId',
			description : 'Category ID',
			required    : true,
			schema      : {
				type    : 'integer',
				minimum : 1,
			},
		},
	],
	responses: {
		200: {
			description: 'Success! Messages included',
		},
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
	tags: ['tab/category/access'],
};

changeAccess.DELETE.apiDoc = {
	summary     : 'Change, delete and add category-level permissions for user accounts',
	operationId : 'listSchools',
	parameters: [
		{
			in          : 'parameters',
			name        : 'categoryId',
			description : 'Category ID',
			required    : true,
			schema      : {
				type    : 'integer',
			},
		},
		{
			in          : 'parameters',
			name        : 'personId',
			description : 'Person ID',
			required    : true,
			schema      : {
				type    : 'integer',
			},
		},
	],
	responses: {
		200: {
			description: 'Success! Messages included',
		},
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
	tags: ['tab/category/access'],
};
