import Transport from 'winston-transport';
import EventEmitter from 'events';
import logger, { setupRequest } from './logger.js';

class CaptureTransport extends Transport {
	constructor() {
		super();
		this.entries = [];
	}

	log(info, callback) {
		this.entries.push(info);
		callback();
	}
}

describe('logger request context', () => {
	it('adds requestId from setupRequest across async boundaries', async () => {
		const req = { uuid: 'req-123' };
		const res = new EventEmitter();
		res.statusCode = 200;
		const captureTransport = new CaptureTransport();
		const originalSilent = logger.silent;

		logger.silent = false;
		logger.add(captureTransport);

		await new Promise((resolve) => {
			setupRequest(req, res, async () => {
				await Promise.resolve();
				logger.info('test log');
				res.emit('finish');
				resolve();
			});
		});

		logger.remove(captureTransport);
		logger.silent = originalSilent;

		expect(captureTransport.entries[0].requestId).toBe('req-123');
	});

});