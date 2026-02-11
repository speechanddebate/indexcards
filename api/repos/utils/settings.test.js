
import { buildSettingsRows, withSettingsInclude, flattenSettings } from './settings.js';

describe('buildSettingsRows', () => {
	const ownerKey = 'school';
	const ownerId = 42;

	it('returns empty array if settings is undefined', () => {
		expect(buildSettingsRows({ settings: undefined, ownerKey, ownerId })).toEqual([]);
	});

	it('returns empty array if settings is null', () => {
		expect(buildSettingsRows({ settings: null, ownerKey, ownerId })).toEqual([]);
	});

	it('returns empty array if settings is not an object', () => {
		expect(buildSettingsRows({ settings: 123, ownerKey, ownerId })).toEqual([]);
		expect(buildSettingsRows({ settings: 'abc', ownerKey, ownerId })).toEqual([]);
	});

	it('handles empty settings object', () => {
		expect(buildSettingsRows({ settings: {}, ownerKey, ownerId })).toEqual([]);
	});

	it('encodes null and undefined values', () => {
		const result = buildSettingsRows({
			settings: { foo: null, bar: undefined },
			ownerKey,
			ownerId,
		});
		expect(result).toEqual([
			{
				[ownerKey]: ownerId,
				tag: 'foo',
				value: null,
				value_text: null,
				value_date: null,
			},
			{
				[ownerKey]: ownerId,
				tag: 'bar',
				value: null,
				value_text: null,
				value_date: null,
			},
		]);
	});

	it('encodes Date values', () => {
		const date = new Date('2023-01-01T00:00:00Z');
		const result = buildSettingsRows({
			settings: { mydate: date },
			ownerKey,
			ownerId,
		});
		expect(result).toEqual([
			{
				[ownerKey]: ownerId,
				tag: 'mydate',
				value: null,
				value_text: null,
				value_date: date,
			},
		]);
	});

	it('encodes boolean values', () => {
		const result = buildSettingsRows({
			settings: { yes: true, no: false },
			ownerKey,
			ownerId,
		});
		expect(result).toEqual([
			{
				[ownerKey]: ownerId,
				tag: 'yes',
				value: '1',
				value_text: null,
				value_date: null,
			},
			{
				[ownerKey]: ownerId,
				tag: 'no',
				value: '0',
				value_text: null,
				value_date: null,
			},
		]);
	});

	it('encodes number values', () => {
		const result = buildSettingsRows({
			settings: { num: 123, zero: 0 },
			ownerKey,
			ownerId,
		});
		expect(result).toEqual([
			{
				[ownerKey]: ownerId,
				tag: 'num',
				value: '123',
				value_text: null,
				value_date: null,
			},
			{
				[ownerKey]: ownerId,
				tag: 'zero',
				value: '0',
				value_text: null,
				value_date: null,
			},
		]);
	});

	it('encodes short string values (<=64 chars)', () => {
		const shortStr = 'a'.repeat(64);
		const result = buildSettingsRows({
			settings: { short: shortStr },
			ownerKey,
			ownerId,
		});
		expect(result).toEqual([
			{
				[ownerKey]: ownerId,
				tag: 'short',
				value: shortStr,
				value_text: null,
				value_date: null,
			},
		]);
	});

	it('encodes long string values (>64 chars)', () => {
		const longStr = 'b'.repeat(65);
		const result = buildSettingsRows({
			settings: { long: longStr },
			ownerKey,
			ownerId,
		});
		expect(result).toEqual([
			{
				[ownerKey]: ownerId,
				tag: 'long',
				value: null,
				value_text: longStr,
				value_date: null,
			},
		]);
	});

	it('encodes object and array values as JSON in value_text', () => {
		const obj = { a: 1, b: true };
		const arr = [1, 2, 3];
		const result = buildSettingsRows({
			settings: { obj, arr },
			ownerKey,
			ownerId,
		});
		expect(result).toEqual([
			{
				[ownerKey]: ownerId,
				tag: 'obj',
				value: null,
				value_text: JSON.stringify(obj),
				value_date: null,
			},
			{
				[ownerKey]: ownerId,
				tag: 'arr',
				value: null,
				value_text: JSON.stringify(arr),
				value_date: null,
			},
		]);
	});

	it('handles multiple mixed types', () => {
		const date = new Date('2022-12-12T12:00:00Z');
		const result = buildSettingsRows({
			settings: {
				a: 1,
				b: 'short',
				c: 'c'.repeat(100),
				d: false,
				e: null,
				f: date,
				g: { x: 1 },
			},
			ownerKey,
			ownerId,
		});
		expect(result).toEqual([
			{
				[ownerKey]: ownerId,
				tag: 'a',
				value: '1',
				value_text: null,
				value_date: null,
			},
			{
				[ownerKey]: ownerId,
				tag: 'b',
				value: 'short',
				value_text: null,
				value_date: null,
			},
			{
				[ownerKey]: ownerId,
				tag: 'c',
				value: null,
				value_text: 'c'.repeat(100),
				value_date: null,
			},
			{
				[ownerKey]: ownerId,
				tag: 'd',
				value: '0',
				value_text: null,
				value_date: null,
			},
			{
				[ownerKey]: ownerId,
				tag: 'e',
				value: null,
				value_text: null,
				value_date: null,
			},
			{
				[ownerKey]: ownerId,
				tag: 'f',
				value: null,
				value_text: null,
				value_date: date,
			},
			{
				[ownerKey]: ownerId,
				tag: 'g',
				value: null,
				value_text: JSON.stringify({ x: 1 }),
				value_date: null,
			},
		]);
	});
});

describe('withSettingsInclude', () => {
	const DummyModel = function DummyModel() {};
	const as = 'settings';

	it('returns empty array if settings is undefined', () => {
		expect(withSettingsInclude({ model: DummyModel, as, settings: undefined })).toEqual([]);
	});

	it('returns empty array if settings is null', () => {
		expect(withSettingsInclude({ model: DummyModel, as, settings: null })).toEqual([]);
	});

	it('returns include with no where if settings is true', () => {
		expect(withSettingsInclude({ model: DummyModel, as, settings: true })).toEqual([
			{
				model: DummyModel,
				as,
				required: false,
			},
		]);
	});

	it('returns include with where.tag if settings is an array', () => {
		const tags = ['foo', 'bar'];
		expect(withSettingsInclude({ model: DummyModel, as, settings: tags })).toEqual([
			{
				model: DummyModel,
				as,
				required: false,
				where: { tag: tags },
			},
		]);
	});

	it('throws error if settings is an object', () => {
		expect(() =>
			withSettingsInclude({ model: DummyModel, as, settings: { foo: 1 } })
		).toThrow('settings must be true or an array of tags');
	});

	it('throws error if settings is a string', () => {
		expect(() =>
			withSettingsInclude({ model: DummyModel, as, settings: 'foo' })
		).toThrow('settings must be true or an array of tags');
	});

	it('throws error if settings is a number', () => {
		expect(() =>
			withSettingsInclude({ model: DummyModel, as, settings: 123 })
		).toThrow('settings must be true or an array of tags');
	});
});
describe('flattenSettings', () => {
	it('returns undefined if settingRows is undefined', () => {
		expect(flattenSettings(undefined)).toBeUndefined();
	});

	it('returns undefined if settingRows is null', () => {
		expect(flattenSettings(null)).toBeUndefined();
	});

	it('returns empty object for empty array', () => {
		expect(flattenSettings([])).toEqual({});
	});

	it('handles value type "text"', () => {
		const rows = [
			{ tag: 'foo', value: 'text', value_text: 'bar' },
			{ tag: 'baz', value: 'text', value_text: 'qux' },
		];
		expect(flattenSettings(rows)).toEqual({
			foo: 'bar',
			baz: 'qux',
		});
	});

	it('handles value type "json"', () => {
		const rows = [
			{ tag: 'obj', value: 'json', value_text: '{"a":1}' },
		];
		expect(flattenSettings(rows)).toEqual({
			obj: '{"a":1}',
		});
	});

	it('handles value type "date"', () => {
		const date = new Date('2023-01-01T00:00:00Z');
		const rows = [
			{ tag: 'mydate', value: 'date', value_date: date },
		];
		expect(flattenSettings(rows)).toEqual({
			mydate: date,
		});
	});

	it('handles numeric string values', () => {
		const rows = [
			{ tag: 'num', value: '123' },
			{ tag: 'zero', value: '0' },
		];
		expect(flattenSettings(rows)).toEqual({
			num: 123,
			zero: 0,
		});
	});

	it('handles non-numeric string values', () => {
		const rows = [
			{ tag: 'str', value: 'hello' },
		];
		expect(flattenSettings(rows)).toEqual({
			str: 'hello',
		});
	});

	it('handles null and undefined value', () => {
		const rows = [
			{ tag: 'nullval', value: null },
			{ tag: 'undefval', value: undefined },
		];
		expect(flattenSettings(rows)).toEqual({
			nullval: null,
			undefval: undefined,
		});
	});

	it('handles mixed types', () => {
		const date = new Date('2022-12-12T12:00:00Z');
		const rows = [
			{ tag: 'a', value: 'text', value_text: 'short' },
			{ tag: 'b', value: 'json', value_text: '{"x":1}' },
			{ tag: 'c', value: 'date', value_date: date },
			{ tag: 'd', value: '42' },
			{ tag: 'e', value: 'notanumber' },
			{ tag: 'f', value: null },
		];
		expect(flattenSettings(rows)).toEqual({
			a: 'short',
			b: '{"x":1}',
			c: date,
			d: 42,
			e: 'notanumber',
			f: null,
		});
	});

	it('handles rows with dataValues property', () => {
		const date = new Date('2021-01-01T00:00:00Z');
		const rows = [
			{ dataValues: { tag: 'foo', value: 'text', value_text: 'bar' } },
			{ dataValues: { tag: 'date', value: 'date', value_date: date } },
			{ dataValues: { tag: 'num', value: '100' } },
		];
		expect(flattenSettings(rows)).toEqual({
			foo: 'bar',
			date: date,
			num: 100,
		});
	});
});