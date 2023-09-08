import config from './config';
import { deleteOldContainers } from './delete-old-containers';
import { deleteOldPackages } from './delete-old-packages';
import { deleteOldReleases } from './delete-old-releases';
import { deleteOldTags } from './delete-old-tags';
import { deleteOldWorkflows } from './delete-old-workflow-runs';

async function main() {
	const orgs = config.get('orgs');
	const operations = config.get('operations') as IOperation[];
	const user = config.get('user');

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
