import { AsciiTree } from 'oo-ascii-tree';
import {
  fetchTrustScoreMock,
  getTransitiveDependencies,
} from '../services/fetch-data';
import { getNpmPackageVersion } from '../utils/npm';
import { startLoadingIndicator } from '../utils/loading-Indicator';
import { THRESHOLD } from '../constants/global-constants';

const processedDependencies = new Set<string>();

export async function viewTree(
  rootPackageName: string,
  rootPackageVersion: string
): Promise<void> {
  const resolvedVersion =
    rootPackageVersion || getNpmPackageVersion(rootPackageName);
  const stopLoadingIndicator = startLoadingIndicator();
  const rootTree = await fetchDependencyTree(rootPackageName, resolvedVersion);
  stopLoadingIndicator();
  rootTree.printTree();
}

async function fetchDependencyTree(
  packageName: string,
  version: string,
  depth = 0
): Promise<AsciiTree> {
  const packageId = `${packageName}@${version}`;
  if (processedDependencies.has(packageId)) {
    return new AsciiTree(`${packageName}@${version} (processed)`);
  }

  processedDependencies.add(packageId);

  if (depth > 3) {
    return new AsciiTree(packageId);
  }

  const packageDetails = await getTransitiveDependencies(packageName, version);
  const trustScore = await fetchTrustScoreMock(
    packageDetails.name,
    packageDetails.version
  );

  const rootNode = new AsciiTree(
    `${packageName}@${packageDetails.version} ` +
      (trustScore < THRESHOLD
        ? `\u001b[33mTrustScore:${trustScore}\u001b[0m`
        : `TrustScore:${trustScore}`)
  );

  const childNodesPromises = Object.entries(packageDetails.dependencies).map(
    async ([dep, version]) => {
      return fetchDependencyTree(dep, version, depth + 1);
    }
  );

  const childNodes = await Promise.all(childNodesPromises);

  childNodes.forEach((childNode) => rootNode.add(childNode));

  return rootNode;
}
