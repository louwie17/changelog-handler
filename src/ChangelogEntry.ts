import * as fs from 'fs';
import YAML from 'yaml';
import { getBranchName, getGithubPRNumber } from './git';

export interface EntryOptions {
	changelogEntry: string;
	force: boolean;
	mergeRequest: number;
	dryRun: boolean;
	gitUsername: string;
	type: string;
}

export class ChangelogEntry {
	private options: EntryOptions;

	constructor(options: EntryOptions) {
		this.options = options;
	}

	public async execute() {
		// assert_feature_brach!
		// assert_title! unless editor
		// assert_new_file!
		// assert_valid_type!
		// if (this.options.dry_run) {
		//   write
		//   amend_commit if options.amend
		// }
		// if (editor) {
		// system("#{editor} '#{file_path}'");
		// }
		const yamlStr = YAML.stringify(this.options);
		await this.write(yamlStr);
	}

	private async write(yamlStr: string) {
		const branchName = await getBranchName();
		console.log(branchName);
		const prNumber = await getGithubPRNumber();
		fs.writeFileSync(
			`./changelogs/unreleased/${branchName}.yaml`,
			yamlStr,
			'utf8'
		);
	}
}
