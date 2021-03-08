import { existsSync, lstatSync } from 'fs';
import * as path from 'path';
import interopRequireDefault from '../util/interopRequireDefault';
import type { Register } from 'ts-node';

import { Config } from './Config';

type ReadConfig = {
	configPath: string;
	config?: Config;
};

const JSON_EXT = 'json';
const TS_EXT = 'ts';
const JS_EXT = 'js';
const CONFIG_NAME = '.changelog.config.ts';

export async function readConfig(
	configPath?: string
): Promise<ReadConfig | null> {
	let rawOptions: Config | (() => Config);
	const actualConfigPath = getConfigPath(
		configPath || CONFIG_NAME,
		process.cwd()
	);
	if (!actualConfigPath) {
		return null;
	}

	rawOptions = await readConfigFileAndSetRootDir(actualConfigPath);

	if (rawOptions && typeof rawOptions === 'function') {
		rawOptions = rawOptions();
	}

	return {
		configPath: actualConfigPath,
		config: rawOptions,
	};
}

function isFile(filePath: string) {
	return existsSync(filePath) && !lstatSync(filePath).isDirectory();
}

function getConfigPath(configPath: string, cwd: string) {
	const absolutePath = path.isAbsolute(configPath)
		? configPath
		: path.resolve(cwd, configPath);

	if (isFile(absolutePath)) {
		return absolutePath;
	}
}

// Read the configuration and set its `rootDir`
// 1. If it's a `package.json` file, we look into its "jest" property
// 2. If it's a `jest.config.ts` file, we use `ts-node` to transpile & require it
// 3. For any other file, we just require it. If we receive an 'ERR_REQUIRE_ESM'
//    from node, perform a dynamic import instead.
export default async function readConfigFileAndSetRootDir(
	configPath: string
): Promise<Config | (() => Config)> {
	const isTS = configPath.endsWith(TS_EXT);
	const isJS = configPath.endsWith(JS_EXT);
	const isJSON = configPath.endsWith(JSON_EXT);
	let configObject;

	console.log(configPath);
	try {
		if (isTS) {
			configObject = await loadTSConfigFile(configPath);
		} else if (isJS) {
			configObject = await loadJSConfigFile(configPath);
		} else {
			configObject = require(configPath);
		}
	} catch (error) {
		console.log(error);
		if (error.code === 'ERR_REQUIRE_ESM') {
			try {
				const importedConfig = await import(configPath);

				if (!importedConfig.default) {
					throw new Error(
						`Failed to load config file ${configPath} - did you use a default export?`
					);
				}

				configObject = importedConfig.default;
			} catch (innerError) {
				if (innerError.message === 'Not supported') {
					throw new Error(
						`Your version of Node does not support dynamic import - please enable it or use a .cjs file extension for file ${configPath}`
					);
				}

				throw innerError;
			}
		} else if (isJSON) {
			throw new Error(`Failed to parse config file ${configPath}\n`);
		} else if (isTS || isJS) {
			throw new Error(
				`Failed to parse the TypeScript config file ${configPath}\n` +
					`  ${error}`
			);
		} else {
			throw error;
		}
	}

	if (configObject && configObject.rootDir) {
		// We don't touch it if it has an absolute path specified
		if (!path.isAbsolute(configObject.rootDir)) {
			// otherwise, we'll resolve it relative to the file's __dirname
			configObject.rootDir = path.resolve(
				path.dirname(configPath),
				configObject.rootDir
			);
		}
	} else {
		// If rootDir is not there, we'll set it to this file's __dirname
		configObject.rootDir = path.dirname(configPath);
	}

	return configObject;
}

// Load the TypeScript configuration
async function loadTSConfigFile(
	configPath: string
): Promise<Config | (() => Config)> {
	let registerer: Register;

	// Register TypeScript compiler instance
	try {
		registerer = require('ts-node').register({
			compilerOptions: {
				module: 'CommonJS',
			},
		});
	} catch (e) {
		if (e.code === 'MODULE_NOT_FOUND') {
			throw new Error(
				`Jest: 'ts-node' is required for the TypeScript configuration files. Make sure it is installed\nError: ${e.message}`
			);
		}

		throw e;
	}

	registerer.enabled(true);

	let configObject = interopRequireDefault(require(configPath)).default;

	// In case the config is a function which imports more Typescript code
	if (typeof configObject === 'function') {
		configObject = await configObject();
	}

	registerer.enabled(false);

	return configObject;
}

async function loadJSConfigFile(configPath: string) {
	let configObject = interopRequireDefault(require(configPath)).default;

	// In case the config is a function which imports more Typescript code
	if (typeof configObject === 'function') {
		configObject = await configObject();
	}

	return configObject;
}
