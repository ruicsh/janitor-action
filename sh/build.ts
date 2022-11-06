import 'zx/globals';

async function main() {
	const flags = ['--tag ruicsh/janitor-action:latest', '.']
		.flatMap((f) => f.split(' '))
		.filter(Boolean);

	await $`docker build ${flags}`;
}

main();
