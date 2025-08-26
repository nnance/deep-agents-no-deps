# Environment Manager

A dependency free module that loads environment variables from a .env file into process.env. Storing configuration in the environment separate from code is based on The Twelve-Factor App methodology.

## Implementation Details

1. **Loading Environment Variables**: The module should read the .env file and populate process.env with the defined variables.
2. **TypeScript Support**: Provide TypeScript definitions for the module to ensure type safety.
3. **Testing**: Include unit tests to verify the functionality of the environment variable loading.

### Implementation Details

The module exposes a single function `loadEnv` that loads environment variables from a .env file into process.env.  The .env file is expected to be formatted as key-value pairs, with each pair on a new line.  For example:

```
S3_BUCKET="YOURS3BUCKET"
SECRET_KEY="YOURSECRETKEYGOESHERE"
```

#### Options

- `path`: The path to the .env file (default: `.env`)
- `encoding`: The encoding of the .env file (default: `utf8`)
- `debug`: If true, will log the loaded environment variables (default: `false`)
- `override`: If true, will override existing environment variables (default: `false`)
- `silent`: If true, will suppress all logs (default: `false`)

## Usage

Create a `.env` file in the root of your project:

```dosini
S3_BUCKET="YOURS3BUCKET"
SECRET_KEY="YOURSECRETKEYGOESHERE"
```

As early as possible in your application, import and configure dotenv:

```javascript
import {loadEnv} from 'environments'
loadEnv()
```

That's it. `process.env` now has the keys and values you defined in your `.env` file:

```javascript
import {loadEnv} from 'environments'
loadEnv()

...

s3.getBucketCors({Bucket: process.env.S3_BUCKET}, function(err, data) {})
```