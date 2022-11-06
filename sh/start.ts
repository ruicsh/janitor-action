import 'zx/globals';

async function main() {
	const flags = [
		// '--env INPUT_ORGS=cinemite,cinemite-dev,tuplo',
		'--env INPUT_USER=ruicsh',
		'--env INPUT_OPERATIONS=workflow-runs',
		'--env GIT_PASSWORD',
		'--env GIT_USER',
		'ruicsh/janitor-action',
	]
		.flatMap((f) => f.split(' '))
		.filter(Boolean);

	await $`docker run ${flags}`;
}

main();
