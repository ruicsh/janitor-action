import { getOctokit } from './lib/octokit';
import { pMap } from './helpers';

type IContainerVersion = {
	org: string;
	packageName: string;
	versionId: number;
};

async function getContainerVersionsToDeleteForOrg(org: string) {
	const octokit = getOctokit();

	const containers = await octokit.paginate(
		octokit.rest.packages.listPackagesForOrganization,
		{ org, package_type: 'container', per_page: 100 }
	);

	const versionLists = await pMap(containers, async (container) => {
		const versions = await octokit.paginate(
			octokit.rest.packages.getAllPackageVersionsForPackageOwnedByOrg,
			{ org, package_type: 'container', package_name: container.name, per_page: 100 }
		);
		versions.sort((a, b) => b.created_at.localeCompare(a.created_at));

		return versions
			.slice(1)
			.filter((v) => !v.metadata?.container?.tags?.includes('latest'))
			.map((version) => ({
				org,
				packageName: container.name,
				versionId: version.id,
			}));
	});

	const versionsToDelete: IContainerVersion[] = [];
	for (const list of versionLists) {
		versionsToDelete.push(...list);
	}

	return versionsToDelete;
}

async function deleteContainerVersion(pkg: IContainerVersion) {
	const octokit = getOctokit();
	try {
		await octokit.rest.packages.deletePackageVersionForOrg({
			org: pkg.org,
			package_type: 'container',
			package_name: pkg.packageName,
			package_version_id: pkg.versionId,
		});
		console.log(pkg.org, pkg.packageName, pkg.versionId);
	} catch (error) {
		console.error(
			`Failed to delete container version ${pkg.org}/${pkg.packageName}#${pkg.versionId}:`,
			error,
		);
	}
}

async function deleteOldContainerVersionsForOrg(org: string): Promise<void> {
	const versions = await getContainerVersionsToDeleteForOrg(org);
	console.log(`Found ${versions.length} old containers on ${org} to delete`);
	await pMap(versions, deleteContainerVersion);
}

type IDeleteOldContainersArgs = {
	orgs?: string[];
};

export async function deleteOldContainers(args: IDeleteOldContainersArgs) {
	const { orgs = [] } = args;
	await pMap(orgs, deleteOldContainerVersionsForOrg);
}
