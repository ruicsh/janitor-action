import { getRepos } from './lib/get-repos';
import { reqAll, req } from './lib/github-rest';
import { pMap } from './helpers';

type IPackageRelease = {
	repo: string;
	releaseId: string;
	created_at: string;
};

async function getReleasesToDeleteForRepos(repos: string[]) {
	const releaseLists = await pMap(repos, async (repo) => {
		const repoReleases = await reqAll<IRelease>(
			`GET /repos/${repo}/releases`
		);
		return repoReleases
			.sort((a, b) => b.created_at.localeCompare(a.created_at))
			.slice(1)
			.map((release) => ({
				repo,
				releaseId: release.id,
				created_at: release.created_at,
			}));
	});

	const releases: IPackageRelease[] = [];
	for (const list of releaseLists) {
		releases.push(...list);
	}
	return releases;
}

async function deleteRelease(release: IPackageRelease) {
	const { repo, releaseId } = release;
	await req(`DELETE /repos/${repo}/releases/${releaseId}`);
	console.log(repo, releaseId);
}

type IDeleteOldReleasesArgs = {
	orgs?: string[];
	user?: string;
};

export async function deleteOldReleases(args: IDeleteOldReleasesArgs) {
	const { orgs = [], user } = args;

	const repos = await getRepos({ orgs, user });
	const releases = await getReleasesToDeleteForRepos(repos);

	console.log(`Found ${releases.length} release to delete`);
	await pMap(releases, deleteRelease);
}
