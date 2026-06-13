import { getOctokit, getAuthenticatedUser } from './octokit';
import { pMap } from '../helpers';

export type RepoRef = {
	owner: string;
	repo: string;
};

async function listReposForOrg(org: string) {
	if (!org || org === '""') {
		console.log(`listReposForOrg: skipping empty org "${org}"`);
		return [];
	}

	const octokit = getOctokit();
	console.log(`listReposForOrg: fetching repos for org "${org}"`);
	const repos = await octokit.paginate(octokit.rest.repos.listForOrg, { org, per_page: 100 });
	console.log(`listReposForOrg: found ${repos.length} repos for org "${org}"`);
	return repos;
}

async function listReposForUser() {
	const octokit = getOctokit();
	return octokit.paginate(octokit.rest.repos.listForAuthenticatedUser, { per_page: 100 });
}

type IGetReposArgs = {
	orgs: string[];
	user: string;
};

export async function getRepos(args: Partial<IGetReposArgs>) {
	const { orgs = [], user } = args;

	console.log(`getRepos: orgs=${JSON.stringify(orgs)}, user=${JSON.stringify(user)}`);

	const repoLists = await pMap(orgs, listReposForOrg);
	const repos: RepoRef[] = [];
	for (const list of repoLists) {
		repos.push(...list.map((r) => ({ owner: r.owner.login, repo: r.name })));
	}

	if (user) {
		const gitUser = await getAuthenticatedUser();
		if (user === gitUser) {
			const userRepos = await listReposForUser();
			repos.push(...userRepos.map((r) => ({ owner: r.owner.login, repo: r.name })));
		}
	}

	return repos;
}
