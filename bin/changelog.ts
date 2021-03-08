#!/usr/bin/env node

import { Command } from 'commander';
import { ChangelogEntry } from '../src/ChangelogEntry';
import { EntryOptions } from './types';
const program = new Command();

program
	.arguments('<changelogEntry>')
	.option('-f, --force', 'Overwrite an existing entry')
	.option('-m, --merge-request <integer>', 'Merge Request ID')
	.option('-n, --dry-run', "Don't actually write anything, just print")
	.option(
		'-u, --git-username <string>',
		'Use Git user.name configuration as the author'
	)
	.option('-t, --type <string>', 'The category of the change')
	.option('-e, --ee', 'Generate a changelog entry for GitLab EE')
	.option('-c, --config <configPath>', 'Path of custom changelog config.')
	.parse(process.argv);

const options = program.opts() as EntryOptions;

new ChangelogEntry({
	...options,
	title: program.args[0],
})
	.execute()
	.then(() => {
		process.exit();
	})
	.catch((error: Error) => {
		console.log('ERROR: ' + error.message);
		process.exit(1);
	});
