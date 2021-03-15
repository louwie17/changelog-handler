export interface ReleaseOptions {
	title: string;
	version: string;
	date: string;
	force: boolean;
	dryRun: boolean;
	cherryPick?: boolean;
	prNumbers?: string[];
	config?: string;
}
