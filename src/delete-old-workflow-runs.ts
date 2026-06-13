import { getOctokit } from './lib/octokit';
import { getRepos, type RepoRef } from './lib/get-repos';
import { pMap } from './helpers';

type IRun = {
	owner: string;
	repo: string;
	runId: number;
};

function daysAgo(date: Date) {
	return Math.floor((Date.now() - date.getTime()) / (1_000 * 60 * 60 * 24));
}

async function getWorkflowRunsForRepos(repos: RepoRef[]) {
	const octokit = getOctokit();

	const runLists = await pMap(repos, async ({ owner, repo }) => {
		const runs = await octokit.paginate(
			octokit.rest.actions.listWorkflowRunsForRepo,
			{ owner, repo, per_page: 100 }
		);
		return runs
			.filter((run) => run.run_started_at && daysAgo(new Date(run.run_started_at)) > 3)
			.map((run) => ({ owner, repo, runId: run.id }));
	});

	const allRuns: IRun[] = [];
	for (const runList of runLists) {
		allRuns.push(...runList);
	}
	return allRuns;
}

async function deleteWorkflowRun(run: IRun) {
	const octokit = getOctokit();
	try {
		await octokit.rest.actions.deleteWorkflowRun({
			owner: run.owner,
			repo: run.repo,
			run_id: run.runId,
		});
		console.log(`${run.owner}/${run.repo}`, run.runId);
	} catch (error) {
		console.error(
			`Failed to delete workflow run ${run.owner}/${run.repo}#${run.runId}:`,
			error,
		);
	}
}

type IDeleteOldWorkflows = {
	orgs?: string[];
	user?: string;
};

export async function deleteOldWorkflows(args: IDeleteOldWorkflows) {
	const { orgs = [], user } = args;

	const repos = await getRepos({ orgs, user });
	console.log(`Found ${repos.length} repos`);
	for (const repo of repos) {
		console.log(`  ${repo.owner}/${repo.repo}`);
	}
	const runs = await getWorkflowRunsForRepos(repos);

	console.log(`Found ${runs.length} workflow runs to delete`);
	await pMap(runs, deleteWorkflowRun);
}
