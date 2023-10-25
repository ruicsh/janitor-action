import config from './config';
import { deleteOldContainers } from './delete-old-containers';
import { deleteOldPackages } from './delete-old-packages';
import { deleteOldReleases } from './delete-old-releases';
import { deleteOldTags } from './delete-old-tags';
import { deleteOldWorkflows } from './delete-old-workflow-runs';
import { cleanListOfStrings } from './helpers';

function getArgs() {
	const orgs = config.get('orgs');
	const operations = config.get('operations');
	const user = config.get('user');

	return {
		orgs: cleanListOfStrings(orgs),
		operations: cleanListOfStrings(operations),
		user,
	};
}

async function main() {
	const { orgs, operations, user } = getArgs();

	console.log('orgs', orgs);
	console.log('operations', operations);
	console.log('user', user);

	if (operations.includes('containers')) {
		await deleteOldContainers({ orgs });
	}

	if (operations.includes('packages')) {
		await deleteOldPackages({ orgs });
	}

	if (operations.includes('releases')) {
		await deleteOldReleases({ orgs });
	}

	if (operations.includes('tags')) {
		await deleteOldTags({ orgs });
	}

	if (operations.includes('workflow-runs')) {
		await deleteOldWorkflows({ orgs, user });
	}
}

main();
