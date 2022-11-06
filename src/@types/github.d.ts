export interface IIssue {
	id: string;
	number: number;
	repo: string;
}

export interface IContainer {
	name: string;
}

export interface IVersion {
	id: string;
	created_at: string;
	metadata: {
		container: { tags: string[] };
	};
}

export interface IWorkflowRun {
	id: string;
	run_started_at: string;
	repository: {
		full_name: string;
	};
}

export interface IPackage {
	name: string;
	version_count: number;
}

export interface IRelease {
	id: string;
	created_at: string;
}

export interface IReference {
	ref: string;
}
