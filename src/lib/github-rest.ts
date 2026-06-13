import config from '../config';

async function handleResponse(res: Response) {
	if (!res.ok) {
		throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
	}
	const data = await res.text();
	return data.length ? JSON.parse(data) : null;
}

export async function req<T>(
	command: string,
	params: Record<string, string> = {}
): Promise<T> {
	const token = config.get('github.password');
	if (!token) {
		throw new Error('GIT_PASSWORD is not set');
	}

	const uri = new URL('https://api.github.com');
	const [method, pathname] = command.split(' ') as [string, string];
	uri.pathname = pathname;
	uri.search = new URLSearchParams(params).toString();

	const res = await fetch(uri.href, {
		method,
		headers: {
			Accept: 'application/vnd.github.v3+json',
			Authorization: `bearer ${token}`,
			'Content-type': 'application/json',
			'User-Agent': 'ruicsh/janitor-action',
		},
	});

	return handleResponse(res);
}

function parseLinkHeader(link: string | null): Record<string, string> {
	if (!link) return {};
	const links: Record<string, string> = {};
	for (const part of link.split(',')) {
		const match = part.match(/<([^>]+)>;\s*rel="([^"]+)"/);
		if (match) {
			links[match[2]] = match[1];
		}
	}
	return links;
}

export async function reqAll<T>(
	command: string,
	params: Record<string, string> = {}
): Promise<T[]> {
	const token = config.get('github.password');
	if (!token) {
		throw new Error('GIT_PASSWORD is not set');
	}

	const [method] = command.split(' ') as [string, string];
	if (method !== 'GET') {
		throw new Error('reqAll only supports GET requests');
	}

	const headers = {
		Accept: 'application/vnd.github.v3+json',
		Authorization: `bearer ${token}`,
		'Content-type': 'application/json',
		'User-Agent': 'ruicsh/janitor-action',
	};

	const results: T[] = [];
	let url: string | null = buildURL(command, { ...params, per_page: '100' });

	while (url) {
		const res = await fetch(url, { method: 'GET', headers });
		const data = await handleResponse(res);
		if (Array.isArray(data)) {
			results.push(...data);
		}
		const link = parseLinkHeader(res.headers.get('Link'));
		url = link.next || null;
	}

	return results;
}

function buildURL(command: string, params: Record<string, string>) {
	const uri = new URL('https://api.github.com');
	const [, pathname] = command.split(' ') as [string, string];
	uri.pathname = pathname;
	uri.search = new URLSearchParams(params).toString();
	return uri.href;
}
