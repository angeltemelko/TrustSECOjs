import { exec } from 'child_process';
import { promisify } from 'util';
import * as semver from 'semver'

export const execAsync = promisify(exec);

import {
  ApiTrustFact,
  PackageDetailsTransitiveDependencies,
  TrustFact,
  defaultPackage,
} from '../interfaces/api-interfaces';

const baseUrlDlt = 'http://localhost:3000/api/dlt/';

export async function fetchTrustScore(
  packageName: string,
  version: string
): Promise<number | undefined> {
  const response = await fetch(`package/${packageName}/trust-score/${version}`);

  if (!response.ok) throw Error('Failed to fetch trust score');

  const data = await response.json();

  return typeof data === 'number' ? data : undefined;
}

export async function fetchTrustScoreMock(
  packageName: string,
  version?: string
): Promise<number> {
  return await Promise.resolve((Math.random() * 100) | 0);
}

export async function fetchTrustFacts(
  packageName: string,
  version?: string
): Promise<TrustFact[]> {
  const fetchUrl = version
    ? `${baseUrlDlt}trust-facts/${packageName}/${version}`
    : `${baseUrlDlt}trust-facts/${packageName}`;
  const response = await fetch(fetchUrl);

  if (!response.ok) {
    throw new Error('Failed to fetch trust facts');
  }

  const data: { facts: ApiTrustFact[] } = await response.json();

  if (!data.facts) {
    return [];
  }

  const versionFilter = (item: ApiTrustFact) => item.version === version;
  return data.facts
    .filter(versionFilter)
    .map((item: ApiTrustFact) => parseTrustFact(item));
}

export async function fetchTrustFactsMock(
  name: string,
  version?: string
): Promise<TrustFact[]> {
  const trustFacts = [];
  const count = Math.floor(((name.length + 10) % 20) * Math.random());
  for (let i = 0; i < count; i += 1) {
    trustFacts[i] = {
      type: 'github stars',
      value: (i + 1).toString(),
    };
  }
  return trustFacts;
}

export async function getTransitiveDependencies(
  packageName: string,
  version: string
): Promise<PackageDetailsTransitiveDependencies> {
  const resolvedVersion = await resolveVersionRange(packageName, version);
  const packageVersion = resolvedVersion ? `@${resolvedVersion}` : '';
  const { stdout } = await execAsync(
    `npm view ${packageName}${packageVersion} version name dependencies --json`
  );

  const data = JSON.parse(stdout);

  return {
    version: data.version,
    name: data.name,
    dependencies: data.dependencies || {},
  };
}

export async function resolveVersionRange(packageName: string, versionRange: string): Promise<string> {
  if (!versionRange.includes('>=') && !versionRange.includes('<')) {
      return versionRange;  
  }

  const { stdout } = await execAsync(`npm view ${packageName} versions --json`);
  const allVersions: string[] = JSON.parse(stdout);
  
  const resolvedVersion = allVersions.reverse().find(version => semver.satisfies(version, versionRange));

  return resolvedVersion || versionRange;  
}

const parseTrustFact = (data: ApiTrustFact): TrustFact => ({
  ...defaultPackage,
  type: data.fact,
  value: data.factData,
});
