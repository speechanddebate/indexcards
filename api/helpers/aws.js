import {
	DeleteObjectCommand,
	GetObjectCommand,
	PutObjectCommand,
	CopyObjectCommand,
	S3Client } from '@aws-sdk/client-s3';
import config from '../../config/config';
import logger from './logger';

const client = new S3Client(config.AWS);

const s3Client = {

	client,

	rm: async (filepath) => {
		const rmCommand = new DeleteObjectCommand({
			Bucket     : config.AWS.Bucket,
			Key        : filepath,
		});

		let response = '';

		try {
			response = await client.send(rmCommand);
		} catch (err) {
			logger.error(`Error on deleting AWS ${filepath}`);
			logger.error(err);
			return err;
		}

		return response;
	},

	cp: async (filepath, dest) => {

		const cpCommand = new CopyObjectCommand({
			CopySource : `${config.AWS.Bucket}/${filepath}`,
			Bucket     : config.AWS.Bucket,
			Key        : dest,
		});

		let response = '';
		try {
			response = await client.send(cpCommand);
		} catch (err) {
			logger.error(`Error on copying AWS ${filepath} to ${dest}`);
			logger.error(err);
			return err;
		}
		return response;
	},

	mv: async (filepath, dest) => {

		const cpCommand = new CopyObjectCommand({
			CopySource : `${config.AWS.Bucket}/${filepath}`,
			Bucket     : config.AWS.Bucket,
			Key        : dest,
		});

		const rmCommand = new DeleteObjectCommand({
			Bucket     : config.AWS.Bucket,
			Key        : filepath,
		});

		try {
			await client.send(cpCommand);
		} catch (err) {
			logger.error(`Error on moving AWS ${filepath} to ${dest} on the copy`);
			logger.error(err);
			return err;
		}

		let response = '';

		try {
			response = await client.send(rmCommand);
		} catch (err) {
			logger.error(`Error on moving AWS ${filepath} to ${dest} on the deletion`);
			logger.error(err);
			return err;
		}

		return response;
	},

	get : async (filepath) => {
		const getCommand = new GetObjectCommand({
			Bucket : config.AWS.Bucket,
			Key    : filepath,
		});

		let stream;

		try {
			const response = await client.send(getCommand);
			stream = await response.Body.transformToWebStream();
		} catch (err) {
			console.error(err);
		}
		return stream;
	},

	put : async (filepath, data) => {
		const putCommand = new PutObjectCommand({
			Bucket : config.AWS.Bucket,
			Key    : filepath,
			Body   : data,
		});

		let response = '';

		try {
			response = await client.send(putCommand);
		} catch (err) {
			console.error(err);
		}
		return response;
	},
};

export default s3Client;
