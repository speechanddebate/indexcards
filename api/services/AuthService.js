import personRepo from '../repos/personRepo.js';
/* eslint-disable-next-line import/no-unresolved */
import { verify, encrypt } from 'unixcrypt';
import crypto from 'crypto';
import sessionRepo from '../repos/sessionRepo.js';
import { ValidationError } from '../helpers/errors/errors.js';

export async function login(username, password, context = {}) {
	const { ip, agentData } = context;
	const person = await personRepo.getPersonByUsername(username, {includePassword: true});

	if (!person || !person?.id || !person?.password) {
		throw AUTH_INVALID;
	}

	const ok = verifyPassword(password, person.password);
	if (!ok) {
		throw AUTH_INVALID;
	}

	const { userkey: userkey } = await sessionRepo.createSession({
		personId: person.id,
		ip: ip,
		agentData: agentData,
	});
	//TODO enforce limits

	return {person,token: userkey};
}

export async function register(userData, context = {}) {
	const { ip, agentData } = context;
	//ensure email is not already in use
	if(userData.email && await personRepo.getPersonByUsername(userData.email)){
		throw new ValidationError('Email already in use');
	}
	if(!userData.password) throw new ValidationError('Password is required');

	const newPersonData = {
		email: userData.email,
		password: hashPassword(userData.password),
		firstName: userData.firstName,
		middleName: userData.middleName,
		lastName: userData.lastName,
		state: userData.state,
		country: userData.country,
		tz: userData.tz,
	};
	const personId = await personRepo.createPerson(newPersonData);

	if (!personId) {
		throw new Error('Failed to create user');
	}

	const { userkey } = await sessionRepo.createSession({
		personId,
		ip,
		agentData,
	});
	return {personId, token: userkey};
}

function generateCSRFToken(userkey){
	return crypto
        .createHmac('sha256',userkey)
        .digest('hex');
}

export const AUTH_INVALID = Symbol('AUTH_INVALID');
export function getAuthCookieOptions() {
	const secure = process.env.NODE_ENV === 'production';
	return {
		httpOnly: true,
		secure,
		sameSite: 'lax',
		path: '/',
	};
};
export function getCSRFCookieOptions() {
	const secure = process.env.NODE_ENV === 'production';
	return {
		httpOnly: false,
		secure,
		sameSite: 'lax',
		path: '/',
	};
}

export function hashPassword(password) {
	return encrypt(password);
}
export function verifyPassword(password, hashed) {
	return verify(password, hashed);
}

export default {
	login,
	register,
	getAuthCookieOptions,
	getCSRFCookieOptions,
	generateCSRFToken,
};