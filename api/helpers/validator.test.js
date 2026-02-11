import { describe, it, expect } from 'vitest';
import { assert, check } from './validator.js';
import { ValidationError } from './errors/errors.js';

describe('validator', () => {
	describe('check.present', () => {
		it('should return true for non-null/undefined values', () => {
			expect(check.present('value')).toBe(true);
			expect(check.present(0)).toBe(true);
			expect(check.present(false)).toBe(true);
			expect(check.present('')).toBe(true);
		});

		it('should return false for null or undefined', () => {
			expect(check.present(null)).toBe(false);
			expect(check.present(undefined)).toBe(false);
		});
	});

	describe('check.validDate', () => {
		it('should return true for valid dates', () => {
			expect(check.validDate('2024-01-15')).toBe(true);
			expect(check.validDate('01/15/2024')).toBe(true);
			expect(check.validDate('2024-01-15T10:30:00Z')).toBe(true);
		});

		it('should return false for invalid dates', () => {
			expect(check.validDate('not a date')).toBe(false);
			expect(check.validDate('2024-13-45')).toBe(false);
		});
	});

	describe('assert', () => {
			it('should return when check passes', () => {
				expect(assert.present('value', 'present failed')).toBe(true);
				expect(assert.validDate('2024-01-15', 'validDate failed')).toBe(true);
			});

		it('should throw ValidationError with default message on failure', () => {
			expect(() => assert.present(null)).toThrow(ValidationError);
			expect(() => assert.present(null)).toThrow('present failed');
		});

		it('should throw ValidationError with custom message', () => {
			expect(() => assert.present(null, 'custom error')).toThrow(ValidationError);
			expect(() => assert.present(null, 'custom error')).toThrow('custom error');
		});

		it('should throw on invalid date with custom message', () => {
			expect(() => assert.validDate('invalid', 'bad date')).toThrow('bad date');
		});
	});
});