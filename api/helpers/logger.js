import { AsyncLocalStorage } from 'node:async_hooks';
import os from 'os';
import winston from 'winston';
import LokiTransport from 'winston-loki';
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
			const {method, statusCode, url, responseTime, requestId} = rest;
			const requestIdSection = requestId ? ` ${requestId}` : '';
			return `${timestamp} ${level}${requestIdSection} ${method} ${statusCode} ${url} ${responseTime}`;
		}
		const msg = typeof message === 'string' ? message : JSON.stringify(message);
		// include other metadata after the message
		const filtered = { ...rest };
		const restKeys = Object.keys(filtered);
		const restStr = restKeys.length ? ' ' + JSON.stringify(filtered,null,2) : '';
		return `${timestamp} ${level} ${msg}${restStr}`;
	})
);

const createLokiTransport = (extraLabels = {}) => {
	return new LokiTransport({
		host: config.loki.host,
		json: true,
		labels: {
			...Labels(extraLabels),
		},
		format: winston.format.json(),
		onConnectionError: (err) => logger.error('Loki connection error', err),
	});
};

const createFileTransport =() => {
	return new winston.transports.File({
		filename: `${logPath}/${config.LOG_LEVEL}.log`,
		format: winston.format.combine(
			winston.format((info) => { info.labels = Labels(); return info; })(),
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

const logger = winston.createLogger({
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

export function setupLoggers(){
	if(config.loki && config.loki.host){
		try{
			const reqTrans = createLokiTransport({type: 'request'});
			const appTrans = createLokiTransport({type: 'app'});
			requestLogger.add(reqTrans);
			logger.add(appTrans);
			logger.info('Loki transport setup complete');
		} catch (err) {
			logger.error('Error setting up Loki transport', err);
		}
	} else {
		logger.warn(`Loki host is not configured. logging to ${logPath} only`);
	}
}

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

export const setupRequest = (req, res, next) => {
	req.recieved = Date.now();

	res.on('finish', () => {
		const duration = Date.now() - req.recieved;

		requestLogger.info('Request handled', {
			method: req.method,
			url: req.originalUrl ?? '',
			statusCode: `${res.statusCode ?? ''}`,
			responseTime: `${duration}ms`,
		});
	});

	return requestContext.run({ requestId: req.uuid ?? null }, next);
};

export default logger;