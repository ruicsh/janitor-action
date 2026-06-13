import { getOctokit } from './lib/octokit';
import { getRepos, type RepoRef } from './lib/get-repos';
import { pMap } from './helpers';

type IPackageRelease = {
	owner: string;
	repo: string;
	releaseId: number;
	created_at: string;
};

async function getReleasesToDeleteForRepos(repos: RepoRef[]) {
	const octokit = getOctokit();

	const releaseLists = await pMap(repos, async ({ owner, repo }) => {
		const repoReleases = await octokit.paginate(
			octokit.rest.repos.listReleases,
			{ owner, repo, per_page: 100 }
		);
		return repoReleases
			.sort((a, b) => b.created_at.localeCompare(a.created_at))
			.slice(1)
			.map((release) => ({
				owner,
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
	const octokit = getOctokit();
	try {
		await octokit.rest.repos.deleteRelease({
			owner: release.owner,
			repo: release.repo,
			release_id: release.releaseId,
		});
		console.log(`${release.owner}/${release.repo}`, release.releaseId);
	} catch (error) {
		console.error(
			`Failed to delete release ${release.owner}/${release.repo}#${release.releaseId}:`,
			error,
		);
	}
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
