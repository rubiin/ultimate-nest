import * as winston from 'winston';
import * as dailyRotateFile from 'winston-daily-rotate-file';
import { utilities } from 'nest-winston';

const infoAndWarnFilter = winston.format(info => {
	return info.level === 'info' || info.level === 'warn' ? info : false;
});

const errorFilter = winston.format(info => {
	return info.level === 'error' ? info : false;
});

// Common Winston transports
let transports: winston.transport[] = [
	new winston.transports.Console({
		level: 'debug',
		format: winston.format.combine(
			winston.format.timestamp(),
			utilities.format.nestLike(),
		),
	}),
];

// Production Winston transports (common + custom)

if (process.env.NODE_ENV === 'prod') {
	transports = [
		...transports,
		new winston.transports.File({
			filename: 'logs/info.log',
			level: 'info',
			zippedArchive: true,
			maxsize: 100 * Math.pow(1024, 2), // 100 MB,
			format: winston.format.combine(infoAndWarnFilter()),
		}),
		new dailyRotateFile({
			filename: 'logs/error-%DATE%.log',
			datePattern: 'YYYY-MM-DD-HH',
			zippedArchive: true,
			maxSize: 100 * Math.pow(1024, 2), // 100 MB
			maxFiles: '14d',
			level: 'error',
			format: winston.format.combine(errorFilter()),
		}),
	];
}

export default transports;
