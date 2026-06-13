import { getOctokit } from './lib/octokit';
import { pMap } from './helpers';

type IPackageVersion = {
	org: string;
	packageName: string;
	versionId: number;
};

async function getPackagesToDeleteForOrg(org: string) {
	const octokit = getOctokit();

	const packages = await octokit.paginate(
		octokit.rest.packages.listPackagesForOrganization,
		{ org, package_type: 'npm', per_page: 100 }
	);
	const packagesWithVersions = packages.filter((pkg) => pkg.version_count > 1);

	const packagesToDelete: IPackageVersion[] = [];
	const versionLists = await pMap(packagesWithVersions, async (pkg) => {
		const versions = await octokit.paginate(
			octokit.rest.packages.getAllPackageVersionsForPackageOwnedByOrg,
			{ org, package_type: 'npm', package_name: pkg.name, per_page: 100 }
		);
		versions.sort((a, b) => b.created_at.localeCompare(a.created_at));
		return versions.slice(1).map((version) => ({
			org,
			packageName: pkg.name,
			versionId: version.id,
		}));
	});

	for (const versions of versionLists) {
		packagesToDelete.push(...versions);
	}

	return packagesToDelete;
}

async function deletePackage(pkg: IPackageVersion) {
	const octokit = getOctokit();
	try {
		await octokit.rest.packages.deletePackageVersionForOrg({
			org: pkg.org,
			package_type: 'npm',
			package_name: pkg.packageName,
			package_version_id: pkg.versionId,
		});
		console.log(pkg.org, pkg.packageName, pkg.versionId);
	} catch (error) {
		console.error(
			`Failed to delete package version ${pkg.org}/${pkg.packageName}#${pkg.versionId}:`,
			error,
		);
	}
}

async function deleteOldPackagesForOrg(org: string): Promise<void> {
	const versions = await getPackagesToDeleteForOrg(org);
	console.log(`Found ${versions.length} old packages on ${org} to delete`);
	await pMap(versions, deletePackage);
}

type IDeleteOldPackagesArgs = {
	orgs?: string[];
};

export async function deleteOldPackages(args: IDeleteOldPackagesArgs) {
	const { orgs = [] } = args;
	await pMap(orgs, deleteOldPackagesForOrg);
}
