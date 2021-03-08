import { Config } from './config/Config';
import { YamlParser } from './parsers/YamlParser';

export const defaultConfig: Config = {
	rootDir: '',
	parserType: 'yml',
	changelogPaths: {
		unreleased: './changelogs/unreleased',
		release: 'Changelog.md',
	},
	customParsers: {
		yml: YamlParser,
	},
};
