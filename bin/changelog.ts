#!/usr/bin/env node

import { Command } from 'commander';
import { ChangelogEntry, EntryOptions } from '../src/ChangelogEntry';
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
	.parse(process.argv);

const options = program.opts() as EntryOptions;
console.log(program.args);
console.log(options);
new ChangelogEntry({
	...options,
	changelogEntry: program.args[0],
})
	.execute()
	.then(() => {
		process.exit();
	});
