import convict from 'convict';

const config = convict({
	orgs: {
		doc: 'List of orgs to delete from',
		format: Array,
		default: [],
		env: 'INPUT_ORGS',
	},
	operations: {
		doc: 'List of operations to perform',
		format: Array,
		default: [],
		env: 'INPUT_OPERATIONS',
		validate: (operations: string[]) => {
			if (!Array.isArray(operations)) {
				throw new Error('must be of type Array');
			}

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
		user: {
			doc: 'GitHub user',
			format: String,
			default: '',
			env: 'GIT_USER',
		},
		password: {
			doc: 'GitHub password',
			format: String,
			default: '',
			env: 'GIT_PASSWORD',
		},
	},
});

config.validate({ allowed: 'strict' });

export default config;
