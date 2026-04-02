# indexcards

The API element of the new Tabroom.com 4.0.

> [!CAUTION]
> This is a prerelease version of the new api. This api is not live currently and even when it is released in beta, no guarantees are made to the stability or availability of the endpoints.

### For information related to the sister project, the Tabroom.com frontend re-write, see the [schemats project.](https://github.com/speechanddebate/schemats)

### for information on the project structure and norms see the [project docs](/docs/README.md)

## Getting setup

### 1) Clone and install

```bash
git clone https://github.com/speechanddebate/indexcards.git
cd indexcards
npm install
```

### 2) Create `config/config.js`

Copy the sample config and then update database + environment values for your machine:

```bash
cp config/config.sample.js config/config.js
```
  
At minimum, make sure your local values for `development` and `test` DB settings are correct in `config/config.js`.

### 3) Create and load the test database

Create a MariaDB/MySQL database (for example `tabtest`) and import `tests/test.sql`:

```bash
mysql -u <user> -p -e "CREATE DATABASE IF NOT EXISTS tabtest;"
mysql -u <user> -p tabtest < tests/test.sql
```

Then run tests with the test environment:

```bash
npm run test
```

### 4) Run the API and open Scalar

Start the server:
```bash
npm run dev
```

Open the API reference (Scalar) at:

- `http://<HOST>:<PORT>/v1/reference`

> [!NOTE]
> You will likely need to be 'logged in' for certain endpoints. You should be able to register a user and login with the auth endpoints in the scalar UI. the login endpoint will return a token that you will then need to send as a bearer token.



