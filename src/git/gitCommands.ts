import * as util from 'util';
import * as child from 'child_process';

const exec = util.promisify(child.exec);

export async function getBranchName(): Promise<string> {
	const { stdout } = await exec('git rev-parse --abbrev-ref HEAD');
	return stdout;
}

const GET_GIT_PR_BRANCH_COMMAND =
	"git ls-remote origin 'pull/*/head' | grep -F -f <(git rev-parse HEAD) | awk -F'/' '{print $3}'";
export async function getGithubPRNumber(): Promise<string> {
	try {
		const { stdout } = await exec(GET_GIT_PR_BRANCH_COMMAND);
		return stdout;
	} catch (e) {
		console.log('Failed Receiving Github PR number');
	}
	return '';
	// console.log(stderr);
}
