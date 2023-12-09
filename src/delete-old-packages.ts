import { req } from './lib/github-rest';

type IPackageVersion = {
	org: string;
	packageName: string;
	versionId: string;
};

async function getPackagesToDeleteForOrg(org: string) {
	type Response = IPackage[];
	const packages = await req<Response>(`GET /orgs/${org}/packages`, {
		package_type: 'npm',
	}).then((data) => data.filter((pkg) => pkg.version_count > 1));
	if (!packages) return [];

	const packagesToDelete: IPackageVersion[] = [];
	for await (const pkg of packages) {
		type VersionsResponse = IVersion[];
		const versions = await req<VersionsResponse>(
			`GET /orgs/${org}/packages/npm/${pkg.name}/versions`
		).then((data) =>
			data.sort((a, b) => b.created_at.localeCompare(a.created_at))
		);

		const oldVersions = versions.map((version) => ({
			org,
			packageName: pkg.name,
			versionId: version.id,
		}));

		packagesToDelete.push(...oldVersions.slice(1));
	}

	return packagesToDelete as IPackageVersion[];
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
	for await (const version of versions) {
		await deletePackage(version);
	}
}

type IDeleteOldPackagesArgs = {
	orgs?: string[];
};

export async function deleteOldPackages(args: IDeleteOldPackagesArgs) {
	const { orgs = [] } = args;
	for await (const org of orgs) {
		await deleteOldPackagesForOrg(org);
	}
}
