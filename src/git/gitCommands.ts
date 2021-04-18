import { promisify } from 'util';
import * as child from 'child_process';

const exec = promisify(child.exec);

/**
 * Trims text and removes newlines as well.
 */
function trim(text = ''): string {
	return text.replace(/^\s+|\s+$/g, '');
}

export async function getBranchName(): Promise<string> {
	try {
		const { stdout } = await exec('git rev-parse --abbrev-ref HEAD');
		return trim(stdout);
	} catch {
		const { stdout } = await exec('git branch --show-current');
		return trim(stdout);
	}
}

const GET_GIT_PR_BRANCH_COMMAND =
	"git ls-remote origin 'pull/*/head' | grep -F -f <(git rev-parse HEAD) | awk -F'/' '{print $3}'";
export async function getGithubPRNumber(): Promise<string> {
	try {
		const { stdout } = await exec(GET_GIT_PR_BRANCH_COMMAND);
		return trim(stdout);
	} catch (e) {
		return '';
	}
}
