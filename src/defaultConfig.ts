import { Config } from './config/Config';
import { YamlParser } from './parsers/YamlParser';

export const defaultConfig: Config = {
	rootDir: '',
	parserType: 'yml',
	changelogPaths: {
		unreleased: './changelogs/unreleased',
		release: 'CHANGELOG.md',
	},
	customParsers: {
		yml: YamlParser,
	},
	changelogIdentifier: /^\=\= [0-9]\.[0-9]\.[0-9].*/,
};
