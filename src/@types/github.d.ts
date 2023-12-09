type IIssue = {
	id: string;
	number: number;
	repo: string;
};

type IContainer = {
	name: string;
};

type IVersion = {
	id: string;
	created_at: string;
	metadata: {
		container: { tags: string[] };
	};
};

type IWorkflowRun = {
	id: string;
	run_started_at: string;
	repository: {
		full_name: string;
	};
};

type IPackage = {
	name: string;
	version_count: number;
};

type IRelease = {
	id: string;
	created_at: string;
};

type IReference = {
	ref: string;
};
