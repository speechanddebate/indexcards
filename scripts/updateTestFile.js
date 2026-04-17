import { execSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import config from '../config/config.js';

// adjust these to match your config shape
const DB_USER = config.DB_USER;
const DB_PASS = config.DB_PASS;
const DB_NAME = config.DB_DATABASE;

// optional: host/port if you need them
const DB_HOST = config.DB_HOST;
const DB_PORT = config.DB_PORT;

if (!DB_USER || !DB_PASS || !DB_NAME) {
	throw new Error('Missing db.user, db.password, or db.database in config.js');
}

// 1. Build the test DB
execSync('NODE_ENV=test node tests/createTestDatabase.js', { stdio: 'inherit' });

// 2. Build dump args
const dumpArgs = [
	`-u${DB_USER}`,
	`-p${DB_PASS}`,
	'--single-transaction',
	'--routines',
	'--triggers',
	'--events',
	'--skip-ssl',
];

if (DB_HOST) dumpArgs.push(`-h${DB_HOST}`);
if (DB_PORT) dumpArgs.push(`-P${DB_PORT}`);

dumpArgs.push(DB_NAME);
// 3. Dump the DB
const dumpCommand = fs.existsSync('/usr/bin/mariadb-dump')
	? '/usr/bin/mariadb-dump'
	: 'mariadb-dump';

const dumpResult = spawnSync(dumpCommand, dumpArgs, {
	encoding: 'utf8',
	maxBuffer: 1024 * 1024 * 300, // 300 MB
});

if (dumpResult.error) {
	throw dumpResult.error;
}

if (dumpResult.status !== 0) {
	throw new Error(`mariadb-dump failed with code ${dumpResult.status}: ${dumpResult.stderr || 'no stderr output'}`);
}

// 4. Remove DEFINER tags
const cleaned = (dumpResult.stdout || '')
	.replace(/\/\*![0-9]{5} DEFINER=`[^`]+`@`[^`]+`\*\//g, '')
	.replace(/DEFINER=`[^`]+`@`[^`]+`/g, '');

console.log('removed DEFINER tags');
// 5. Write output
const outputPath = path.resolve(process.cwd(), 'tests/test.sql');
fs.writeFileSync(outputPath, cleaned, 'utf8');

console.log(`Wrote ${outputPath}`);