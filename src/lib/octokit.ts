import { Octokit } from 'octokit';
import type { EndpointDefaults } from '@octokit/types';
import config from '../config';

let _octokit: Octokit | null = null;

export function resetOctokit(): void {
	_octokit = null;
}

export function getOctokit(): Octokit {
	if (_octokit) return _octokit;

	const token = config.get('github.password');
	if (!token) {
		throw new Error('GIT_PASSWORD is not set');
	}

	_octokit = new Octokit({
		auth: token,
		throttle: {
			onRateLimit: (retryAfter: number, options: Required<EndpointDefaults>) => {
				console.warn(
					`Rate limit hit for ${options.method} ${options.url}. Retrying in ${retryAfter}s.`
				);
				return true;
			},
			onSecondaryRateLimit: (retryAfter: number, options: Required<EndpointDefaults>) => {
				console.warn(
					`Secondary rate limit for ${options.method} ${options.url}. Retrying in ${retryAfter}s.`
				);
				return true;
			},
		},
	});

	return _octokit;
}
