import { Config } from './Config';
import { readConfig } from './readConfig';

export async function getConfig(
	defaultConfig: Config,
	extConfigPath?: string
): Promise<Config> {
	const extConfig = await readConfig(extConfigPath);
	if (!extConfig) {
		return defaultConfig;
	}
	return {
		...defaultConfig,
		...extConfig.config,
	};
}
