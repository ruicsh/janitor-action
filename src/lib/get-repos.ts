import config from '../config';
import { req } from './github-rest';

type IReposResponse = { full_name: string }[];

async function listReposForOrg(org: string) {
	if (!org) return [];

	const response = await req<IReposResponse>(`GET /orgs/${org}/repos`);
	return (response || []).map((r) => r.full_name);
}

async function listReposForUser() {
	const response = await req<IReposResponse>(`GET /user/repos`);
	return (response || []).map((r) => r.full_name);
}

interface IGetReposArgs {
	orgs: string[];
	user: string;
}

export async function getRepos(args: Partial<IGetReposArgs>) {
	const { orgs = [], user } = args;
	const repos = [];
	const gitUser = config.get('github.user');

	for await (const org of orgs) {
		const fresh = await listReposForOrg(org);
		repos.push(...fresh);
	}

	if (user && user === gitUser) {
		const fresh = await listReposForUser();
		repos.push(...fresh);
	}

	return repos;
}
