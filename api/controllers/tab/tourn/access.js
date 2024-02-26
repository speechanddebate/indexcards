import { errorLogger } from '../../../helpers/logger';

// Functions that manage overall tournament access.

export const changeAccess = {

	// Add permissions that are not there already.  Currently in Perl.
	// Will port over.

	POST : async (req, res) => {
		res.status(400).json('Not yet implemented');
	},

	// Alter existing permissions
	PUT: async (req, res) => {

		const db = req.db;
		const targetPerson = await req.db.summon(db.person, req.params.personId);

		if (!targetPerson) {
			res.status(401).json('No person found with that Tabroom ID');
			return;
		}

		let tag = req.body.access_level;
		if (tag === 'choose') {
			tag = req.body.property_value;
		}

		if (!tag) {
			errorLogger.info(req.body);
			errorLogger.info(tag);
			res.status(200).json('No request body sent with a proper access type specified');
			return;
		}

		if (tag === 'none' || tag === 'undefined') {

			// Remove any and all tourn level permissions from the user, except owner
			// level permissions if I am not an owner myself.

			const currentPerms = await db.permission.findAll({
				where      : {
					person : targetPerson.id,
					tourn  : req.params.tournId,
				},
				include : [
					{ model: db.event, as: 'Event' },
					{ model: db.category, as: 'Category' },
				],
			});

			let description = '';

			currentPerms.forEach( async (perm) => {
				if (
					perm.Event
					|| perm.Category
					|| (perm.tag === 'owner' && req.perms.tag !== 'owner')
				) {
					return;
				}
				description += `${perm.tag} level tournament permissions removed from ${targetPerson.email}`;
				await perm.destroy();
			});

			if (description) {
				await db.changeLog.create({
					person     : req.session.person,
					tourn      : req.params.tournId,
					tag        : 'access',
					created_at : Date(),
					description,
				});

				res.status(200).json(description);
				return;
			}

			res.status(200).json(`No existing tournament wide permissions found for ${targetPerson.email}`);
			return;
		}

		if (tag === 'contact') {

			// Only a contact or owner may adjust who is a contact

			if (
				req.perms.tag !== 'owner'
				&& !(targetPerson.id === req.session.person && req.perms.contact)
			) {
				res.status(401).json('Only tournament owners may adjust tournament contacts other than themselves');
				return;
			}

			const currentPerm = await db.permission.findOne({
				where      : {
					person : targetPerson.id,
					tag,
					tourn  : req.params.tournId,
				},
			});

			if (req.body.property_value) {

				if (currentPerm) {
					res.status(200).json(`User ${targetPerson.email} is already a tournament contact`);
					return;
				}

				await db.permission.create({
					person     : targetPerson.id,
					tourn      : req.params.tournId,
					tag,
					created_by : req.session.person,
				});

				const description = `${targetPerson.email} has been made a tournament contact`;

				await db.changeLog.create({
					person     : req.session.person,
					tourn      : req.params.tournId,
					tag        : 'access',
					created_at : Date(),
					description,
				});

				res.status(200).json(description);
				return;
			}

			// I should not be a contact!
			if (!currentPerm) {
				res.status(400).json(`User ${targetPerson.email} is not a tournament contact`);
				return;
			}

			await db.permission.destroy({
				where: {
					person     : targetPerson.id,
					tourn      : req.params.tournId,
					tag,
				},
			});

			const description = `${targetPerson.email} is no longer a tournament contact`;

			await db.changeLog.create({
				person     : req.session.person,
				tourn      : req.params.tournId,
				tag        : 'access',
				created_at : Date(),
				description,
			});

			res.status(200).json(description);
			return;
		}

		const targetTags = {
			owner: {
				exclude : ['owner'],
				mustBe  : ['owner'],
			},
			tabber: {
				exclude : ['tabber', 'owner'],
				mustBe  : ['tabber', 'owner'],
			},
			checker: {
				exclude : ['owner', 'tabber', 'checker'],
				mustBe  : ['owner', 'tabber'],
			},
		};

		const target = targetTags[tag];

		if (!target) {
			res.status(401).json(`Access type ${req.params.access_type} unknown`);
			return;
		}

		if ( !target.mustBe.includes(req.perms.tag)) {
			res.status(401).json('You do not have sufficient access to grant that level of permissions');
			return;
		}

		const currentPerms = await db.permission.findAll({
			where      : {
				person : targetPerson.id,
				tourn  : req.params.tournId,
			},
			include : [
				{ model: db.event, as: 'Event' },
				{ model: db.category, as: 'Category' },
			],
		});

		let currentPerm = {};

		currentPerms.forEach( perm => {
			if (!perm.Event && !perm.Category) {
				currentPerm = perm;
			}
		});

		if (currentPerm?.tag === tag) {
			res.status(400).json(`User ${targetPerson.email} already has tournament wide ${tag} permissions`);
			return;
		}

		if (currentPerm?.id) {
			currentPerm.tag = tag;
			currentPerm.created_by = req.session.person;
			await currentPerm.save();
		} else {

			//	await db.permission.destroy({
			//		person     : targetPerson.id,
			//		tourn      : req.params.tournId,
			//	});

			await db.permission.create({
				person     : targetPerson.id,
				tourn      : req.params.tournId,
				created_by : req.session.person,
				tag,
			});
		}

		const description = `${targetPerson.email} granted tournament wide ${tag} permissions`;
		await db.changeLog.create({
			person     : req.session.person,
			tourn      : req.params.tournId,
			tag        : 'access',
			created_at : Date(),
			description,
		});

		res.status(200).json(description);
	},

	// Show permissions for a user
	GET : async (req, res) => {
		res.status(200).json({ message: 'Hello', params: req.params, body: req.body });
	},

	// Delete a user's access to this tournament
	DELETE: async (req, res) => {

		const targetPerms = await req.db.sequelize.query(`
			select
				perm.id, perm.tag, perm.event, perm.category
			from permission perm
				where perm.person = :personId
				and perm.tourn = :tournId
		`, {
			replacements: { ...req.params },
			type: req.db.sequelize.QueryTypes.SELECT,
		});

		const deletePerms = [];

		for await (const perm of targetPerms) {

			if (
				perm.tag === 'owner'
				&& req.perms.tag !== 'owner'
			) {
				res.status(401).json('Only an owner-level account may delete another owner account!');
				return;
			}

			deletePerms.push(perm.id);
		}

		if (deletePerms.length > 0) {

			try {
				await req.db.permission.destroy({
					where: { id: deletePerms },
				});

			} catch (err) {
				errorLogger.error(err);
				return;
			}

			let description;

			try {
				const targetPerson = await req.db.summon(req.db.person, req.params.personId);
				description = `All tournament access removed from ${targetPerson.email}`;
			} catch (err) {
				errorLogger.error(err);
				return;
			}

			// I really fucking hate that I have to do this myself EVERY TIME
			// and cannot rely on the upstream to handle the most obvious errors
			// in the world.

			try {
				const logCreate = {
					tourn       : req.params.tournId,
					person      : req.session.person,
					tag         : 'access',
					created_at  : Date(),
					description,
				};

				await req.db.changeLog.create(logCreate);
			} catch (err) {
				errorLogger.error(err);
				return;
			}

			res.status(200).json({
				error   : false,
				destroy : req.params.personId,
				message : description,
			});
			return;
		}

		res.status(400).json({
			error   : false,
			destroy : req.params.personId,
			message : 'That user does not have current permissions to this tournament',
		});

	},
};

// Functions that manage who gets auto backups for a whole tournament

export const backupAccess = {

	POST: async (req, res) => {

		const newAccount = await req.db.person.findOne({
			where : {
				email: req.params.personEmail,
			},
		});

		if (!newAccount) {
			res.status(400).json('No tabroom account was found with that email');
		}

		if (newAccount.no_email) {
			res.status(400).json('That Tabroom account is set to not allow emails to be sent to it');
		}

		const backupAccounts = await req.db.tournSetting.findOne({
			where : {
				tourn: req.params.tournId,
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

		if (!followers.includes(req.params.personId)) {
			followers.push(newAccount.id);
		}

		const uniqueFollowers = [...new Set(followers)];

		if (backupAccounts?.id) {
			backupAccounts.value_text = uniqueFollowers;
			await backupAccounts.update();
		} else {
			await req.db.tournSetting.create({
				tourn      : req.params.tournId,
				tag        : 'backup_followers',
				value      : 'json',
				value_text : uniqueFollowers,
			});
		}

		res.status(200).json(`Added ${newAccount.email} as a tournament-wide backup follower`);
	},

	DELETE : async (req, res) => {

		const backupAccounts = await req.db.tournSetting.findOne({
			where : {
				tourn: req.params.tournId,
				tag  : 'backup_followers',
			},
		});

		if (!backupAccounts?.id) {
			res.status(200).json(`Tournament has no current backup followers`);
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
	summary     : 'Change, delete and add tournament permissions for user accounts',
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
			name        : 'property_name',
			description : 'Access Level',
			required    : false,
			schema      : {
				type    : 'string',
				enum    : ['owner','tabber','checker','by_event'],
			},
		},
	],
	responses: {
		200: {
			description: 'Success! Messages included',
		},
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
	tags: ['tab/access'],
};

changeAccess.DELETE.apiDoc = {
	summary     : 'Change, delete and add tournament permissions for user accounts',
	operationId : 'listSchools',
	parameters: [
		{
			in          : 'parameters',
			name        : 'tournId',
			description : 'Tournament ID',
			required    : true,
			schema      : {
				type    : 'integer',
			},
		},
		{
			in          : 'parameters',
			name        : 'personId',
			description : 'Accessor ID',
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
	tags: ['tab/access'],
};
