import {
  fetchTrustScoreMock,
  getTransitiveDependencies,
} from '../services/fetch-data';
import * as semver from 'semver';
import { AsciiTree } from 'oo-ascii-tree';
import ora from 'ora';
import { formatTrustScoreMessage, getPackageId } from '../utils/common';

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
    failedChecks.forEach((failedLibraries) => console.error(`- ${failedLibraries}`));
  }
}

export async function fetchDependencyTree(packageName: string, version: string, depth = 0): Promise<AsciiTree> {
  const packageId = getPackageId(packageName, version);
  
  if (processedDependencies.has(packageId)) {
    const trustScore = processedDependencies.get(packageId);
    return new AsciiTree(formatTrustScoreMessage(packageName, version, trustScore));
  }

  let packageDetails;
  let trustScore;

  try {
    [packageDetails, trustScore] = await fetchPackageDetailsAndTrustScore(packageName, version);
    processedDependencies.set(packageId, trustScore);
  } catch (error) {
    console.warn(`Error fetching details for ${packageId}. Skipping...`);
    failedChecks.push(packageId);
    return new AsciiTree(`${packageName}@${version} (error)`);
  }

  const rootNode = new AsciiTree(formatTrustScoreMessage(packageName, packageDetails.version, trustScore));

  if (depth < 5) {
    const childNodes = await fetchChildNodes(packageDetails, depth);
    childNodes.forEach((childNode) => rootNode.add(childNode));
  }

  return rootNode;
}


async function fetchPackageDetailsAndTrustScore(packageName: string, version: string): Promise<[any, number | undefined]> {
  const packageDetails = await getTransitiveDependencies(packageName, version);
  const trustScore = await fetchTrustScoreMock(packageDetails.name, packageDetails.version);
  return [packageDetails, trustScore];
}

async function fetchChildNodes(packageDetails: any, depth: number): Promise<AsciiTree[]> {
  const childNodesPromises = Object.entries(packageDetails.dependencies).map(
    async ([dep, version]) => {
      return fetchDependencyTree(dep, String(version), depth + 1);
    }
  );  
  return await Promise.all(childNodesPromises);
}


