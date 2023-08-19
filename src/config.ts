import convict from 'convict';

const config = convict({
	orgs: {
		doc: 'List of orgs to delete from',
		format: String,
		default: '',
		env: 'INPUT_ORGS',
	},
	operations: {
		doc: 'List of operations to perform',
		format: ['containers', 'packages', 'releases', 'tags', 'workflow-runs'],
		default: '',
		env: 'INPUT_OPERATIONS',
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
