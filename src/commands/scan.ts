import { fetchTrustScore, fetchTrustScoreMock } from '../services/fetch-data';
import { getDependenciesAndPackageJson } from '../utils/dependencies';
import { THRESHOLD } from '../constants/global-constants';
import { writeFileSync } from 'fs';
import { jsonToCsv } from '../utils/json2csv';
import { execSync } from 'child_process';
import { formatTrustScoreMessage, hyperlink } from '../utils/common';
import {
  DependencyNode,
  LowTrustLibrary,
  ScanOptions,
  customHeaderMap,
} from '../interfaces/scan-interfaces';
import * as semver from 'semver';
import { AsciiTree } from 'oo-ascii-tree';
import ora from 'ora';

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
  console.log('\n A report has been created in the root folder of this project named trust_scores_report.csv');
}


export async function scanDependenciesOption(): Promise<void> {
  const commandOutput = execSync('npm ls --omit=dev --all --json', {
    encoding: 'utf8',
  });
  const parsedOutput = JSON.parse(commandOutput);
  const rootDependency: DependencyNode = {
    name: parsedOutput.name,
    version: parsedOutput.version,
    dependencies: mapDependencies(parsedOutput.dependencies),
  };
  const treeWithScores = await getDependencyTreeWithScores(rootDependency);
  treeWithScores.printTree();
}

export async function scanDefaultOption(packageJson: any, dependencies: { [key: string]: string }): Promise<LowTrustLibrary[]> {
  if (Object.keys(dependencies).length === 0) {
    console.log('No dependencies found.');
    return [];
  }

  const lowTrustLibraries: LowTrustLibrary[] = await Promise.all(Object.entries(dependencies).map(async ([library, version]) => {
    const trustScore = await getTrustScoreForDependency(library, version);
    if (trustScore && trustScore < THRESHOLD) {
      return { library, version: packageJson.dependencies[library], trustScore };
    }
  })).then(results => results.filter(Boolean) as LowTrustLibrary[]);

  printLowTrustLibrariesReport(lowTrustLibraries);

  return lowTrustLibraries;
}

function printLowTrustLibrariesReport(lowTrustLibraries: LowTrustLibrary[]) {
  if (lowTrustLibraries.length === 0) {
    console.log('All your dependencies have acceptable trust scores.');
    return;
  }

  console.warn('The following libraries have trust scores below the acceptable threshold:');
  lowTrustLibraries.forEach(({ library, version, trustScore }) => {
    console.warn(formatTrustScoreMessage(library, version, trustScore));
  });
  console.log(`For more information, visit ${hyperlink('http://localhost:3000', 'TrustSECO-portal')}.`);
}


async function getDependencyTreeWithScores(
  root: DependencyNode
): Promise<AsciiTree> {
  const trustScore = await fetchTrustScoreMock(root.name);

  const rootNode = new AsciiTree(
    formatTrustScoreMessage(root.name, root.version, trustScore)
  );

  if (root.dependencies) {
    for (const child of Object.values(root.dependencies)) {
      const childNode = await getDependencyTreeWithScores(child);
      rootNode.add(childNode);
    }
  }

  return rootNode;
}

async function getTrustScoreForDependency(library: string, version: string | undefined): Promise<number | undefined> {
  const cleanVersion = semver.valid(semver.coerce(version));
  return await fetchTrustScoreMock(library, cleanVersion ?? '');
}

function mapDependencies(
  deps: any
): { [key: string]: DependencyNode } | undefined {
  if (!deps) return undefined;

  let mappedDeps: { [key: string]: DependencyNode } = {};

  for (const [name, dep] of Object.entries(deps)) {
    mappedDeps[name] = {
      name: name,
      version: (dep as any).version,
      dependencies: mapDependencies((dep as any).dependencies),
    };
  }

  return mappedDeps;
}

export default scan;
