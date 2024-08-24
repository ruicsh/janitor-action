import { req } from './lib/github-rest';

type IContainerVersion = {
	org: string;
	packageName: string;
	versionId: string;
};

async function getContainerVersionsToDeleteForOrg(org: string) {
	type Response = IContainer[];
	const containers = await req<Response>(`GET /orgs/${org}/packages`, {
		package_type: 'container',
	});
	if (!containers) {
		return [];
	}

	const packages = [];
	for await (const container of containers) {
		type VersionsResponse = IVersion[];
		const versions = await req<VersionsResponse>(
			`GET /orgs/${org}/packages/container/${container.name}/versions`
		);

		const packageVersions = versions.map((version) => ({
			org,
			packageName: container.name,
			versionId: version.id,
		}));

		packages.push(...packageVersions.slice(1));
	}

	const versionsToDelete = [];
	for await (const pkg of packages) {
		const { packageName, versionId } = pkg;
		type VersionResponse = IVersion;
		const version = await req<VersionResponse>(
			`GET /orgs/${org}/packages/container/${packageName}/versions/${versionId}`
		);

		if (!version.metadata.container.tags.includes('latest')) {
			versionsToDelete.push(pkg);
		}
	}

	return versionsToDelete;
}

async function deleteContainerVersion(pkg: IContainerVersion) {
	const { org, packageName, versionId } = pkg;
	const r = await req(
		`DELETE /orgs/${org}/packages/container/${packageName}/versions/${versionId}`
	);
	console.log(org, packageName, versionId);

	console.log(r);
}

async function deleteOldContainerVersionsForOrg(org: string): Promise<void> {
	const versions = await getContainerVersionsToDeleteForOrg(org);
	console.log(`Found ${versions.length} old containers on ${org} to delete`);
	for await (const version of versions) {
		await deleteContainerVersion(version);
	}
}

type IDeleteOldContainersArgs = {
	orgs?: string[];
};

export async function deleteOldContainers(args: IDeleteOldContainersArgs) {
	const { orgs = [] } = args;

	for await (const org of orgs) {
		await deleteOldContainerVersionsForOrg(org);
	}
}
