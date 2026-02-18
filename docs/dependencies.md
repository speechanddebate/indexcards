# Project Dependencies Documentation

This file explains the purpose of dependencies and any special notes and or reasons against updating.

## Runtime Dependencies (dependencies)

| Package | Purpose | Notes |
|---------|---------|------|
| express | everything | on v4, v5 is available and we should look at the migration guide. [Review Express 5 changes #18](https://github.com/speechanddebate/indexcards/issues/18)|
|express-rate-limit | rate limiter (duh) | on v3. when updating to v8, an error added in v6.8.0, related to proxies appear. need to investigate. github issue [express-rate-limit error on upgrade. #19](https://github.com/speechanddebate/indexcards/issues/19)  |
| express-winston | logging | updated to v4, only breaking change was related to accessing meta properties which we don't do. |
|helmet | security | v3->v8, it seems v4-v7 had CSP change that were reverted in v8 so this upgrade shouldn't effect much.
| mariadb | MariaDB driver for Sequelize | Sequelize 6.x requires ^2.3.3 and does not support v3. Sequelize v7 is in alpha and will do away with separate drivers. |
| sequelize | ORM | v7 in alpha|
| dotenv | Loads env vars | required|


## Dev Dependencies (devDependencies)

| Package | Purpose | Notes |
|---------|---------|------|
| eslint| Linter | on v9, v10 is released but only a few day old (2/13) so let it be for now. |
