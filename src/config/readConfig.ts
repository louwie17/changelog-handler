import { existsSync, lstatSync } from 'fs';
import { dirname, isAbsolute, resolve } from 'path';
import { interopRequireDefault } from '../util/interopRequireDefault';
import type { Service } from 'ts-node';

import { Config } from './Config';
import { getAbsolutePath } from '../util';

type ReadConfig = {
  configPath: string;
  config?: Config;
};

const JSON_EXT = 'json';
const TS_EXT = 'ts';
const JS_EXT = 'js';
const CONFIG_NAME = '.changelog.config';

export async function readConfig(
  configPath?: string
): Promise<ReadConfig | null> {
  let rawOptions: Config | (() => Config);
  const potentialConfigPaths = [
    configPath,
    ...[JSON_EXT, JS_EXT, TS_EXT].map((ext) => CONFIG_NAME + '.' + ext),
  ];
  let actualConfigPath;
  for (const path of potentialConfigPaths) {
    if (!path) {
      continue;
    }
    actualConfigPath = getAbsolutePath(path);
    if (actualConfigPath) {
      break;
    }
  }
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

  try {
    if (isTS) {
      configObject = loadTSConfigFile(configPath);
    } else if (isJS) {
      configObject = loadJSConfigFile(configPath);
    } else {
      configObject = __non_webpack_require__(configPath);
    }
  } catch (error) {
    if (isJSON) {
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
    if (!isAbsolute(configObject.rootDir)) {
      // otherwise, we'll resolve it relative to the file's __dirname
      configObject.rootDir = resolve(dirname(configPath), configObject.rootDir);
    }
  } else {
    // If rootDir is not there, we'll set it to this file's __dirname
    configObject.rootDir = dirname(configPath);
  }

  return configObject;
}

// Load the TypeScript configuration
async function loadTSConfigFile(
  configPath: string
): Promise<Config | (() => Config)> {
  let registerer: Service;

  // Register TypeScript compiler instance
  try {
    registerer = __non_webpack_require__('ts-node').register({
      compilerOptions: {
        module: 'CommonJS',
      },
    });
  } catch (e) {
    if (e.code === 'MODULE_NOT_FOUND') {
      throw new Error(
        `'ts-node' is required for the TypeScript configuration files. Make sure it is installed\nError: ${e.message}`
      );
    }

    console.log(e);
    throw e;
  }

  registerer.enabled(true);

  let configObject = interopRequireDefault(
    __non_webpack_require__(configPath)
  ).default;

  // In case the config is a function which imports more Typescript code
  if (typeof configObject === 'function') {
    configObject = await configObject();
  }

  registerer.enabled(false);

  return configObject;
}

async function loadJSConfigFile(configPath: string) {
  let configObject = interopRequireDefault(
    __non_webpack_require__(configPath)
  ).default;

  // In case the config is a function which imports more Typescript code
  if (typeof configObject === 'function') {
    configObject = await configObject();
  }

  return configObject;
}
