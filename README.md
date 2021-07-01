# Changelog Handler

Handles changelog entries by storing them as seperate files within a changelog folder for each pull request.

## Installation


## Configure (optional)

```json
// .changelog.config.json
{
	"changelogPaths": {
		"unreleased": "./changelogs", // changelog entry paths
		"release": "changelog.md" // name/path of changelog release file
	}
}
```

Config files can also be stored as `js` or `ts` files, or specified using the `--config <config path>` param.

## Usage

### Creating a changelog entry

`npx changelog "description of change" -m 1000 -t bug`

### Creating a release

`npx release -v 1.0.0`

This updates the **CHANGELOG.md** file with the unreleased changelogs.
This also deletes the changelog entries.

## Custom Parser

By default we use `yml` to store the changelog data. This can be changed by passing in a custom parser.
The custom parser should follow the format of the [Parser abstract](./src/parsers/Parser.ts).

```js
// .changelog.config.js
const Parser = require('./parser');
const config = {
    parserType: 'test',
	customParsers: {
		test: Parser,
	}
}
module.exports = config;

// parser.js
class Parser {
    constructor() {
        this.fileExtension = 'test';
    }

    write(data, filepath) {
        console.log(data, filepath);
    }

    read(filepath) {
        console.log(filepath);
    }
}

module.exports = Parser;
```