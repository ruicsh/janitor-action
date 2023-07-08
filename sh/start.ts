import shell from '@tuplo/shell';

async function main() {
	const $ = shell.$({ verbose: true });
	const flags = [
		'--env INPUT_ORGS=cinemite,cinemite-dev',
		'--env INPUT_USER=ruicsh',
		'--env INPUT_OPERATIONS=containers',
		'--env GIT_PASSWORD',
		'--env GIT_USER',
		'ruicsh/janitor-action',
	];

	await $`docker run ${flags}`;
}

main();
