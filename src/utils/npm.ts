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

// TODO: this should be added to every command, in order for the tool to work properly with the current backend implementation
export function getGithubNameFromNpm(packageName: string): string | undefined {
  const { execSync } = require('child_process');

  try {
    const repoUrl = execSync(`npm view ${packageName} repository.url`, {
      encoding: 'utf8',
    }).trim();
    const githubName = repoUrl.match(/github.com[/:](.+?\/(.+?))(?:\.git)?$/);
    return githubName[2];
  } catch (error: any) {
    console.error('Error fetching repository URL:', error.message);
  }
}
