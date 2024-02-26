// node --experimental-specifier-resolution=node -e 'import("./api/controllers/ext/share/generateTestEmails").then(m => m.init())' 10
import fs from 'fs';
import { randomPhrase } from '@speechanddebate/nsda-js-utils';
import { emailBlast } from '../../../helpers/mail.js';
import { debugLogger } from '../../../helpers/logger';

const generateTestEmails = async (numberOfEmails = parseInt(process.argv[1]) || 10) => {
	const buffer = fs.readFileSync('./api/controllers/ext/share/test.docx');
	const base64 = buffer.toString('base64');

	const promises = [];

	try {
		for (let i = 0; i < numberOfEmails; i++) {
			const phrase = randomPhrase();

			const messageData = {
				to      : `${phrase}@share.tabroom.com`,
				from    : `${phrase}@share.tabroom.com`,
				subject : `Test email ${phrase}`,
				text    : `Test email ${phrase}`,
				emails  : null,
				attachments: [{ filename: 'Test.docx', file: base64 }],
			};

			const info = emailBlast(messageData);
			promises.push(info.result);
		}
	} catch (err) {
		debugLogger.error(err);
	}

	await Promise.all(promises);
	return true;
};

export const init = () => {
	return generateTestEmails(parseInt(process.argv[1]) || 10);
};

export default generateTestEmails;
