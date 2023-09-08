import shell from '@tuplo/shell';

async function main() {
	const $ = shell.$({ verbose: true });
	const flags = [
		'--rm',
		// '--env INPUT_ORGS=cinemite,cinemite-dev',
		'--env INPUT_USER=ruicsh',
		// '--env INPUT_OPERATIONS=containers,packages,releases,tags,workflow-runs',
		'--env INPUT_OPERATIONS=workflow-runs',
		'--env GIT_PASSWORD',
		'--env GIT_USER',
		'ruicsh/janitor-action',
	];

	await $`docker run ${flags}`;
}

main();
