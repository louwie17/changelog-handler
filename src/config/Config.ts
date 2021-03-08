import { Parser } from '../parsers/Parser';
import { ChangelogData } from '../types/ChangelogData';

export interface Config {
	rootDir: string;
	parserType: string;
	changelogPaths: {
		unreleased: string; // Defaults: changelogs/unreleased
		release: string; // Changelog.md
	};
	customParsers: {
		[key: string]: new () => Parser<ChangelogData>;
	};
}
