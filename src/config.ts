import convict from 'convict';

convict.addFormat({
	name: 'comma-separated-array',
	validate: (val: unknown) => {
		if (typeof val !== 'string' && !Array.isArray(val)) {
			throw new Error('must be a comma-separated string or an array');
		}
	},
	coerce: (val: string) => {
		if (typeof val === 'string') {
			return val.split(',').map((s) => s.trim()).filter(Boolean);
		}
		return val;
	},
});

const config = convict({
	orgs: {
		doc: 'List of orgs to delete from',
		format: 'comma-separated-array',
		default: [],
		env: 'INPUT_ORGS',
	},
	operations: {
		doc: 'List of operations to perform',
		format: 'comma-separated-array',
		default: [],
		env: 'INPUT_OPERATIONS',
		validate: (operations: string[]) => {
			const allowed = [
				'containers',
				'packages',
				'releases',
				'tags',
				'workflow-runs',
			];

			for (const operation of operations) {
				if (!allowed.includes(operation)) {
					throw new Error(`operation ${operation} not allowed`);
				}
			}
		},
	},
	user: {
		doc: 'User to delete workflow runs from',
		format: String,
		default: '',
		env: 'INPUT_USER',
	},
	github: {
		token: {
			doc: 'GitHub token',
			format: String,
			default: '',
			env: 'GH_TOKEN',
		},
	},
});

config.validate({ allowed: 'strict' });

export default config;
