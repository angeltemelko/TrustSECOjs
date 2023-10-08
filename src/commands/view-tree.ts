import {
  fetchTrustScoreMock,
  getTransitiveDependencies,
} from '../services/fetch-data';
import { THRESHOLD } from '../constants/global-constants';
import * as semver from 'semver';
import { AsciiTree } from 'oo-ascii-tree';
import ora from 'ora';

const processedDependencies = new Map<string, number | undefined>();

const failedChecks: string[] = [];

export async function viewTree(
  rootPackageName: string,
  rootPackageVersion?: string
): Promise<void> {
  const cleanedVersion = semver.valid(semver.coerce(rootPackageVersion)) || '';
  const spinner = ora('Transitive scan may take a while').start();
  const rootTree = await fetchDependencyTree(rootPackageName, cleanedVersion);
  spinner.stop();
  rootTree.printTree();

  if (failedChecks.length > 0) {
    console.error(`Failed to check the following packages:`);
    failedChecks.forEach((pkg) => console.error(`- ${pkg}`));
  }
}

async function fetchDependencyTree(
  packageName: string,
  version: string,
  depth = 0
): Promise<AsciiTree> {
  const packageId = `${packageName}@${version}`;

  if (processedDependencies.has(packageId)) {
    const trustScore = processedDependencies.get(packageId);
    return new AsciiTree(
      `${packageName}@${version} ` +
        (trustScore! < THRESHOLD
          ? `\u001b[33mTrustScore:${trustScore}\u001b[0m`
          : `TrustScore:${trustScore}`)
    );
  }

  let packageDetails;
  let trustScore;

  try {
    packageDetails = await getTransitiveDependencies(packageName, version);
    trustScore = await fetchTrustScoreMock(
      packageDetails.name,
      packageDetails.version
    );
    processedDependencies.set(packageId, trustScore);
  } catch (error) {
    console.warn(`Error fetching details for ${packageId}. Skipping...`);
    failedChecks.push(packageId);
    return new AsciiTree(`${packageName}@${version} (error)`);
  }

  const rootNode = new AsciiTree(
    `${packageName}@${packageDetails.version} ` + (trustScore !== undefined
      ? trustScore < THRESHOLD
        ? `\u001b[33mTrustScore:${trustScore}\u001b[0m`
        : `TrustScore:${trustScore}`
      : 'TrustScore:undefined')
  );
  

  if (depth < 5) {
    const childNodesPromises = Object.entries(packageDetails.dependencies).map(
      async ([dep, version]: [string, string]) => {
        return fetchDependencyTree(dep, version, depth + 1);
      }
    );

    const childNodes = await Promise.all(childNodesPromises);

    childNodes.forEach((childNode) => rootNode.add(childNode));
  }

  return rootNode;
}
