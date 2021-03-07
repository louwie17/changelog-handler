import { AssertionError } from 'assert';
import { constants, accessSync } from 'fs';
import { getBranchName, getGithubPRNumber } from './git';
import { Parser } from './parsers';
import { YamlParser } from './parsers/YamlParser';

export interface EntryOptions {
	title: string;
	force: boolean;
	dryRun: boolean;
	gitUsername: string;
	type: string;
	mergeRequest: string;
}

interface ChangelogData {
	title: string;
	type: string;
	merge_request: string;
	author?: string;
}

export class ChangelogEntry {
	private parser: Parser<ChangelogData>;

	constructor(private options: EntryOptions) {
		this.parser = new YamlParser<ChangelogData>();
	}

	public async execute() {
		this.assertTitle(this.options.title);
		const prNumber = await this.getPRNumber();
		const branchName = await getBranchName();

		const filepath = `./changelogs/unreleased/${prNumber}-${branchName}.${this.parser.fileExtension}`;

		this.assertNewFile(filepath);
		// assert_valid_type!
		// if (this.options.dry_run) {
		//   write
		//   amend_commit if options.amend
		// }
		return await this.write(filepath, prNumber);
	}

	private async write(filepath: string, prNumber: string) {
		return await this.parser.write(
			{
				title: this.options.title,
				merge_request: prNumber,
				type: this.options.type,
				author: this.options.gitUsername,
			},
			filepath
		);
	}

	private async getPRNumber(): Promise<string> {
		const prNumber = await getGithubPRNumber();
		if (!prNumber) {
			throw new AssertionError({
				message: 'No Pull Request created for this branch!',
			});
		}
		return prNumber;
	}

	private assertTitle(title: string): void {
		if (!title) {
			throw new AssertionError({
				message:
					'Provide a title for the changelog entry or use `--amend`" \
				" to use the title from the previous commit.',
			});
		}
	}

	private assertNewFile(filepath: string) {
		if (this.options.force) {
			return;
		}
		let exists = false;
		try {
			accessSync(filepath, constants.F_OK);
			exists = true;
		} catch {
			// do nothing
		}
		if (exists) {
			throw new AssertionError({
				message: `${filepath} already exists! Use '--force' to overwrite.`,
			});
		}
	}
}
