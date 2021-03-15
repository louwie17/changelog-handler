import { createReadStream, readdirSync, unlinkSync } from 'fs';
import * as path from 'path';
import Mustache from 'mustache';

import { getConfig } from './config';
import { Config } from './config/Config';
import { defaultConfig } from './defaultConfig';
import { Parser } from './parsers';
import { ChangelogData, ReleaseOptions } from './types';
import markupTemplate from './template.mustache';
import { createInterface } from 'readline';
import { once } from 'events';
import { insertChangelog } from './transform/insertChangelog';

/*
 * - Put the mark up in the necessary spot in the changelog
 * - Delete the unreleased files
 *
 * - List all change logs entries and allow use to select specifics
 */
export class Release {
	private config: Config;
	private parser: Parser<ChangelogData>;

	constructor(private options: ReleaseOptions) {
		// nothing
	}

	public async release() {
		await this.initialize();
	}

	public async execute() {
		await this.initialize();

		const entries = this.getChangelogEntries();
		if (entries.length === 0) {
			console.log('No changelogs available.');
			return;
		}
		const markdown = this.toMarkdown(entries.map((e) => e.data));
		// console.log(markdown);
		const success = this.getWriteLocations(markdown);
		if (success) {
			this.removeChangelogEntries(entries.map((e) => e.path));
		}
	}

	private async initialize() {
		this.config = await getConfig(defaultConfig, this.options.config);
		const ParserClass = this.config.customParsers[this.config.parserType];
		this.parser = new ParserClass();
	}

	private getChangelogEntries(): {
		path: string;
		data: ChangelogData;
	}[] {
		if (!this.config) {
			return [];
		}
		const files = readdirSync(this.config.changelogPaths.unreleased);
		return files.map((file) => {
			const filePath = this.config.changelogPaths.unreleased + '/' + file;
			return {
				path: filePath,
				data: this.parser.read(filePath),
			};
		});
	}

	private removeChangelogEntries(entries: string[]): void {
		for (const file of entries) {
			try {
				unlinkSync(file);
			} catch (err) {
				console.error(err);
			}
		}
	}

	private toMarkdown(entries: ChangelogData[]) {
		let date = this.options.date;
		if (!date && !this.options.title) {
			const today = new Date();
			date = today.toLocaleDateString();
		}
		// const template = readFileSync(markupTemplate, 'utf8'); for custom template
		const rendered = Mustache.render(markupTemplate, {
			entries,
			title: this.options.title
				? this.options.title
				: `${this.options.version} ${date}`,
			count: entries.length,
			singleChange: entries.length === 1,
		});
		return rendered;
	}

	private getWriteLocations(newChangelog: string) {
		const changelogPath = path.resolve(
			process.cwd(),
			this.config.changelogPaths.release
		);
		return insertChangelog(
			changelogPath,
			/^\=\= [0-9]\.[0-9]\.[0-9].*/,
			newChangelog
		);
		// await this.processLineByLine(changelogPath);
	}

	private async processLineByLine(fileName: string) {
		try {
			const stream = createReadStream(fileName);
			const rl = createInterface({
				input: stream,
				crlfDelay: Infinity,
			});

			let fileLength = 0;
			rl.on('line', (line) => {
				fileLength += line.length + 1;
				console.log(line);
				if (fileLength > 100) {
					rl.close();
				}
			});

			await once(rl, 'close');

			console.log(fileLength);
			console.log('File processed.');
		} catch (err) {
			console.error(err);
		}
	}
}
