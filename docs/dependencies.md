# Project Dependencies Documentation

This file explains the purpose of dependencies and any special notes and or reasons against updating.

## Runtime Dependencies (dependencies)

| Package | Current Version | Purpose | Notes |
|---------|---------|---------|------|
| express | ^5.2.1 | everything | on v5, we should review the migration guide. [Review Express 5 changes #18](https://github.com/speechanddebate/indexcards/issues/18)|
| express-rate-limit | ^8.3.1 | rate limiter (duh) |  |
| express-winston | ^4.2.0 | logging | updated to v4, only breaking change was related to accessing meta properties which we don't do. |
| helmet | ^8 | security | v3->v8, it seems v4-v7 had CSP change that were reverted in v8 so this upgrade shouldn't effect much. |
| mariadb | ^2.3.3 | MariaDB driver for Sequelize | Sequelize 6.x requires ^2.3.3 and does not support v3. Sequelize v7 is in alpha and will do away with separate drivers. |
| sequelize | ^6.37.7 | ORM | v7 in alpha |


## Dev Dependencies (devDependencies)

| Package | Current Version | Purpose | Notes |
|---------|---------|---------|------|
| eslint | ^9.18.0 | Linter | on v9, v10 is released so consider evaluating for migration. |
| vitest | ^4.0.17 | Testing | |
| @faker-js/faker | ^10.2.0 | Testing ||
