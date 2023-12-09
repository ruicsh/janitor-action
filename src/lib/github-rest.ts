import config from '../config';

export async function req<T>(
	command: string,
	params: Record<string, string> = {}
): Promise<T> {
	const token = config.get('github.password');

	const uri = new URL('https://api.github.com');
	const [method, pathname] = command.split(' ') as [string, string];
	uri.pathname = pathname;
	const sp = new URLSearchParams(params);
	uri.search = sp.toString();

	return fetch(uri.href, {
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
			if (data.length) {
				return JSON.parse(data);
			}

			return null;
		});
}
