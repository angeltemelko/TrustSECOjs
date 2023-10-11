import { fetchTrustScore, fetchTrustScoreMock } from '../services/fetch-data';
import { getDependenciesAndPackageJson } from '../utils/dependencies';
import { THRESHOLD } from '../constants/global-constants';
import { writeFileSync } from 'fs';
import { jsonToCsv } from '../utils/json2csv';
import { execSync } from 'child_process';
import {
  formatTrustScoreMessage,
  getPackageId,
  hyperlink,
} from '../utils/common';
import {
  DependencyNode,
  LowTrustLibrary,
  ScanOptions,
  customHeaderMap,
} from '../interfaces/scan-interfaces';
import * as semver from 'semver';
import { AsciiTree } from 'oo-ascii-tree';
import ora from 'ora';

const processedDependencies = new Map<string, number | undefined>();
const memoizedSubtrees = new Map<string, DependencyNode>();

async function scan(options: ScanOptions): Promise<void> {
  const { packageJson, dependencies } = getDependenciesAndPackageJson();
  const spinner = ora('Scan may take a while').start();
  let lowTrustLibraries: LowTrustLibrary[] = [];

  if (options.dependencies) {
    await scanDependenciesOption();
  } else {
    lowTrustLibraries = await scanDefaultOption(packageJson, dependencies);
  }

  spinner.stop();
  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);

  if (options.report) {
    createReport(lowTrustLibraries);
  }
}

export function createReport(lowTrustLibraries: LowTrustLibrary[]) {
  const csv = jsonToCsv(lowTrustLibraries, customHeaderMap);
  writeFileSync('trust_scores_report.csv', csv);
  console.log(
    '\n A report has been created in the root folder of this project named trust_scores_report.csv'
  );
}

export async function scanDependenciesOption(): Promise<void> {
  const commandOutput = execSync('npm ls -prod --all --json', {
    encoding: 'utf8',
  });
  const parsedOutput = JSON.parse(commandOutput);

  const packageId = getPackageId(parsedOutput.name, parsedOutput.version);

  let rootDependency: DependencyNode;

  if (memoizedSubtrees.has(packageId)) {
    rootDependency = memoizedSubtrees.get(packageId) as DependencyNode;
  } else {
    rootDependency = {
      name: parsedOutput.name,
      version: parsedOutput.version,
      trustScore: processedDependencies.has(packageId)
        ? processedDependencies.get(packageId)
        : await fetchTrustScoreAndSetPackageId(
            parsedOutput.name,
            parsedOutput.version,
            packageId
          ),
      dependencies: await mapDependencies(parsedOutput.dependencies),
    };
    memoizedSubtrees.set(packageId, rootDependency);
  }

  const treeWithScores = await getDependencyTreeWithScores(rootDependency);
  treeWithScores.printTree();

  memoizedSubtrees.clear();
}

export async function scanDefaultOption(
  packageJson: any,
  dependencies: { [key: string]: string }
): Promise<LowTrustLibrary[]> {
  if (Object.keys(dependencies).length === 0) {
    console.log('No dependencies found.');
    return [];
  }

  const lowTrustLibraries: LowTrustLibrary[] = await Promise.all(
    Object.entries(dependencies).map(async ([library, version]) => {
      const trustScore = await getTrustScoreForDependency(library, version);
      if (trustScore && trustScore < THRESHOLD) {
        return {
          library,
          version: packageJson.dependencies[library],
          trustScore,
        };
      }
    })
  ).then((results) => results.filter(Boolean) as LowTrustLibrary[]);

  printLowTrustLibrariesReport(lowTrustLibraries);

  return lowTrustLibraries;
}

function printLowTrustLibrariesReport(lowTrustLibraries: LowTrustLibrary[]) {
  if (lowTrustLibraries.length === 0) {
    console.log('All your dependencies have acceptable trust scores.');
    return;
  }

  console.warn(
    'The following libraries have trust scores below the acceptable threshold:'
  );
  lowTrustLibraries.forEach(({ library, version, trustScore }) => {
    console.warn(formatTrustScoreMessage(library, version, trustScore));
  });
  console.log(
    `For more information, visit ${hyperlink(
      'http://localhost:3000',
      'TrustSECO-portal'
    )}.`
  );
}

async function getDependencyTreeWithScores(
  root: DependencyNode
): Promise<AsciiTree> {
  const rootNode = new AsciiTree(
    formatTrustScoreMessage(root.name, root.version, root.trustScore)
  );

  if (root.dependencies) {
    for (const child of Object.values(root.dependencies)) {
      const childNode = await getDependencyTreeWithScores(child);
      rootNode.add(childNode);
    }
  }

  return rootNode;
}

async function getTrustScoreForDependency(
  library: string,
  version: string | undefined
): Promise<number | undefined> {
  const cleanVersion = semver.valid(semver.coerce(version));
  return await fetchTrustScoreMock(library, cleanVersion ?? '');
}

async function mapDependencies(dependencies: Record<string, DependencyNode>): Promise<Record<string, DependencyNode>> {
  const mapped: Record<string, DependencyNode> = {};

  for (const [name, dep] of Object.entries(dependencies || {})) {
      const packageId = getPackageId(name, dep.version);

      if (memoizedSubtrees.has(packageId)) {
          mapped[name] = memoizedSubtrees.get(packageId) as DependencyNode;
          continue;
      }

      const trustScore = processedDependencies.has(packageId)
          ? processedDependencies.get(packageId)
          : await fetchTrustScoreAndSetPackageId(name, dep.version, packageId);

      const node: DependencyNode = {
          name,
          version: dep.version,
          trustScore,
          dependencies: await mapDependencies(dep.dependencies),
      };

      memoizedSubtrees.set(packageId, node);
      mapped[name] = node;
  }

  return mapped;
}

async function fetchTrustScoreAndSetPackageId(
  packageName: string,
  version: string,
  packageId: string
): Promise<number | undefined> {
  const trustScore = await fetchTrustScoreMock(packageName, version);
  processedDependencies.set(packageId, trustScore);
  return trustScore;
}

export default scan;
