import config from '../config';
import { reqAll } from './github-rest';
import { pMap } from '../helpers';

type IReposResponse = {
	full_name: string;
}[];

async function listReposForOrg(org: string) {
	if (!org || org === '""') return [];

	return reqAll<IReposResponse[0]>(`GET /orgs/${org}/repos`);
}

async function listReposForUser() {
	return reqAll<IReposResponse[0]>(`GET /user/repos`);
}

type IGetReposArgs = {
	orgs: string[];
	user: string;
};

export async function getRepos(args: Partial<IGetReposArgs>) {
	const { orgs = [], user } = args;
	const gitUser = config.get('github.user');

	const repoLists = await pMap(orgs, listReposForOrg);
	const repos: string[] = [];
	for (const list of repoLists) {
		repos.push(...list.map((r) => r.full_name));
	}

	if (user && user === gitUser) {
		const userRepos = await listReposForUser();
		repos.push(...userRepos.map((r) => r.full_name));
	}

	return repos;
}
