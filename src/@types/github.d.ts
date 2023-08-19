interface IIssue {
	id: string;
	number: number;
	repo: string;
}

interface IContainer {
	name: string;
}

interface IVersion {
	id: string;
	created_at: string;
	metadata: {
		container: { tags: string[] };
	};
}

interface IWorkflowRun {
	id: string;
	run_started_at: string;
	repository: {
		full_name: string;
	};
}

interface IPackage {
	name: string;
	version_count: number;
}

interface IRelease {
	id: string;
	created_at: string;
}

interface IReference {
	ref: string;
}
