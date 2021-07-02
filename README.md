# Changelog Handler

Handles changelog entries by storing them as seperate files within a changelog folder for each pull request.

## Installation

## Configure (optional)

```json
// .changelog.config.json
{
  "changelogPaths": {
    "unreleased": "./changelogs",
    "release": "changelog.md"
  }
}
```

| Config options            | Description                                                                                               |
| ------------------------- | --------------------------------------------------------------------------------------------------------- |
| changelogPaths.unreleased | changelog entry paths (default: './changelogs/unreleased')                                                |
| changelogPaths.release    | name + path of changelog release file (default: 'CHANGELOG.md')                                           |
| parserType                | parser type, must match supported types in customParsers (default: 'yml')                                 |
| customParsers             | Object of key value pairs of custom parsers (see [example below](#custom-parser))                         |
| changelogIdentifier       | Regex of changelog identifier to match in changelog file (default: `/^\=\= [0-9]\.[0-9]\.[0-9].*/`)       |
| rootDir                   | To specify a different root directory for changelog entries (default: '')                                 |
| releaseTemplateFile       | Custom release template file (in mustache format) (default: [template.mustache](./src/template.mustache)) |
| releaseTemplate           | Custom release template in string (in mustache format)                                                    |

Config files can also be stored as `js` or `ts` files, or specified using the `--config <config path>` param.

## Usage

### Creating a changelog entry

`npx changelog "description of change" -m 1000 -t bug`

### Creating a release

`npx release -v 1.0.0`

This updates the **CHANGELOG.md** file with the unreleased changelogs.
This also deletes the changelog entries.

## Custom Release Template

You can define a custom release template. This can be done by using the `releaseTemplateFile` or `releaseTemplate` config.
The mustache variables that are available:

| Template variables | Description                                                      |
| ------------------ | ---------------------------------------------------------------- |
| entries            | changelog entry paths (default: './changelogs/unreleased')       |
| version            | The version passed in through --version                          |
| date               | The current date as a locale date string                         |
| title              | Custom title passed in through --title or '{{version}} {{date}}' |
| count              | Total count of entries                                           |
| singleChange       | A boolean if entries is of length 1                              |

See the default mustache template as an example [here](./src/template.mustache).

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
  },
};
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
