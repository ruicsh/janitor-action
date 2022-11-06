import type * as GH from './@types/github.d';
import { req } from './lib/github-rest';
import { getRepos } from './lib/get-repos';

interface IRelease {
	repo: string;
	releaseId: string;
	created_at: string;
}

async function getReleasesToDeleteForRepos(repos: string[]) {
	const releases: IRelease[] = [];
	for await (const repo of repos) {
		type Response = GH.IRelease[];
		const repoReleases = await req<Response>(`GET /repos/${repo}/releases`, {
			per_page: '100',
		});

		const releasesForRepo = repoReleases
			.sort((a, b) => b.created_at.localeCompare(a.created_at))
			.map((release) => ({
				repo,
				releaseId: release.id,
				created_at: release.created_at,
			}));

		// always leave the latest release
		releases.push(...releasesForRepo.slice(1));
	}

	return releases;
}

async function deleteRelease(release: IRelease) {
	const { repo, releaseId } = release;
	await req(`DELETE /repos/${repo}/releases/${releaseId}`);
	console.log(repo, releaseId);
}

interface IDeleteOldReleasesArgs {
	orgs?: string[];
	user?: string;
}

export async function deleteOldReleases(args: IDeleteOldReleasesArgs) {
	const { orgs = [], user } = args;

	const repos = await getRepos({ orgs, user });
	const releases = await getReleasesToDeleteForRepos(repos);

	console.log(`Found ${releases.length} release to delete`);
	for await (const release of releases) {
		await deleteRelease(release);
	}
}
