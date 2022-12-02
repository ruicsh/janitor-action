import * as env from 'env-var';

export async function req<T>(
	command: string,
	params: Record<string, string> = {}
): Promise<T> {
	const baseUrl = 'https://api.github.com';
	const [method, path] = command.split(' ') as [string, string];
	const url = new URL([baseUrl, path].join(''));
	const sp = new URLSearchParams(params);
	url.search = sp.toString();
	const token = env.get('GIT_PASSWORD').required().asString();

	return fetch(url.href, {
		method,
		headers: {
			Accept: 'application/vnd.github.v3+json',
			Authorization: `bearer ${token}`,
			'Content-type': 'application/json',
			'User-Agent': 'ruicsh/janitor-action',
		},
	})
		.then((res) => res.text())
		.then((data) => {
			if (data.length) return JSON.parse(data);
			return {};
		});
}
