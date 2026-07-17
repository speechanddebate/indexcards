import { AsyncLocalStorage } from 'node:async_hooks';
import os from 'os';
import winston from 'winston';
import config from '../../config/config.js';

const logPath = config.LOG_PATH || '/tmp';
const requestContext = new AsyncLocalStorage();

function getRequestId() {
	return requestContext.getStore()?.requestId ?? null;
}

function attachRequestContext(info) {
	const requestId = getRequestId();

	if (requestId && info.requestId == null) {
		info.requestId = requestId;
	}

	return info;
}

export function getCallerFrame(options = {}) {
	const {
		skipContains = [],
		preferContains = '/api/',
	} = options;

	const stackHolder = {};
	Error.captureStackTrace(stackHolder, getCallerFrame);

	const frames = String(stackHolder.stack || '')
		.split('\n')
		.slice(1)
		.map((line) => line.trim())
		.filter(Boolean)
		.filter((line) => !line.includes('node:internal'))
		.filter((line) => !line.includes('/node_modules/'))
		.filter((line) => !line.includes('/api/helpers/logger.js'))
		.filter((line) => skipContains.every((token) => !line.includes(token)));

	const preferred = frames.find((line) => line.includes(preferContains));
	return preferred ?? frames[0] ?? 'unknown';
}

const requestContextFormat = winston.format((info) => attachRequestContext(info));

function Labels(props = {}) {
	return {
		app: 'indexcards',
		host: os.hostname(),
		container: config.DOCKERHOST ?? 'unknown',
		...props,
	};
}

const prettyConsoleFormat = winston.format.combine(
	winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
	// Uppercase the level first so colorize operates on the final text
	winston.format((info) => { info.level = (info.level || '').toUpperCase(); return info; })(),
	winston.format.colorize({ all: false, level: true }),
	winston.format.printf((info) => {

		let { timestamp, level, message, ...rest } = info;
		//special format for console request logger
		if( message === 'Request handled') {
			const {method, statusCode, url, responseTimeMs, requestId} = rest;
			const requestIdSection = requestId ? ` ${requestId}` : '';
			return `${timestamp} ${level}${requestIdSection} ${method} ${statusCode} ${url} ${responseTimeMs}ms`;
		}
		const msg = typeof message === 'string' ? message : JSON.stringify(message);
		// include other metadata after the message
		const filtered = { ...rest };
		const restKeys = Object.keys(filtered);
		const restStr = restKeys.length ? ' ' + JSON.stringify(filtered,null,2) : '';
		return `${timestamp} ${level} ${msg}${restStr}`;
	})
);

const createFileTransport =() => {
	return new winston.transports.File({
		filename: `${logPath}/indexcards.log`,
		format: winston.format.combine(
			winston.format((info) => {
				return {
					...info,
					...Labels(),
				};
			})(),
			winston.format.json(),
		),
		...config.winstonFileOptions,
	});
};

const createConsoleTransport = () => {
	return new winston.transports.Console({
		format: prettyConsoleFormat,
		...config.winstonConsoleOptions,
	});
};
/**
 * Main application logger. Transports and formatting are configured based on config values.
 */
const logger = winston.createLogger({
	level: config.LOG_LEVEL,
	format: winston.format.combine(
		requestContextFormat(),
		winston.format.json(),
	),
	exitOnError: false,
	//silent: process.env.NODE_ENV === 'test',
	transports: [
		createConsoleTransport(),
		createFileTransport(),
	],
});

//write progress messages that can be overwritten by later messages (e.g. for progress bars or status updates) no-op is not a TTY
logger.progress = (msg) => {
	if(process.stdout.isTTY){
		process.stdout.clearLine();
		process.stdout.cursorTo(0);
		process.stdout.write(msg);
	}
};

//clear the progress message and optionally write a final message (e.g. "done")
logger.progressEnd = (msg) => {
	if(process.stdout.isTTY){
		process.stdout.clearLine();
		process.stdout.cursorTo(0);
	}
	if(msg){
		logger.info(msg);
	}
};

const requestLogger = winston.createLogger({
	level: config.LOG_LEVEL,
	format: winston.format.combine(
		requestContextFormat(),
		winston.format.json(),
	),
	exitOnError: false,
	silent: process.env.NODE_ENV === 'test',
	transports: [
		createConsoleTransport(),
		createFileTransport(),
	],
});

function normalizePath(urlPath) {
	// Strip query string first
	const pathOnly = urlPath.split('?')[0];

	// Single regex for both numeric IDs and UUIDs
	return pathOnly.replace(
		/\/(?:\d+|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})(?=\/|$)/gi,
		'/{id}'
	);
}

export const setupRequest = (req, res, next) => {
	req.received = Date.now();

	res.on('finish', () => {
		const duration = Date.now() - req.received;

		requestLogger.info('Request handled', {
			method: req.method,
			url: req.originalUrl ?? '',
			path: normalizePath(req.originalUrl ?? ''),
			statusCode: `${res.statusCode ?? ''}`,
			responseTimeMs: `${duration}`,
		});
	});

	return requestContext.run({ requestId: req.uuid ?? null }, next);
};

export default logger;