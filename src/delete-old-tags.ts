import type * as GH from './@types/github.d';
import { req } from './lib/github-rest';
import { getRepos } from './lib/get-repos';

interface ITag {
	repo: string;
	ref: string;
}

async function getTagsToDeleteForRepos(repos: string[]) {
	const tags: ITag[] = [];
	for await (const repo of repos) {
		type Response = GH.IReference[];
		const repoTags = await req<Response>(
			`GET /repos/${repo}/git/matching-refs/tags`,
			{ per_page: '100' }
		);
		if (repoTags.length < 2) continue;

		const oldRepoTags = repoTags
			.slice(0, repoTags.length - 1)
			.map((tag) => ({ repo, ref: tag.ref }));

		tags.push(...oldRepoTags);
	}

	return tags;
}

async function deleteTag(tag: ITag) {
	const { repo, ref } = tag;
	await req(`DELETE /repos/${repo}/git/${ref}`);
	console.log(repo, ref);
}

interface IDeleteOldTags {
	orgs?: string[];
	user?: string;
}

export async function deleteOldTags(args: IDeleteOldTags) {
	const { orgs = [], user } = args;

	const repos = await getRepos({ orgs, user });
	const tags = await getTagsToDeleteForRepos(repos);

	console.log(`Found ${tags.length} tags to delete`);
	for await (const tag of tags) {
		await deleteTag(tag);
	}
}
