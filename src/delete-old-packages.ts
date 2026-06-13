import { reqAll, req } from './lib/github-rest';
import { pMap } from './helpers';

type IPackageVersion = {
	org: string;
	packageName: string;
	versionId: string;
};

async function getPackagesToDeleteForOrg(org: string) {
	const packages = await reqAll<IPackage>(`GET /orgs/${org}/packages`, {
		package_type: 'npm',
	});
	const packagesWithVersions = packages.filter((pkg) => pkg.version_count > 1);

	const packagesToDelete: IPackageVersion[] = [];
	const versionLists = await pMap(packagesWithVersions, async (pkg) => {
		const versions = await reqAll<IVersion>(
			`GET /orgs/${org}/packages/npm/${pkg.name}/versions`
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
	const { org, packageName, versionId } = pkg;
	await req(
		`DELETE /orgs/${org}/packages/npm/${packageName}/versions/${versionId}`
	);
	console.log(org, packageName, versionId);
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
