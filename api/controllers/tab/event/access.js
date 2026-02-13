// Event level access maniuplation

import { BadRequest, Forbidden, NotFound, NotImplemented } from '../../../helpers/problem.js';
import db from '../../../data/db.js';

// Add permissions that are not there already (create)
export async function createAccess(req, res) {
	return NotImplemented(req, res, 'Creating event access is not yet implemented');
}

// Alter existing permissions (update)
export async function updateAccess(req, res) {
	const targetPerson = await db.summon(db.person, req.params.personId);
	const targetEvent = await db.summon(db.event, req.params.eventId);

	if (!targetPerson || !targetEvent) {
		return NotFound(req, res, 'No person found with that Tabroom ID');
	}

	if (
		req.session.perms.tourn[targetEvent.tourn] === 'owner' ||
    req.session.perms.tourn[targetEvent.tourn] === 'tabber' ||
    req.session.perms.event[targetEvent.id] === 'tabber'
	) {
		const currentPerm = await db.permission.findOne({
			where: {
				person: targetPerson.id,
				event: targetEvent.id,
			},
		});

		if (!currentPerm) {
			return Forbidden(req, res, `User ${targetPerson.email} does not have access ${targetEvent.abbr} and so it cannot be altered`);
		}

		currentPerm.tag = currentPerm.tag === 'checker' ? 'tabber' : 'checker';
		await currentPerm.save();
		const description = `${targetPerson.email}'s access to ${targetEvent.abbr} is now ${currentPerm.tag}`;

		const replace = [
			{
				id: `event_${targetEvent.id}_${targetPerson.id}_role`,
				content: currentPerm.tag.toUpperCase(),
			},
		];
		await db.changeLog.create({
			person: req.session.personId,
			tourn: req.params.tournId,
			event: targetEvent.id,
			tag: 'access',
			created_at: Date(),
			description,
		});

		return res.status(200).json({
			error: false,
			message: description,
			replace,
		});
	}

	return res.status(200).json({
		error: true,
		message: `You do not have permission to make that change `,
	});
}

// Show permissions for a user
export async function getAccess(req, res) {
	return NotImplemented(req, res, 'get event access is not yet implemented');
}

// Delete a user's access to this tournament
export async function deleteAccess(req, res) {
	const targetEvent = await db.summon(db.event, req.params.eventId);
	const targetPerson = await db.summon(db.person, req.params.personId);

	if (
		req.session.perms.tourn[targetEvent.tourn] === 'owner' ||
    req.session.perms.tourn[targetEvent.tourn] === 'tabber' ||
    req.session.perms.event[targetEvent.id] === 'tabber'
	) {
		await db.sequelize.query(
			`delete perm.* from permission perm where perm.person = :personId and perm.event = :eventId`,
			{
				replacements: { ...req.params },
				type: db.sequelize.QueryTypes.DELETE,
			}
		);

		const log = await db.changeLog.create({
			person: req.session.personId,
			tourn: req.params.tournId,
			event: targetEvent.id,
			tag: 'access',
			created_at: Date(),
			description: `${targetPerson.email} access removed from ${targetEvent.abbr}`,
		});

		return res.status(200).json({
			error: false,
			destroy: `event_${targetEvent.id}_${targetPerson.id}`,
			message: log.description,
		});
	}

	return Forbidden(req, res, `You do not have access to change permissions in ${targetEvent.abbr}`);
}

// Create backup follower for a whole event
export async function createBackupAccess(req, res) {
	const targetPerson = await db.summon(db.person, req.params.personId);
	const targetEvent = await db.summon(db.event, req.params.eventId);

	if (!targetPerson) {
		return NotFound(req, res, 'No tabroom account was found with that email');
	}

	if (targetPerson.no_email) {
		return BadRequest(req, res, 'That Tabroom account is set to not allow emails to be sent to it');
	}

	const backupAccounts = await db.eventSetting.findOne({
		where: {
			event: req.params.eventId,
			tag: 'backup_followers',
		},
	});

	const followers = [];
	if (backupAccounts?.id) {
		if (backupAccounts.value === 'json') {
			followers.push(...JSON.parse(backupAccounts.value_text));
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
		await db.eventSetting.create({
			event: req.params.eventId,
			tag: 'backup_followers',
			value: 'json',
			value_text: uniqueFollowers,
		});
	}

	return res.status(200).json(`Added ${targetPerson.email} as a backup follower for ${targetEvent.abbr}`);
}

// Delete backup follower
export async function deleteBackupAccess(req, res) {
	const backupAccounts = await db.eventSetting.findOne({
		where: {
			event: req.params.eventId,
			tag: 'backup_followers',
		},
	});

	if (!backupAccounts?.id) {
		return res.status(200).json(`Event has no current backup followers`);
	}

	const followers = [];
	if (backupAccounts.value === 'json') {
		followers.push(...JSON.parse(backupAccounts.value_text));
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

	return res.status(200).json(`Backup follower removed`);
}