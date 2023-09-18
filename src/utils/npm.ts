import { execSync } from 'child_process';

export function getNpmPackageVersion(packageName: string): string {
  try {
    const output = execSync(`npm view ${packageName} version`, {
      encoding: 'utf8',
    });
    return output.trim();
  } catch (err) {
    console.error(`Failed to get version for package ${packageName}`, err);
    return 'unknown';
  }
}
