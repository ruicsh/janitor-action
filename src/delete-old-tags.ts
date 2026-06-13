import { getRepos } from './lib/get-repos';
import { reqAll, req } from './lib/github-rest';
import { pMap } from './helpers';

type IRepoTag = {
	repo: string;
	ref: string;
};

async function getTagsToDeleteForRepos(repos: string[]) {
	const tagLists = await pMap(repos, async (repo) => {
		const repoTags = await reqAll<IReference>(
			`GET /repos/${repo}/git/matching-refs/tags`
		);
		if (repoTags.length < 2) return [];

		return repoTags
			.slice(0, repoTags.length - 1)
			.map((tag) => ({ repo, ref: tag.ref }));
	});

	const tags: IRepoTag[] = [];
	for (const tagList of tagLists) {
		tags.push(...tagList);
	}
	return tags;
}

async function deleteTag(tag: IRepoTag) {
	const { repo, ref } = tag;
	await req(`DELETE /repos/${repo}/git/${ref}`);
	console.log(repo, ref);
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
