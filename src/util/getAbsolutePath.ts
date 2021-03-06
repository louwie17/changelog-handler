import { existsSync, lstatSync } from 'fs';
import { isAbsolute, resolve } from 'path';

export function getAbsolutePath(path: string, rootDir = ''): string | null {
  const absolutePath =
    isAbsolute(path) && !rootDir
      ? path
      : resolve(rootDir || process.cwd(), path);

  if (isFile(absolutePath)) {
    return absolutePath;
  }
  return null;
}
function isFile(filePath: string) {
  return existsSync(filePath) && !lstatSync(filePath).isDirectory();
}
