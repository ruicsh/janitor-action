import { reqAll, req } from './lib/github-rest';
import { pMap } from './helpers';

type IContainerVersion = {
	org: string;
	packageName: string;
	versionId: string;
};

async function getContainerVersionsToDeleteForOrg(org: string) {
	const containers = await reqAll<IContainer>(`GET /orgs/${org}/packages`, {
		package_type: 'container',
	});

	const versionLists = await pMap(containers, async (container) => {
		const versions = await reqAll<IVersion>(
			`GET /orgs/${org}/packages/container/${container.name}/versions`
		);
		versions.sort((a, b) => b.created_at.localeCompare(a.created_at));

		return versions.slice(1).map((version) => ({
			org,
			packageName: container.name,
			versionId: version.id,
		}));
	});

	const allPackageVersions: IContainerVersion[] = [];
	for (const list of versionLists) {
		allPackageVersions.push(...list);
	}

	const versionsToDelete = await pMap(allPackageVersions, async (pkg) => {
		const version = await req<IVersion>(
			`GET /orgs/${org}/packages/container/${pkg.packageName}/versions/${pkg.versionId}`
		);
		if (version?.metadata?.container?.tags?.includes('latest')) {
			return null;
		}
		return pkg;
	});

	return versionsToDelete.filter((v): v is IContainerVersion => v !== null);
}

async function deleteContainerVersion(pkg: IContainerVersion) {
	const { org, packageName, versionId } = pkg;
	await req(
		`DELETE /orgs/${org}/packages/container/${packageName}/versions/${versionId}`
	);
	console.log(org, packageName, versionId);
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
