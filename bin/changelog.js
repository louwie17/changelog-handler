#!/usr/bin/env node

const program = require('commander');
const path = require('path');
const fs = require('fs');

program
	.option('-f, --force', 'Overwrite an existing entry')
	.option('-m', '--merge-request <integer>', 'Merge Request ID')
	.option('-n', '--dry-run', "Don't actually write anything, just print")
	.option(
		'-u',
		'--git-username',
		'Use Git user.name configuration as the author'
	)
	.option(
		'-t',
		'--type <string>',
		"The category of the change, valid options are: #{TYPES.map(&:name).join(', ')}"
	)
	.option('-e', '--ee', 'Generate a changelog entry for GitLab EE')
	.parse(process.argv);

const options = program.opts();
if (options.debug) {
	console.log(options);
}
console.log('pizza details:');
if (options.small) {
	console.log('- small pizza size');
}
if (options.pizzaType) {
	console.log(`- ${options.pizzaType}`);
}

process.exit();
