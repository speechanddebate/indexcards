# DB Schema Updates

When the database schema changes (new table, dropped table, added/removed column, changed constraint, etc.) three things must happen in order.

## 1. Regenerate the Sequelize models

Models in `api/data/models/` are auto-generated from the live schema. They must be regenerated against the updated database before any code that touches the new schema can work.

```bash
npm run models
```

This runs `api/data/auto.js` via `sequelize-auto` and overwrites every file in `api/data/models/` to match the current schema. **Do not hand-edit those files** — changes will be overwritten the next time this command runs.

After regenerating, review the diff in `api/data/models/init-models.js` to confirm the expected association changes are present.

> [!NOTE]
> `npm run models` connects to the database configured in `config/config.js` for `NODE_ENV=development`. Make sure your local dev database already has the schema changes applied before running this.

## 2. Regenerate the test SQL snapshot

The integration tests load a pre-built SQL dump (`tests/test.sql`) that seeds the test database. After a schema change that snapshot must be regenerated so the test database schema matches the updated models.

```bash
npm run updateTestFile
```

This script:
1. Prunes the development database to a minimal known-good state (`tests/createTestDatabase.js`)
2. Dumps the result with `mariadb-dump`
3. Strips `DEFINER` tags and writes the output to `tests/test.sql`

> [!IMPORTANT]
> `mariadb-client` must be installed in your environment for the dump step to work. 

Commit the updated `tests/test.sql` alongside any schema-related code changes.

## 3. Reload the test database

The updated `tests/test.sql` must be loaded into your local test database before running tests. The test runner does **not** do this automatically.

```bash
mysql -u <user> -p tabtest < tests/test.sql
```

If other developers pull your schema changes they will also need to reload the file into their local test databases.

## 4. Run the full test suite

After regenerating models and the test snapshot, run all tests to catch anything broken by the schema change.

```bash
npm run test-ci
```

Fix any failures before merging. 

## Summary checklist

| Step | Command | When |
|------|---------|------|
| Regenerate models | `npm run models` | Schema changes in dev DB |
| Regenerate test snapshot | `npm run updateTestFile` | After models are updated |
| Reload test DB | `mysql -u <user> -p tabtest < tests/test.sql` | After snapshot is updated |
| Run tests | `npm run test-ci` | After test DB is reloaded |
