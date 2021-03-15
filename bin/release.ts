import { Command } from 'commander';
import { Release } from '../src/Release';
import { ReleaseOptions } from './types';
const program = new Command();

program
	.option('-f, --force', 'Overwrite an existing entry')
	.option('-v, --version <string>', 'Release version. Ex: 1.1.0')
	.option('-d, --date', 'Date of release, defaults to today')
	.option('-n, --dry-run', "Don't actually write anything, just print")
	.option('-cp, --cherry-pick', 'Cherry pick a pull request')
	.option('-prnum, --pr-numbers <prNumbers>', 'comma separated list', (val) =>
		val.split(',')
	)
	.option('-c, --config <configPath>', 'Path of custom changelog config.')
	.parse(process.argv);

const options = program.opts() as ReleaseOptions;

new Release(options)
	.execute()
	.then(() => {
		process.exit();
	})
	.catch((error: Error) => {
		console.log('ERROR: ' + error.message);
		process.exit(1);
	});
