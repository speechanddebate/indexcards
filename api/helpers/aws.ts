import {
	DeleteObjectCommand,
	GetObjectCommand,
	PutObjectCommand,
	CopyObjectCommand,
	S3Client } from '@aws-sdk/client-s3';
import config from '../config.js';
import logger from './logger.js';

const client = new S3Client(config.aws);

const s3Client = {

	client,

	rm: async (filepath: string) => {
		const rmCommand = new DeleteObjectCommand({
			Bucket     : config.aws.Bucket,
			Key        : filepath,
		});

		let response;

		try {
			response = await client.send(rmCommand);
		} catch (err) {
			logger.error(`Error on deleting AWS ${filepath}`);
			logger.error(err);
			return err;
		}

		return response;
	},

	cp: async (filepath: string, dest: string) => {

		const cpCommand = new CopyObjectCommand({
			CopySource : `${config.aws.Bucket}/${filepath}`,
			Bucket     : config.aws.Bucket,
			Key        : dest,
		});

		let response;
		try {
			response = await client.send(cpCommand);
		} catch (err) {
			logger.error(`Error on copying AWS ${filepath} to ${dest}`);
			logger.error(err);
			return err;
		}
		return response;
	},

	mv: async (filepath: string, dest: string) => {

		const cpCommand = new CopyObjectCommand({
			CopySource : `${config.aws.Bucket}/${filepath}`,
			Bucket     : config.aws.Bucket,
			Key        : dest,
		});

		const rmCommand = new DeleteObjectCommand({
			Bucket     : config.aws.Bucket,
			Key        : filepath,
		});

		try {
			await client.send(cpCommand);
		} catch (err) {
			logger.error(`Error on moving AWS ${filepath} to ${dest} on the copy`);
			logger.error(err);
			return err;
		}

		let response;

		try {
			response = await client.send(rmCommand);
		} catch (err) {
			logger.error(`Error on moving AWS ${filepath} to ${dest} on the deletion`);
			logger.error(err);
			return err;
		}

		return response;
	},

	get : async (filepath: string) => {
		const getCommand = new GetObjectCommand({
			Bucket : config.aws.Bucket,
			Key    : filepath,
		});

		let stream;

		try {
			const response = await client.send(getCommand);
			stream = await response.Body?.transformToWebStream();
		} catch (err) {
			console.error(err);
		}
		return stream;
	},

	put : async (filepath: string, data: any) => {
		const putCommand = new PutObjectCommand({
			Bucket : config.aws.Bucket,
			Key    : filepath,
			Body   : data,
		});

		let response;

		try {
			response = await client.send(putCommand);
		} catch (err) {
			console.error(err);
		}
		return response;
	},
};

export default s3Client;
