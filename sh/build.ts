import shell from '@tuplo/shell';

async function main() {
	const $ = shell.$({ verbose: true });

	const flags = ['--tag ruicsh/janitor-action:latest', '.'];

	await $`docker build ${flags}`;
}

main();
