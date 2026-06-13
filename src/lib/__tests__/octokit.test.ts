import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getOctokit, resetOctokit } from '../octokit';
import config from '../../config';

vi.mock('../../config', () => ({
	default: {
		get: vi.fn(),
	},
}));

vi.mock('octokit', () => {
	const Octokit = vi.fn(function () {
		return {
			rest: {},
			throttle: {},
		};
	});
	return { Octokit };
});

describe('octokit', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		resetOctokit();
	});

	it('should throw if GIT_PASSWORD is not set', () => {
		vi.mocked(config.get).mockReturnValue(undefined as never);
		expect(() => getOctokit()).toThrow('GIT_PASSWORD is not set');
	});

	it('should create an Octokit instance if GIT_PASSWORD is set', () => {
		vi.mocked(config.get).mockReturnValue('fake-token');
		const octokit = getOctokit();
		expect(octokit).toBeDefined();
	});

	it('should return the same singleton instance on subsequent calls', () => {
		vi.mocked(config.get).mockReturnValue('fake-token');
		const a = getOctokit();
		const b = getOctokit();
		expect(a).toBe(b);
	});
});
