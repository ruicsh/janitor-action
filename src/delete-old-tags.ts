import { getOctokit } from './lib/octokit';
import { getRepos, type RepoRef } from './lib/get-repos';
import { pMap } from './helpers';

type IRepoTag = {
	owner: string;
	repo: string;
	ref: string;
};

async function getTagsToDeleteForRepos(repos: RepoRef[]) {
	const octokit = getOctokit();

	const tagLists = await pMap(repos, async ({ owner, repo }) => {
		const repoTags = await octokit.paginate(
			octokit.rest.git.listMatchingRefs,
			{ owner, repo, ref: 'tags/', per_page: 100 }
		);
		if (repoTags.length < 2) return [];

		return repoTags
			.slice(0, repoTags.length - 1)
			.map((tag) => ({ owner, repo, ref: tag.ref }));
	});

	const tags: IRepoTag[] = [];
	for (const tagList of tagLists) {
		tags.push(...tagList);
	}
	return tags;
}

async function deleteTag(tag: IRepoTag) {
	const octokit = getOctokit();
	try {
		await octokit.rest.git.deleteRef({
			owner: tag.owner,
			repo: tag.repo,
			// listMatchingRefs returns "refs/tags/v1", deleteRef expects "tags/v1"
			ref: tag.ref.replace('refs/', ''),
		});
		console.log(`${tag.owner}/${tag.repo}`, tag.ref);
	} catch (error) {
		console.error(
			`Failed to delete ref ${tag.owner}/${tag.repo} ${tag.ref}:`,
			error,
		);
	}
}

type IDeleteOldTags = {
	orgs?: string[];
	user?: string;
};

export async function deleteOldTags(args: IDeleteOldTags) {
	const { orgs = [], user } = args;

	const repos = await getRepos({ orgs, user });
	const tags = await getTagsToDeleteForRepos(repos);

	console.log(`Found ${tags.length} tags to delete`);
	await pMap(tags, deleteTag);
}
