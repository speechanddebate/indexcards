import { errorLogger } from '../../../helpers/logger.js';
import { BadRequest, Forbidden, NotFound, NotImplemented } from '../../../helpers/problem.js';
import db from '../../../data/db.js';

// Functions that manage overall tournament access.

// Show permissions for a user
export async function getAccess(req, res) {
	return NotImplemented(req, res);
}
// Add permissions that are not there already.  Currently in Perl.
// Will port over.
export async function createAccess(req, res) {
	return NotImplemented(req, res);
}

export async function updateAccess(req, res) {
	const targetPerson = await db.summon(db.person, req.params.personId);

	if (!targetPerson) {
		return NotFound(req, res, 'No person found with that Tabroom ID');
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
			raw: true,
		});

		let description = '';
		const promises = [];

		for await (const perm of currentPerms) {

			if (perm.tag !== 'contact') {
				if (
					perm['Event.id']
					|| perm['Category.id']
					|| (perm.tag === 'owner' && req.session.perms.tourn[req.params.tournId] !== 'owner')
				) {

					console.log(`Skipping deletion of ${perm.id} due to it not being tournament wide`);

				} else {

					description += `${perm.tag} level tournament permissions removed from ${targetPerson.email}`;

					const promise = db.sequelize.query(`
						delete permission.* from permission where permission.id = :permId
					`, {
						replacements: { permId: perm.id },
						type: db.sequelize.QueryTypes.DELETE,
					});
					promises.push(promise);
				}
			}
		}

		await Promise.all(promises);

		if (description) {
			await db.changeLog.create({
				person     : req.session.personId,
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
			req.session.perms.tourn[req.params.tournId] !== 'owner'
			&& (targetPerson.id !== req.session.personId
				|| req.body.property_value
			)
		) {
			return Forbidden(req, res,'Only tournament owners may adjust tournament contacts other than yourself');
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
				created_by : req.session.personId,
			});

			const description = `${targetPerson.email} has been made a tournament contact`;

			await db.changeLog.create({
				person     : req.session.personId,
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
			return BadRequest(req, res, `User ${targetPerson.email} is not a tournament contact`);
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
			person     : req.session.personId,
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
		return BadRequest(req, res,`Access type ${req.params.access_type} unknown`);
	}

	if (!req.session.perms.tourn[req.params.tournId]
		|| !target.mustBe.includes(req.session.perms.tourn[req.params.tournId])
	) {
		return Forbidden(req, res, 'You do not have sufficient access to grant that level of permissions');
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

	for (const perm of currentPerms) {
		if (perm.tag !== 'contact') {
			if (!perm.Event && !perm.Category) {
				currentPerm = perm;
			}
		}
	}

	if (currentPerm?.tag === tag) {
		return BadRequest(req, res,`User ${targetPerson.email} already has tournament wide ${tag} permissions`);
	}

	if (currentPerm?.id) {
		currentPerm.tag = tag;
		currentPerm.created_by = req.session.personId;
		await currentPerm.save();
	} else {

		//	await db.permission.destroy({
		//		person     : targetPerson.id,
		//		tourn      : req.params.tournId,
		//	});

		await db.permission.create({
			person     : targetPerson.id,
			tourn      : req.params.tournId,
			created_by : req.session.personId,
			tag,
		});
	}

	const description = `${targetPerson.email} granted tournament wide ${tag} permissions`;
	await db.changeLog.create({
		person     : req.session.personId,
		tourn      : req.params.tournId,
		tag        : 'access',
		created_at : Date(),
		description,
	});

	res.status(200).json(description);
}
export async function deleteAccess(req, res) {
	const targetPerms = await db.sequelize.query(`
		select
			perm.id, perm.tag, perm.event, perm.category
		from permission perm
			where perm.person = :personId
			and perm.tourn = :tournId
	`, {
		replacements: { ...req.params },
		type: db.sequelize.QueryTypes.SELECT,
	});

	const deletePerms = [];

	for await (const perm of targetPerms) {

		if (
			perm.tag === 'owner'
			&& req.session.perms.tourn[req.params.tournId] !== 'owner'
		) {
			return Forbidden(req, res,'Only an owner-level account may delete another owner account!');
		}

		deletePerms.push(perm.id);
	}

	if (deletePerms.length > 0) {

		try {
			await db.permission.destroy({
				where: { id: deletePerms },
			});

		} catch (err) {
			errorLogger.error(err);
			return;
		}

		let description;

		try {
			const targetPerson = await db.summon(db.person, req.params.personId);
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
				person      : req.session.personId,
				tag         : 'access',
				created_at  : Date(),
				description,
			};

			await db.changeLog.create(logCreate);
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

	return Forbidden(req, res, 'That user does not have current permissions to this tournament');
}

export async function createBackupAccess(req, res) {
	const newAccount = await db.person.findOne({
		where : {
			email: req.params.personEmail,
		},
	});

	if (!newAccount) {
		res.status.json = NotFound(req, res, 'No tabroom account was found with that email');
	}

	if (newAccount.no_email) {
		res.status.json = BadRequest(req, res,'That Tabroom account is set to not allow emails to be sent to it');
	}

	const backupAccounts = await db.tournSetting.findOne({
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
		await db.tournSetting.create({
			tourn      : req.params.tournId,
			tag        : 'backup_followers',
			value      : 'json',
			value_text : uniqueFollowers,
		});
	}

	res.status(200).json(`Added ${newAccount.email} as a tournament-wide backup follower`);
}
export async function deleteBackupAccess(req, res) {
	const backupAccounts = await db.tournSetting.findOne({
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
		backupAccounts.value_text = JSON.stringify(followers);
		await backupAccounts.save();
	}

	res.status(200).json(`Backup follower removed`);
}
