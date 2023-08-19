import config from '../config';

export async function req<T>(
	command: string,
	params: Record<string, string> = {}
): Promise<T> {
	const token = config.get('github.password');

	const url = new URL('https://api.github.com');
	const [method, pathname] = command.split(' ') as [string, string];
	url.pathname = pathname;
	const sp = new URLSearchParams(params);
	url.search = sp.toString();

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
