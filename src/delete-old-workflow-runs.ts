import { getRepos } from './lib/get-repos';
import { req } from './lib/github-rest';

type IRun = {
	repo: string;
	runId: string;
};

function diffDays(date1: Date, date2: Date) {
	const diff = date2.getTime() - date1.getTime();
	return Math.floor(diff / (1_000 * 60 * 60 * 24));
}

async function getWorkflowRunsForRepos(repos: string[]) {
	const today = new Date();
	const runs: IRun[] = [];
	for await (const repo of repos) {
		type Response = { workflow_runs: IWorkflowRun[] };
		const { workflow_runs = [] } = await req<Response>(
			`GET /repos/${repo}/actions/runs`,
			{ per_page: '100' }
		);
		if (!Array.isArray(workflow_runs)) continue;

		const oldRuns = workflow_runs
			.filter((run) => diffDays(today, new Date(run.run_started_at)) <= -3)
			.map((run) => ({ repo: run.repository.full_name, runId: run.id }));

		runs.push(...oldRuns);
	}

	return runs;
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
	for await (const run of runs) {
		await deleteWorkflowRun(run);
	}
}
