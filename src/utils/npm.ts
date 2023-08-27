import { execSync } from 'child_process';

export function getNpmPackageVersion(library: string): string {
  try {
    const output = execSync(`npm view ${library} version`, {
      encoding: 'utf8',
    });
    return output.trim();
  } catch (err) {
    console.error(`Failed to get version for package ${library}`, err);
    return 'unknown';
  }
}
