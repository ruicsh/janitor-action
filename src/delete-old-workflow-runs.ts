import { getRepos } from './lib/get-repos';
import { reqAll, req } from './lib/github-rest';
import { pMap } from './helpers';

type IRun = {
	repo: string;
	runId: string;
};

function daysAgo(date: Date) {
	return Math.floor((Date.now() - date.getTime()) / (1_000 * 60 * 60 * 24));
}

async function getWorkflowRunsForRepos(repos: string[]) {
	const runLists = await pMap(repos, async (repo) => {
		const runs = await reqAll<IWorkflowRun>(
			`GET /repos/${repo}/actions/runs`
		);
		return runs
			.filter((run) => daysAgo(new Date(run.run_started_at)) > 3)
			.map((run) => ({ repo: run.repository.full_name, runId: run.id }));
	});

	const allRuns: IRun[] = [];
	for (const runList of runLists) {
		allRuns.push(...runList);
	}
	return allRuns;
}

async function deleteWorkflowRun(run: IRun) {
	const { repo, runId } = run;
	await req(`DELETE /repos/${repo}/actions/runs/${runId}`);
}

type IDeleteOldWorkflows = {
	orgs?: string[];
	user?: string;
};

export async function deleteOldWorkflows(args: IDeleteOldWorkflows) {
	const { orgs = [], user } = args;

	const repos = await getRepos({ orgs, user });
	const runs = await getWorkflowRunsForRepos(repos);

	console.log(`Found ${runs.length} workflow runs to delete`);
	await pMap(runs, deleteWorkflowRun);
}
