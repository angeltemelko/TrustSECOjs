import { AsciiTree } from 'oo-ascii-tree';
import {
  fetchTrustScoreMock,
  getTransitiveDependencies,
} from '../services/fetch-data';
import { getNpmPackageVersion } from '../utils/npm';
import { startLoadingIndicator } from '../utils/loading-Indicator';
import { THRESHOLD } from '../constants/global-constants';

const processedDependencies = new Set<string>();

const failedChecks: string[] = [];

export async function viewTree(
  rootPackageName: string,
  rootPackageVersion?: string
): Promise<void> {
  const resolvedVersion =
    rootPackageVersion || getNpmPackageVersion(rootPackageName);
  const stopLoadingIndicator = startLoadingIndicator();
  const rootTree = await fetchDependencyTree(rootPackageName, resolvedVersion);
  stopLoadingIndicator();
  rootTree.printTree();

  if (failedChecks.length > 0) {
    console.error(`Failed to check the following packages:`);
    failedChecks.forEach(pkg => console.error(`- ${pkg}`));
  }
}

async function fetchDependencyTree(
  packageName: string,
  version: string,
  depth = 0
): Promise<AsciiTree> {
  const packageId = `${packageName}@${version}`;
  if (processedDependencies.has(packageId)) {
    return new AsciiTree(`${packageName}@${version}`);
  }

  processedDependencies.add(packageId);

  if (depth > 2) {
    return new AsciiTree(packageId);
  }

  let packageDetails;
  let trustScore;
  
  try {
    packageDetails = await getTransitiveDependencies(packageName, version);
    trustScore = await fetchTrustScoreMock(
      packageDetails.name,
      packageDetails.version
    );
  } catch (error) {
    console.warn(`Error fetching details for ${packageId}. Skipping...`);
    failedChecks.push(packageId);
    return new AsciiTree(`${packageName}@${version} (error)`);
  }

  const rootNode = new AsciiTree(
    `${packageName}@${packageDetails.version} ` +
      (trustScore < THRESHOLD
        ? `\u001b[33mTrustScore:${trustScore}\u001b[0m`
        : `TrustScore:${trustScore}`)
  );

  const childNodesPromises = Object.entries(packageDetails.dependencies).map(
    async ([dep, version]: [string, string]) => {
      return fetchDependencyTree(dep, version, depth + 1);
    }
);


  const childNodes = await Promise.all(childNodesPromises);

  childNodes.forEach((childNode) => rootNode.add(childNode));

  return rootNode;
}
