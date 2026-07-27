import { execSync, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import config from '../api/config.js';
import logger from '../api/helpers/logger.js';

// adjust these to match your config shape
const DB_USER = config.DB.USER || config.DB_USER;
const DB_PASS = config.DB.PASS || config.DB_PASS;
const DB_NAME = config.DB.DATABASE || config.DB_DATABASE;

// optional: host/port if you need them
const DB_HOST = config.DB.HOST || config.DB_HOST;
const DB_PORT = config.DB.PORT || config.DB_PORT;

if (!DB_USER || !DB_PASS || !DB_NAME) {
	throw new Error('Missing db.user, db.password, or db.database in config.js');
}

// 1. Build the test DB
execSync('NODE_ENV=test node tests/createTestDatabase.js', { stdio: 'inherit' });

logger.info('Dumping test database...');
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

const outputPath = path.resolve(process.cwd(), 'tests/test.sql');
const tempDumpPath = path.resolve(process.cwd(), 'tests/test.raw.sql');
const tempDumpFd = fs.openSync(tempDumpPath, 'w');

const dumpResult = spawnSync(dumpCommand, dumpArgs, {
	stdio: ['ignore', tempDumpFd, 'pipe'],
	encoding: 'utf8',
});
fs.closeSync(tempDumpFd);

if (dumpResult.error) {
	throw dumpResult.error;
}

if (dumpResult.status !== 0) {
	throw new Error(`mariadb-dump failed with code ${dumpResult.status}: ${dumpResult.stderr || 'no stderr output'}`);
}

// 4. Remove DEFINER tags without loading the full dump into memory
const reader = readline.createInterface({
	input: fs.createReadStream(tempDumpPath, { encoding: 'utf8' }),
	crlfDelay: Infinity,
});
const writer = fs.createWriteStream(outputPath, { encoding: 'utf8' });

for await (const line of reader) {
	const cleanedLine = line
		.replace(/\/\*![0-9]{5} DEFINER=`[^`]+`@`[^`]+`\*\//g, '')
		.replace(/DEFINER=`[^`]+`@`[^`]+`/g, '');
	writer.write(`${cleanedLine}\n`);
}

writer.end();
await once(writer, 'finish');
fs.unlinkSync(tempDumpPath);

logger.info('Removed DEFINER tags');
// 5. Write output

logger.info(`Wrote new test file to ${outputPath}`);
