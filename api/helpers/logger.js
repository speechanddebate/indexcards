import os from 'os';
import winston from 'winston';
import config from '../../config/config.js';

const logPath = config.LOG_PATH || '/tmp';

const addHostname = winston.format(info => {
	info.hostname = os.hostname();
	return info;
});

export const debugLogger = winston.createLogger({
	level: 'debug',
	format: winston.format.combine(
		addHostname(),
		winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
		winston.format.json(),
	),
	exitOnError: false,
	silent: process.env.NODE_ENV === 'test',
	transports: [
		new winston.transports.Console(config.winstonConsoleOptions),
		new winston.transports.File({
			filename: `${logPath}/debug.log`,
			...config.winstonFileOptions,
		}),
	],
});

export const requestLogger = winston.createLogger({
	level: 'info',
	format: winston.format.combine(
		addHostname(),
		winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
		winston.format.json(),
	),
	exitOnError: false,
	silent: process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'production',
	transports: [
		new winston.transports.Console(config.winstonConsoleOptions),
		new winston.transports.File({
			filename: `${logPath}/request.log`,
			...config.winstonFileOptions,
		}),
	],
});

export const errorLogger = winston.createLogger({
	level: 'error',
	format: winston.format.combine(
		winston.format.label({ hostname: process.env.HOSTNAME }),
		winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
		winston.format.prettyPrint(),
	),
	exitOnError: false,
	silent: process.env.NODE_ENV === 'test',
	transports: [
		new winston.transports.Console(config.winstonConsoleOptions),
		new winston.transports.File({
			filename: `${logPath}/error.log`,
			...config.winstonFileOptions,
		}),
	],
});

export const clientLogger = winston.createLogger({
	level: 'info',
	format: winston.format.combine(
		addHostname(),
		winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
		winston.format.json(),
	),
	exitOnError: false,
	silent: process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'production',
	transports: [
		new winston.transports.Console(config.winstonConsoleOptions),
		new winston.transports.File({
			filename: `${logPath}/client.log`,
			...config.winstonFileOptions,
		}),
	],
});

export const queryLogger = winston.createLogger({
	level: 'info',
	format: winston.format.combine(
		addHostname(),
		winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
		winston.format.json(),
	),
	exitOnError: false,
	silent: process.env.NODE_ENV === 'test',
	transports: [
		new winston.transports.Console(config.winstonConsoleOptions),
	],
});

export const autoemailLogger = winston.createLogger({
	level: 'error',
	format: winston.format.combine(
		addHostname(),
		winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
		winston.format.json(),
	),
	exitOnError: false,
	transports: [
		new winston.transports.Console(config.winstonConsoleOptions),
		new winston.transports.File({
			filename: `${logPath}/autoemail.log`,
			...config.winstonFileOptions,
		}),
	],
});
