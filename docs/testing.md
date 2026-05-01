# Testing

This project uses [Vitest](https://vitest.dev/) for unit and integration testing, with the test database pre-loaded with sample tournament data.

## Setting up the test database

Before running tests, you must create and load the test database. See [Getting setup](../README.md#getting-setup) in the main README for detailed instructions.

Quick reference:
```bash
mysql -u <user> -p -e "CREATE DATABASE IF NOT EXISTS tabtest;"
mysql -u <user> -p tabtest < tests/test.sql
```

## Running tests

### Watch mode (development)
Reruns tests on file changes:

```bash
npm run test
```

### CI mode (single run)
Runs all tests once and exits:

```bash
npm run test-ci
```

### Coverage
Generates coverage report (excludes `api/data/models/`):

```bash
npm run cover
```

Coverage is generated in `/coverage` and includes HTML reports.

## Test structure

Tests are colocated with the code they test using the `.test.js` suffix:

```
api/
  helpers/
    validator.js
    validator.test.js
  data/
    db.js
    db.test.js
  controllers/
    authController.js
    authController.test.js
```

## Configuration

Test configuration is defined in `vitest.config.js`:

- **Setup files**: `tests/setup.js` runs before each test file, providing custom matchers and utilities
- **Global setup**: `tests/globalTestSetup.js` runs once at the start, loading test data
- **Global teardown**: Cleans up test data after all tests complete
- **Coverage**: Includes all `api/**/*.{js,ts,tsx}` except `api/data/models/**`

## Writing tests

### Basic test structure

```javascript
import { myFunction } from './myModule.js';

describe('MyModule', () => {
  it('should do something when called', () => {
    const result = myFunction('input');
    expect(result).toBe('expected output');
  });

  it('should handle edge cases', () => {
    expect(() => myFunction(null)).toThrow();
  });
});
```

## Testing Repos
Repos are testing with a connection to a real database to eliminate the trickiness of mocking a db and the errors that can result. Fake data can be populated in the database using factory methods in `/tests/factories` like so
```js
//fooRepo.test.js
import factories from '../../tests/factories/index.js';
import fooRepo, from './fooRepo.js';

describe('fooRepo', () => {
	describe('getById', () => {
		it('returns foo for a given id', async () => {
			// Arrange
			const { fooId } = await factories.foo.createTestFoo();
			// Act
			const foo = await fooRepo.getById(fooId);
			// Assert
			expect(foo).toBeDefined();
			//...
		});
```
> [!IMPORTANT]
> avoid making assumptions about the state of the database. Do not assume your test data will be the only thing in the DB.

## Testing Controllers

Controllers are tested by mocking any dependencies and passing in fake `req` and `res` objects created by `/tests/httpMocks.js`. Controller tests should be focused on validating, well the validation and response formats of the controllers. 
```js
..
import { createContext } from '../../tests/httpMocks.js';
...

afterEach(() => {
	vi.restoreAllMocks();
});

describe('authController',() => {
	describe('login', () => {

		it('returns 400 when password missing', async () => {
			const { req, res } = createContext({
				body: { username: 'bob' },
			});

			await controller.login(req, res);

			assert.equal(res.status.mock.calls[0][0], 400);
			assert.ok(res.json.mock.calls.length === 1);
		});
	...
```

## Testing Routes

Route testing are consider our 'integration tests'. These tests test the full request and should be limited to the "happy path" options and leave the specifics to the unit test. These tests can also utilize factories for creating test data.

```js
import request from 'supertest';
import { assert } from 'chai';
import server from '../../../../app.js';
import factories from '../../../../tests/factories/index.js';
import { hashPassword } from '../../../services/AuthService.js';

describe('Auth Router', () => {
	describe('/register' , () => {
		it('Registers a new user', async () => {
			const personData = await factories.person.createPersonData({
				password: 'securepassword',
			});
			const res = await request(server)
				.post('/v1/auth/register')
				.send({
					email: personData.email,
					password: personData.password,
					firstName: personData.firstName,
					lastName: personData.lastName,
				})
				.set('Accept', 'application/json')
				.expect('Content-Type', /json/)
				.expect(200);
			assert.isObject(res.body, 'Response is an object');
			assert.containsAllKeys(res.body, ['personId', 'token'], 'Response has personId and session token');
		});
	});
	...
```
